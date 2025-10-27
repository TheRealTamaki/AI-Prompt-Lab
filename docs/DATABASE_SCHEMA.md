# AI Prompt Lab - Database Schema Documentation

## Overview

This document describes the complete database schema for AI Prompt Lab. The schema is designed to support prompt management, multi-step workflows, tagging, categorization, and user preferences.

## Schema Diagram

```
┌─────────────┐
│    User     │
│ ─────────── │
│ id (PK)     │
│ name        │
│ email       │
│ password    │◄────────────┐
│ ...         │             │
└─────────────┘             │
      │                     │
      │ 1:N                 │
      ▼                     │
┌─────────────┐             │
│   Prompt    │             │
│ ─────────── │             │
│ id (PK)     │             │
│ title       │             │
│ description │             │
│ content     │             │
│ version     │             │
│ userId (FK) │─────────────┘
│ categoryId  │
│ isPinned    │
│ isArchived  │
│ metadata    │
└─────────────┘
      │
      │ N:M
      ▼
┌─────────────┐       ┌─────────────┐
│ PromptTag   │ N:M   │     Tag     │
│ ─────────── │◄─────►│ ─────────── │
│ promptId    │       │ id (PK)     │
│ tagId       │       │ name        │
└─────────────┘       │ color       │
                      │ userId (FK) │
                      └─────────────┘
                            │
                            │ N:M
                            ▼
┌─────────────┐       ┌─────────────┐
│  Workflow   │       │ WorkflowTag │
│ ─────────── │       │ ─────────── │
│ id (PK)     │◄──────┤ workflowId  │
│ name        │       │ tagId       │
│ description │       └─────────────┘
│ userId (FK) │
│ isActive    │
│ isArchived  │
└─────────────┘
      │
      │ 1:N
      ▼
┌──────────────┐
│ WorkflowStep │
│ ──────────── │
│ id (PK)      │
│ workflowId   │
│ promptId     │
│ order        │
│ name         │
│ promptText   │
│ config       │
└──────────────┘

┌─────────────┐       ┌──────────────┐
│  Category   │       │ PinnedPrompt │
│ ─────────── │       │ ──────────── │
│ id (PK)     │       │ id (PK)      │
│ name        │       │ userId (FK)  │
│ description │       │ promptId (FK)│
│ userId (FK) │       │ order        │
│ parentId    │◄──┐   └──────────────┘
└─────────────┘   │
      │           │
      └───────────┘
      (self-referencing)
```

## Entity Descriptions

### Core Entities

#### User
The main user entity that owns all prompts, workflows, tags, and categories.

**Fields:**
- `id` (String, PK): Unique identifier (CUID)
- `name` (String, nullable): User's display name
- `email` (String, unique): User's email address
- `emailVerified` (DateTime, nullable): Email verification timestamp
- `image` (String, nullable): Profile image URL
- `password` (String): Hashed password (bcrypt)
- `createdAt` (DateTime): Account creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- Has many: Prompts, Workflows, Tags, Categories, PinnedPrompts, Accounts, Sessions

---

#### Prompt
Stores individual AI prompts with metadata.

**Fields:**
- `id` (String, PK): Unique identifier (CUID)
- `title` (String): Prompt title
- `description` (String, nullable): Detailed description
- `content` (Text): The actual prompt content
- `version` (Int, default: 1): Version number for tracking changes
- `userId` (String, FK): Owner reference
- `categoryId` (String, FK, nullable): Optional category
- `isPinned` (Boolean, default: false): Quick access flag
- `isArchived` (Boolean, default: false): Archival status
- `metadata` (JSON, nullable): Custom metadata storage
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last modification timestamp

**Relations:**
- Belongs to: User, Category (optional)
- Has many: PromptTags, WorkflowSteps, PinnedPrompts

**Indexes:**
- `userId` - Fast user-specific queries
- `categoryId` - Category filtering
- `isPinned` - Quick pinned prompt retrieval
- `createdAt` - Chronological sorting

---

#### Workflow
Represents a multi-step process using multiple prompts.

**Fields:**
- `id` (String, PK): Unique identifier
- `name` (String): Workflow name
- `description` (String, nullable): Workflow description
- `userId` (String, FK): Owner reference
- `isActive` (Boolean, default: true): Active status
- `isArchived` (Boolean, default: false): Archival status
- `metadata` (JSON, nullable): Execution history, stats, etc.
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last modification timestamp

**Relations:**
- Belongs to: User
- Has many: WorkflowSteps, WorkflowTags

**Indexes:**
- `userId` - User-specific workflows
- `isActive` - Active workflow filtering

---

#### WorkflowStep
Individual steps within a workflow.

**Fields:**
- `id` (String, PK): Unique identifier
- `workflowId` (String, FK): Parent workflow
- `promptId` (String, FK, nullable): Reference to existing prompt
- `order` (Int): Step sequence number
- `name` (String): Step name
- `description` (String, nullable): Step description
- `promptText` (Text, nullable): Inline prompt (if no promptId)
- `config` (JSON, nullable): Step-specific configuration
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last modification timestamp

