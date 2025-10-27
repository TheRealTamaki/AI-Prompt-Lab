import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createPromptSchema,
  promptQuerySchema,
} from "@/lib/validations/prompt";
import { z } from "zod";

// GET /api/prompts - List all prompts for the authenticated user
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
      categoryId: searchParams.get("categoryId"),
      isPinned: searchParams.get("isPinned"),
      isArchived: searchParams.get("isArchived"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    };

    // Validate query parameters
    const validatedParams = promptQuerySchema.parse(queryParams);

    // Build where clause
    const where: any = {
      userId: session.user.id,
      isArchived: validatedParams.isArchived,
    };

    if (validatedParams.search) {
      where.OR = [
        { title: { contains: validatedParams.search, mode: "insensitive" } },
        { description: { contains: validatedParams.search, mode: "insensitive" } },
        { content: { contains: validatedParams.search, mode: "insensitive" } },
      ];
    }

    if (validatedParams.categoryId) {
      where.categoryId = validatedParams.categoryId;
    }

    if (validatedParams.isPinned !== undefined) {
      where.isPinned = validatedParams.isPinned;
    }

    // Calculate pagination
    const skip = (validatedParams.page - 1) * validatedParams.limit;

    // Fetch prompts with pagination
    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
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
              workflowSteps: true,
            },
          },
        },
        orderBy: {
          [validatedParams.sortBy]: validatedParams.sortOrder,
        },
        skip,
        take: validatedParams.limit,
      }),
      prisma.prompt.count({ where }),
    ]);

    // Transform the response to flatten tags
    const transformedPrompts = prompts.map((prompt) => ({
      ...prompt,
      tags: prompt.tags.map((pt) => pt.tag),
      usedInWorkflows: prompt._count.workflowSteps,
    }));

    return NextResponse.json({
      prompts: transformedPrompts,
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

    console.error("Error fetching prompts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/prompts - Create a new prompt
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
    const validatedData = createPromptSchema.parse(body);

    // Create prompt
    const prompt = await prisma.prompt.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        content: validatedData.content,
        categoryId: validatedData.categoryId,
        isPinned: validatedData.isPinned || false,
        metadata: validatedData.metadata,
        userId: session.user.id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
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

    return NextResponse.json(
      {
        message: "Prompt created successfully",
        prompt: {
          ...prompt,
          tags: prompt.tags.map((pt) => pt.tag),
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

    console.error("Error creating prompt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
