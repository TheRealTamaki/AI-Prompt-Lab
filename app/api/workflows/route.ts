import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createWorkflowSchema,
  workflowQuerySchema,
} from "@/lib/validations/workflow";
import { z } from "zod";

// GET /api/workflows - List all workflows for the authenticated user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      isActive: searchParams.get("isActive"),
      isArchived: searchParams.get("isArchived"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    };

    // Validate query parameters
    const validatedParams = workflowQuerySchema.parse(queryParams);

    // Build where clause
    const where: any = {
      userId: session.user.id,
      isArchived: validatedParams.isArchived,
    };

    if (validatedParams.search) {
      where.OR = [
        { name: { contains: validatedParams.search, mode: "insensitive" } },
        { description: { contains: validatedParams.search, mode: "insensitive" } },
      ];
    }

    if (validatedParams.isActive !== undefined) {
      where.isActive = validatedParams.isActive;
    }

    // Calculate pagination
    const skip = (validatedParams.page - 1) * validatedParams.limit;

    // Fetch workflows with pagination
    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where,
        include: {
          steps: {
            orderBy: {
              order: "asc",
            },
            include: {
              prompt: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },
            },
          },
          _count: {
            select: {
              steps: true,
            },
          },
        },
        orderBy: {
          [validatedParams.sortBy]: validatedParams.sortOrder,
        },
        skip,
        take: validatedParams.limit,
      }),
      prisma.workflow.count({ where }),
    ]);

    // Transform the response to flatten tags
    const transformedWorkflows = workflows.map((workflow) => ({
      ...workflow,
      tags: workflow.tags.map((wt) => wt.tag),
      stepCount: workflow._count.steps,
    }));

    return NextResponse.json({
      workflows: transformedWorkflows,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages: Math.ceil(total / validatedParams.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error fetching workflows:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/workflows - Create a new workflow
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = createWorkflowSchema.parse(body);

    // Validate that referenced prompts exist and belong to user
    const promptIds = validatedData.steps
      .filter((step) => step.promptId)
      .map((step) => step.promptId as string);

    if (promptIds.length > 0) {
      const prompts = await prisma.prompt.findMany({
        where: {
          id: { in: promptIds },
          userId: session.user.id,
        },
        select: { id: true },
      });

      if (prompts.length !== promptIds.length) {
        return NextResponse.json(
          { error: "One or more referenced prompts not found or not owned by user" },
          { status: 400 }
        );
      }
    }

    // Create workflow with steps in a transaction
    const workflow = await prisma.$transaction(async (tx) => {
      // Create workflow
      const newWorkflow = await tx.workflow.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          isActive: validatedData.isActive ?? true,
          metadata: validatedData.metadata,
          userId: session.user.id,
        },
      });

      // Create workflow steps
      await tx.workflowStep.createMany({
        data: validatedData.steps.map((step) => ({
          workflowId: newWorkflow.id,
          order: step.order,
          name: step.name,
          description: step.description,
          promptId: step.promptId,
          promptText: step.promptText,
          config: step.config,
        })),
      });

      // Fetch complete workflow with steps
      return await tx.workflow.findUnique({
        where: { id: newWorkflow.id },
        include: {
          steps: {
            orderBy: { order: "asc" },
            include: {
              prompt: {
                select: {
                  id: true,
                  title: true,
                  content: true,
                },
              },
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        message: "Workflow created successfully",
        workflow: {
          ...workflow,
          tags: workflow?.tags.map((wt) => wt.tag) || [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating workflow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