**Relations:**
- Belongs to: Workflow, Prompt (optional)

**Constraints:**
- Unique: [workflowId, order] - Ensures no duplicate order values

**Indexes:**
- `workflowId` - Workflow-specific steps
- `promptId` - Prompt usage tracking

**Note:** Steps can either reference an existing Prompt (via `promptId`) or contain inline prompt text (via `promptText`).

---

#### Tag
Labels for organizing prompts and workflows.

**Fields:**
- `id` (String, PK): Unique identifier
- `name` (String): Tag name
- `color` (String, nullable): Hex color code for UI
- `userId` (String, FK): Owner reference
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last modification timestamp

**Relations:**
- Belongs to: User
- Has many: PromptTags, WorkflowTags

**Constraints:**
- Unique: [userId, name] - No duplicate tag names per user

**Indexes:**
- `userId` - User-specific tags

---

#### Category
Hierarchical organization system for prompts.

**Fields:**
- `id` (String, PK): Unique identifier
- `name` (String): Category name
- `description` (String, nullable): Category description
- `color` (String, nullable): Hex color code for UI
- `icon` (String, nullable): Icon name or emoji
- `userId` (String, FK): Owner reference
- `parentId` (String, FK, nullable): Parent category (for nesting)
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last modification timestamp

**Relations:**
- Belongs to: User, Category (parent, optional)
- Has many: Prompts, Categories (children)

**Constraints:**
- Unique: [userId, name] - No duplicate category names per user

**Indexes:**
- `userId` - User-specific categories
- `parentId` - Hierarchical queries

**Note:** Supports nested categories for complex organization structures.

---

#### PinnedPrompt
Tracks user's favorite/pinned prompts for quick access.

**Fields:**
- `id` (String, PK): Unique identifier
- `userId` (String, FK): User reference
- `promptId` (String, FK): Prompt reference
- `order` (Int, nullable): Custom sort order
- `createdAt` (DateTime): Pin timestamp

**Relations:**
- Belongs to: User, Prompt

**Constraints:**
- Unique: [userId, promptId] - Can't pin same prompt twice

**Indexes:**
- `userId` - User's pinned prompts

---

### Join Tables

#### PromptTag
Many-to-many relationship between Prompts and Tags.

**Fields:**
- `promptId` (String, FK): Prompt reference
- `tagId` (String, FK): Tag reference
- `createdAt` (DateTime): Association timestamp

**Composite Primary Key:** [promptId, tagId]

**Indexes:**
- `promptId` - Tags for a prompt
- `tagId` - Prompts with a tag

---

#### WorkflowTag
Many-to-many relationship between Workflows and Tags.

**Fields:**
- `workflowId` (String, FK): Workflow reference
- `tagId` (String, FK): Tag reference
- `createdAt` (DateTime): Association timestamp

**Composite Primary Key:** [workflowId, tagId]

**Indexes:**
- `workflowId` - Tags for a workflow
- `tagId` - Workflows with a tag

---

### Authentication Tables

#### Account
OAuth provider account associations (NextAuth).

**Fields:**
- `id` (String, PK): Unique identifier
- `userId` (String, FK): User reference
- `type` (String): Account type
- `provider` (String): OAuth provider
- `providerAccountId` (String): Provider's user ID
- `refresh_token` (Text, nullable): OAuth refresh token
- `access_token` (Text, nullable): OAuth access token
- `expires_at` (Int, nullable): Token expiration
- `token_type` (String, nullable): Token type
- `scope` (String, nullable): OAuth scope
- `id_token` (Text, nullable): OpenID token
- `session_state` (String, nullable): Session state

**Constraints:**
- Unique: [provider, providerAccountId]

---

#### Session
User session management (NextAuth).

**Fields:**
- `id` (String, PK): Unique identifier
- `sessionToken` (String, unique): Session token
- `userId` (String, FK): User reference
- `expires` (DateTime): Expiration timestamp

---

#### VerificationToken
Email verification tokens (NextAuth).

**Fields:**
- `identifier` (String): User identifier (email)
- `token` (String, unique): Verification token
- `expires` (DateTime): Token expiration

**Constraints:**
- Unique: [identifier, token]

---

## Relationships Summary

### User Relationships
- **1:N** with Prompts (one user, many prompts)
- **1:N** with Workflows (one user, many workflows)
- **1:N** with Tags (one user, many tags)
- **1:N** with Categories (one user, many categories)
- **1:N** with PinnedPrompts (one user, many pinned prompts)

### Prompt Relationships
- **N:1** with User (many prompts, one user)
- **N:1** with Category (many prompts, one category)
- **N:M** with Tags (via PromptTag)
- **1:N** with WorkflowSteps (one prompt, many workflow steps)

