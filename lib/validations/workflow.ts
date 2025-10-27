import { z } from "zod";

// Schema for workflow step
export const workflowStepSchema = z.object({
  id: z.string().optional(), // For existing steps during updates
  order: z.number().int().min(0),
  name: z.string().min(1, "Step name is required").max(200),
  description: z.string().max(1000).optional().nullable(),
  promptId: z.string().optional().nullable(),
  promptText: z.string().optional().nullable(),
  config: z.record(z.any()).optional().nullable(),
}).refine(
  (data) => data.promptId || data.promptText,
  {
    message: "Either promptId or promptText must be provided",
    path: ["promptId"],
  }
);

// Schema for creating a new workflow
export const createWorkflowSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name must be less than 200 characters"),
  description: z.string().max(2000, "Description must be less than 2000 characters").optional().nullable(),
  isActive: z.boolean().optional().default(true),
  metadata: z.record(z.any()).optional().nullable(),
  steps: z.array(workflowStepSchema).min(1, "At least one step is required"),
});

// Schema for updating an existing workflow
export const updateWorkflowSchema = z.object({
  name: z.string().min(1, "Name is required").max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  metadata: z.record(z.any()).optional().nullable(),
  steps: z.array(workflowStepSchema).optional(),
});

// Schema for query parameters (filtering, sorting, pagination)
export const workflowQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  isArchived: z.coerce.boolean().optional().default(false),
  sortBy: z.enum(["createdAt", "updatedAt", "name"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// TypeScript types inferred from schemas
export type WorkflowStep = z.infer<typeof workflowStepSchema>;
export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;
export type WorkflowQueryParams = z.infer<typeof workflowQuerySchema>;
