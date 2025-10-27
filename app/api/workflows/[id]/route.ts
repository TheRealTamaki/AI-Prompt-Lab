import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateWorkflowSchema } from "@/lib/validations/workflow";
import { z } from "zod";

type RouteContext = {
  params: {
    id: string;
  };
};

// GET /api/workflows/[id] - Get a single workflow
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workflow = await prisma.workflow.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        steps: {
          orderBy: { order: "asc" },
          include: {
            prompt: {
              select: {
                id: true,
                title: true,
                content: true,
                version: true,
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
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    // Transform response
    const transformedWorkflow = {
      ...workflow,
      tags: workflow.tags.map((wt) => wt.tag),
      stepCount: workflow._count.steps,
    };

    return NextResponse.json({ workflow: transformedWorkflow });
  } catch (error) {
    console.error("Error fetching workflow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/workflows/[id] - Update a workflow
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if workflow exists and belongs to user
    const existingWorkflow = await prisma.workflow.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        steps: true,
      },
    });

    if (!existingWorkflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = updateWorkflowSchema.parse(body);

    // Validate referenced prompts if steps are being updated
    if (validatedData.steps) {
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
    }

    // Update workflow in a transaction
    const workflow = await prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: any = {};
      if (validatedData.name !== undefined) updateData.name = validatedData.name;
      if (validatedData.description !== undefined) updateData.description = validatedData.description;
      if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
      if (validatedData.isArchived !== undefined) updateData.isArchived = validatedData.isArchived;
      if (validatedData.metadata !== undefined) updateData.metadata = validatedData.metadata;

      // Update workflow
      const updatedWorkflow = await tx.workflow.update({
        where: { id: params.id },
        data: updateData,
      });

      // Update steps if provided
      if (validatedData.steps) {
        // Delete existing steps
        await tx.workflowStep.deleteMany({
          where: { workflowId: params.id },
        });

        // Create new steps
        await tx.workflowStep.createMany({
          data: validatedData.steps.map((step) => ({
            workflowId: params.id,
            order: step.order,
            name: step.name,
            description: step.description,
            promptId: step.promptId,
            promptText: step.promptText,
            config: step.config,
          })),
        });
      }

      // Fetch complete workflow
      return await tx.workflow.findUnique({
        where: { id: params.id },
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

    return NextResponse.json({
      message: "Workflow updated successfully",
      workflow: {
        ...workflow,
        tags: workflow?.tags.map((wt) => wt.tag) || [],
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating workflow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/workflows/[id] - Delete a workflow
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if workflow exists and belongs to user
    const existingWorkflow = await prisma.workflow.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingWorkflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    // Delete workflow (cascade will handle steps)
    await prisma.workflow.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      message: "Workflow deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