### Workflow Relationships
- **N:1** with User (many workflows, one user)
- **1:N** with WorkflowSteps (one workflow, many steps)
- **N:M** with Tags (via WorkflowTag)

### Category Relationships
- **Self-referencing** for hierarchical structure
- **1:N** with Prompts

---

## Indexes Strategy

Performance-critical indexes have been added for:

1. **User lookups**: All user-owned entities indexed by `userId`
2. **Time-based queries**: `createdAt` on Prompts for chronological sorting
3. **Status filtering**: `isPinned`, `isActive` for quick status-based queries
4. **Hierarchical queries**: `parentId` on Categories for tree traversal
5. **Join table optimization**: Both foreign keys indexed in PromptTag and WorkflowTag

---

## Data Integrity

### Cascade Deletes
When a user is deleted, all associated data is automatically removed:
- Prompts → CASCADE
- Workflows → CASCADE
- Tags → CASCADE
- Categories → CASCADE
- PinnedPrompts → CASCADE

### Null on Delete
When a category is deleted, prompts retain but lose category reference:
- Category deletion → Prompt.categoryId SET NULL

When a prompt is deleted, workflow steps retain but lose prompt reference:
- Prompt deletion → WorkflowStep.promptId SET NULL

---

## JSON Metadata Fields

Several models include `metadata` JSON fields for flexible data storage:

### Prompt.metadata
```json
{
  "source": "imported",
  "originalFile": "prompts.json",
  "tags": ["custom-field-1", "custom-field-2"],
  "statistics": {
    "usageCount": 42,
    "lastUsed": "2025-10-27T12:00:00Z"
  }
}
```

### Workflow.metadata
```json
{
  "executionHistory": [
    {
      "timestamp": "2025-10-27T12:00:00Z",
      "duration": 1250,
      "success": true
    }
  ],
  "statistics": {
    "totalExecutions": 156,
    "averageDuration": 1100
  }
}
```

### WorkflowStep.config
```json
{
  "temperature": 0.7,
  "maxTokens": 2000,
  "retryOnFailure": true,
  "outputFormat": "json"
}
```

---

## Migration Commands

To apply this schema to your database:

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_prompt_workflow_schema

# View database in Prisma Studio
npx prisma studio
```

---

## Future Enhancements

Potential schema additions for future versions:

1. **PromptVersion**: Track complete version history of prompts
2. **WorkflowExecution**: Store execution results and logs
3. **SharedPrompt**: Enable prompt sharing between users
4. **Team**: Multi-user collaboration support
5. **ApiIntegration**: Store Claude API configurations per prompt
6. **Template**: Predefined prompt templates (RICECO framework)
7. **Collection**: Group related prompts into collections

---

## Performance Considerations

### Query Optimization Tips

1. **Always filter by userId first**: All queries should include user context
2. **Use indexes**: Leverage the created indexes for common queries
3. **Limit joins**: Be cautious with deeply nested queries (Category trees)
4. **Pagination**: Always paginate prompts/workflows lists
5. **Eager loading**: Use Prisma's `include` for related data in single query

### Example Queries

```typescript
// Efficient: Get user's prompts with tags
const prompts = await prisma.prompt.findMany({
  where: { userId: user.id, isArchived: false },
  include: {
    tags: { include: { tag: true } },
    category: true
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: page * 20
});

// Efficient: Get workflow with all steps and prompts
const workflow = await prisma.workflow.findUnique({
  where: { id: workflowId },
  include: {
    steps: {
      include: { prompt: true },
      orderBy: { order: 'asc' }
    }
  }
});

// Efficient: Full-text search (with PostgreSQL)
const results = await prisma.$queryRaw`
  SELECT * FROM prompts
  WHERE user_id = ${userId}
  AND to_tsvector('english', title || ' ' || content)
  @@ plainto_tsquery('english', ${searchTerm})
  ORDER BY created_at DESC
  LIMIT 20
`;
```

---

## Database Size Estimation

Approximate storage per 1,000 records:

- **User**: ~50KB
- **Prompt**: ~2-5MB (depending on content length)
- **Workflow**: ~100KB
- **WorkflowStep**: ~500KB
- **Tag**: ~20KB
- **Category**: ~30KB
- **PromptTag**: ~15KB
- **PinnedPrompt**: ~10KB

For a typical user with:
- 1,000 prompts
- 50 workflows (avg 5 steps each)
- 50 tags
- 20 categories

**Estimated database size**: ~5-8MB per user

---

## Backup Strategy

Recommended backup approach:

1. **Daily automated backups**: Full PostgreSQL database dump
2. **Hourly incremental backups**: Transaction logs
3. **User-initiated exports**: JSON export functionality
4. **Version control**: Track schema changes in Git

```bash
# Full backup
pg_dump -U postgres ai_prompt_lab > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres ai_prompt_lab < backup_20251027.sql
```

---

## Schema Version

**Current Version**: 0.2.0
**Last Updated**: 2025-10-27
**Prisma Version**: 5.18.0
**PostgreSQL Version**: 12+
