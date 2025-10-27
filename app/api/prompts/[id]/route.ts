import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updatePromptSchema } from "@/lib/validations/prompt";
import { z } from "zod";

type RouteContext = {
  params: {
    id: string;
  };
};

// GET /api/prompts/[id] - Get a single prompt
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const prompt = await prisma.prompt.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
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
        workflowSteps: {
          include: {
            workflow: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            workflowSteps: true,
            pinnedBy: true,
          },
        },
      },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    // Transform response
    const transformedPrompt = {
      ...prompt,
      tags: prompt.tags.map((pt) => pt.tag),
      workflows: prompt.workflowSteps.map((ws) => ws.workflow),
      isPinnedByUser: prompt._count.pinnedBy > 0,
    };

    return NextResponse.json({ prompt: transformedPrompt });
  } catch (error) {
    console.error("Error fetching prompt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/prompts/[id] - Update a prompt
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if prompt exists and belongs to user
    const existingPrompt = await prisma.prompt.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingPrompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = updatePromptSchema.parse(body);

    // Prepare update data
    const updateData: any = {};

    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.content !== undefined) {
      updateData.content = validatedData.content;
      // Increment version if content changed
      if (validatedData.content !== existingPrompt.content) {
        updateData.version = existingPrompt.version + 1;
      }
    }
    if (validatedData.categoryId !== undefined) updateData.categoryId = validatedData.categoryId;
    if (validatedData.isPinned !== undefined) updateData.isPinned = validatedData.isPinned;
    if (validatedData.isArchived !== undefined) updateData.isArchived = validatedData.isArchived;
    if (validatedData.metadata !== undefined) updateData.metadata = validatedData.metadata;

    // Update prompt
    const prompt = await prisma.prompt.update({
      where: {
        id: params.id,
      },
      data: updateData,
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

    return NextResponse.json({
      message: "Prompt updated successfully",
      prompt: {
        ...prompt,
        tags: prompt.tags.map((pt) => pt.tag),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating prompt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/prompts/[id] - Delete a prompt
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if prompt exists and belongs to user
    const existingPrompt = await prisma.prompt.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            workflowSteps: true,
          },
        },
      },
    });

    if (!existingPrompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    // Check if prompt is used in workflows
    if (existingPrompt._count.workflowSteps > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete prompt",
          message: `This prompt is used in ${existingPrompt._count.workflowSteps} workflow step(s). Remove it from workflows first or archive it instead.`,
        },
        { status: 400 }
      );
    }

    // Delete prompt (cascade will handle related records)
    await prisma.prompt.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      message: "Prompt deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
