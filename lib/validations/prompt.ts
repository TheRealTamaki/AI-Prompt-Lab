import { z } from "zod";

// Schema for creating a new prompt
export const createPromptSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional().nullable(),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().optional().nullable(),
  isPinned: z.boolean().optional().default(false),
  metadata: z.record(z.any()).optional().nullable(),
});

// Schema for updating an existing prompt
export const updatePromptSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").optional(),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional().nullable(),
  content: z.string().min(1, "Content is required").optional(),
  categoryId: z.string().optional().nullable(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  metadata: z.record(z.any()).optional().nullable(),
});

// Schema for query parameters (filtering, sorting, pagination)
export const promptQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  isPinned: z.coerce.boolean().optional(),
  isArchived: z.coerce.boolean().optional().default(false),
  sortBy: z.enum(["createdAt", "updatedAt", "title"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// TypeScript types inferred from schemas
export type CreatePromptInput = z.infer<typeof createPromptSchema>;
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>;
export type PromptQueryParams = z.infer<typeof promptQuerySchema>;
