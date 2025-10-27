# Changelog

All notable changes to the AI Prompt Lab project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-10-27

### Added - Complete Database Schema

#### Core Data Models
- **Prompt Model**: Comprehensive prompt storage with:
  - Title, description, and content fields
  - Version tracking for prompt iterations
  - User ownership with foreign key relationship
  - Optional category assignment
  - Pin and archive status flags
  - JSON metadata field for custom data
  - Timestamps for creation and updates
  - Indexes on userId, categoryId, isPinned, and createdAt

- **Workflow Model**: Multi-step workflow support with:
  - Name and description fields
  - User ownership
  - Active and archived status flags
  - JSON metadata for execution history
  - Timestamps for tracking
  - Indexes on userId and isActive

- **WorkflowStep Model**: Individual workflow steps with:
  - Parent workflow reference
  - Optional prompt reference (can use existing prompts)
  - Step ordering system
  - Name and description fields
  - Inline prompt text option (when not using existing prompt)
  - JSON config field for step-specific settings
  - Unique constraint on [workflowId, order]
  - Indexes on workflowId and promptId

- **Tag Model**: Labeling system with:
  - Name field
  - Optional color for UI customization
  - User ownership
  - Timestamps
  - Unique constraint on [userId, name]
  - Many-to-many relationships with Prompts and Workflows

- **Category Model**: Hierarchical organization with:
  - Name, description fields
  - Optional color and icon
  - User ownership
  - Self-referencing parent relationship for nesting
  - Timestamps
  - Unique constraint on [userId, name]
  - Support for nested category structures

- **PinnedPrompt Model**: Quick access favorites with:
  - User and prompt references
  - Optional custom ordering
  - Creation timestamp
  - Unique constraint on [userId, promptId]

#### Join Tables
- **PromptTag**: Many-to-many relationship between Prompts and Tags
  - Composite primary key [promptId, tagId]
  - Indexes on both foreign keys
  - Creation timestamp

- **WorkflowTag**: Many-to-many relationship between Workflows and Tags
  - Composite primary key [workflowId, tagId]
  - Indexes on both foreign keys
  - Creation timestamp

#### Relationships & Data Integrity
- **User Relations**: Updated User model to include:
  - One-to-many with Prompts
  - One-to-many with Workflows
  - One-to-many with Tags
  - One-to-many with Categories
  - One-to-many with PinnedPrompts

- **Cascade Deletes**: Configured for data integrity:
  - User deletion cascades to all owned entities
  - Workflow deletion cascades to WorkflowSteps
  - Tag deletion cascades to PromptTag and WorkflowTag
  - Prompt deletion cascades to PinnedPrompts and PromptTag

- **Null on Delete**: Graceful handling:
  - Category deletion sets Prompt.categoryId to NULL
  - Prompt deletion sets WorkflowStep.promptId to NULL

#### Performance Optimizations
- **Strategic Indexes**: Added indexes for:
  - All foreign key relationships
  - Status flags (isPinned, isActive, isArchived)
  - Time-based queries (createdAt)
  - Hierarchical queries (parentId)
  - Join table optimization

- **Database Constraints**:
  - Unique constraints preventing duplicate data
  - Foreign key constraints ensuring referential integrity
  - Composite unique keys on join tables

#### Documentation
- **DATABASE_SCHEMA.md**: Comprehensive 500+ line documentation including:
  - Visual schema diagram
  - Detailed entity descriptions
  - Field-by-field documentation
  - Relationship mapping
  - Index strategy explanation
  - Data integrity rules
  - JSON metadata examples
  - Migration commands
  - Performance optimization tips
  - Example queries
  - Database size estimation
  - Backup strategy

#### Schema Features
- **Flexible Prompt Storage**: Support for rich metadata via JSON fields
- **Workflow Versatility**: Steps can reference existing prompts or contain inline text
- **Hierarchical Categories**: Nested categories via self-referencing relationship
- **Tag System**: Reusable tags with optional colors for visual organization
- **Version Tracking**: Built-in versioning for prompts
- **Archive Support**: Soft delete functionality via isArchived flags
- **Pin/Favorite System**: Quick access to frequently used prompts

### Technical Details

#### Database Tables Created (8 new tables)
1. `prompts` - Stores AI prompts with metadata
2. `workflows` - Stores multi-step workflows
3. `workflow_steps` - Individual steps in workflows
4. `tags` - Labels for organization
5. `categories` - Hierarchical categorization
6. `pinned_prompts` - User favorites
7. `prompt_tags` - Prompt-Tag associations
8. `workflow_tags` - Workflow-Tag associations

#### Schema Statistics
- **Total Models**: 12 (4 auth + 8 core)
- **Total Relationships**: 20+ foreign key relationships
- **Total Indexes**: 25+ performance indexes
- **Many-to-Many Relations**: 2 (Prompt-Tag, Workflow-Tag)
- **Self-Referencing Relations**: 1 (Category hierarchy)

#### Storage Estimates (per 1,000 records)
- Prompts: ~2-5MB
- Workflows: ~100KB
- WorkflowSteps: ~500KB
- Tags: ~20KB
- Categories: ~30KB

#### File Structure
```
prisma/
└── schema.prisma         (Updated with 8 new models, 230+ lines)
docs/
└── DATABASE_SCHEMA.md    (New comprehensive documentation)
```

### Migration Instructions

To apply the new schema:

```bash
# Generate Prisma Client with new models
npx prisma generate

# Create migration
npx prisma migrate dev --name add_prompt_workflow_schema

# (Optional) Seed database with sample data
npm run db:seed

# View database in Prisma Studio
npx prisma studio
```

### Breaking Changes

None - This is additive to the existing authentication schema.

### Future Considerations

Planned enhancements for future versions:
- Full-text search indexes for prompt content
- Prompt version history table
- Workflow execution logging
- Shared prompts between users
- Team collaboration features
- Claude API integration configurations
- RICECO template storage

---

## [0.1.0] - 2025-10-27

### Added - User Authentication Module

#### Project Initialization
- **Next.js Setup**: Initialized Next.js 15.0.0 with TypeScript and App Router
- **Tailwind CSS**: Configured Tailwind CSS 3.4.1 for styling
- **ESLint**: Set up ESLint for code quality
- **TypeScript Configuration**: Added tsconfig.json with strict mode and path aliases
- **PostCSS Configuration**: Set up PostCSS with Tailwind and Autoprefixer

#### Database & ORM
- **Prisma ORM**: Installed and configured Prisma 5.18.0 with PostgreSQL
- **Database Schema**: Created comprehensive schema with the following models:
  - `User`: Core user model with id, name, email, password, timestamps
  - `Account`: OAuth account support for future providers
  - `Session`: Session management for NextAuth
  - `VerificationToken`: Email verification support (future use)
- **Prisma Client**: Set up singleton Prisma client instance in `lib/prisma.ts`

#### Authentication System (NextAuth.js)
- **NextAuth.js 4.24.5**: Installed and configured for authentication
- **Prisma Adapter**: Integrated @next-auth/prisma-adapter 1.0.7
- **Credentials Provider**: Implemented email/password authentication
- **JWT Strategy**: Configured JWT-based session management
- **Password Hashing**: Implemented bcryptjs 2.4.3 for secure password storage
- **Auth Configuration**: Created `lib/auth.ts` with NextAuth options
- **Auth API Route**: Set up `/api/auth/[...nextauth]/route.ts`
- **TypeScript Types**: Added custom NextAuth type definitions in `types/next-auth.d.ts`

#### API Endpoints
- **Registration Endpoint**: Created `/api/auth/register/route.ts` with:
  - Zod validation for input data
  - Email uniqueness checks
  - Password hashing with bcrypt (12 salt rounds)
  - Error handling for validation and server errors
  - Secure response (password excluded from output)

#### UI Components & Pages
- **Home Page**: Landing page (`app/page.tsx`) with navigation to auth pages
- **Login Page**: Full-featured login form (`app/auth/login/page.tsx`) with:
  - Email and password fields
  - Client-side validation
  - Error handling and display
  - Loading states
  - Link to registration page
  - NextAuth integration
- **Registration Page**: Complete registration form (`app/auth/register/page.tsx`) with:
  - Name, email, password, and confirm password fields
  - Client-side validation (password length, matching passwords, name length)
  - API integration for user creation
  - Error handling and display
  - Loading states
  - Link to login page
- **Dashboard Page**: Protected dashboard (`app/dashboard/page.tsx`) with:
  - User welcome message
  - Navigation bar with user email display
  - Sign out functionality
  - Placeholder cards for future features (Prompts, Workflows, RICECO)
- **Protected Route Component**: Reusable wrapper (`components/auth/ProtectedRoute.tsx`) with:
  - Session verification
  - Automatic redirect to login for unauthenticated users
  - Loading state display
  - Session-based access control

#### Providers & Context
- **Session Provider**: Client-side session provider wrapper (`components/providers/SessionProvider.tsx`)
- **Root Layout**: Updated `app/layout.tsx` to include SessionProvider for app-wide auth state

#### Styling
- **Global CSS**: Configured Tailwind directives and CSS variables in `app/globals.css`
- **Dark Mode Support**: Added CSS variables for light/dark color schemes
- **Responsive Design**: All components use Tailwind's responsive utilities
- **Form Styling**: Consistent form input and button styling across auth pages

#### Configuration Files
- **Environment Variables**:
  - `.env.example`: Template with all required environment variables
  - `.env.local`: Local development configuration with placeholders
  - Variables include: DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, CLAUDE_API_KEY
- **Git Configuration**: Updated `.gitignore` to exclude:
  - node_modules
  - .next build directory
  - Environment files (.env, .env.local)
  - Prisma database files
  - TypeScript build info

#### Dependencies Added
**Production Dependencies:**
- `next`: ^15.0.0 - React framework
- `react`: ^18.3.1 - UI library
- `react-dom`: ^18.3.1 - React DOM renderer
- `next-auth`: ^4.24.5 - Authentication
- `@next-auth/prisma-adapter`: ^1.0.7 - NextAuth Prisma integration
- `@prisma/client`: ^5.18.0 - Database ORM client
- `bcryptjs`: ^2.4.3 - Password hashing
- `zod`: ^3.23.8 - Schema validation

**Development Dependencies:**
- `typescript`: ^5 - TypeScript language
- `@types/node`: ^20 - Node.js type definitions
- `@types/react`: ^18 - React type definitions
- `@types/react-dom`: ^18 - React DOM type definitions
- `@types/bcryptjs`: ^2.4.6 - Bcryptjs type definitions
- `eslint`: ^8 - Code linting
- `eslint-config-next`: ^15.0.0 - Next.js ESLint config
- `tailwindcss`: ^3.4.1 - CSS framework
- `postcss`: ^8 - CSS processing
- `autoprefixer`: ^10.4.20 - CSS vendor prefixing
- `prisma`: ^5.18.0 - Prisma CLI and migrations

### Technical Specifications

#### Security Features
- Passwords hashed with bcrypt (12 rounds)
- JWT-based sessions
- CSRF protection (NextAuth built-in)
- Secure HTTP-only cookies
- SQL injection protection (Prisma ORM)
- XSS protection (React built-in)

#### Database Schema Details
```prisma
User {
  - id: String (CUID)
  - name: String (optional)
  - email: String (unique)
  - emailVerified: DateTime (optional)
  - image: String (optional)
  - password: String (required)
  - createdAt: DateTime (auto)
  - updatedAt: DateTime (auto)
}
```

#### File Structure Created
```
AI-Prompt-Lab/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       │   └── route.ts
│   │       └── register/
│   │           └── route.ts
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx
│   └── providers/
│       └── SessionProvider.tsx
├── lib/
│   ├── auth.ts
│   └── prisma.ts
├── prisma/
│   └── schema.prisma
├── types/
│   └── next-auth.d.ts
├── .env.example
├── .env.local
├── .eslintrc.json
├── .gitignore
├── CHANGELOG.md
├── next.config.js
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

### Setup Requirements

To run this project locally:

1. **Install Dependencies**: `npm install`
2. **Configure Database**: Update `DATABASE_URL` in `.env.local` with your PostgreSQL connection string
3. **Generate Prisma Client**: `npx prisma generate`
4. **Run Migrations**: `npx prisma migrate dev --name init`
5. **Start Development Server**: `npm run dev`

### Known Limitations

- Email verification not yet implemented
- Password reset functionality not implemented
- OAuth providers (Google, GitHub) not configured
- Profile update functionality not available
- Account deletion not implemented

### Next Steps

Future features planned:
- Prompt management system
- Multi-step workflow functionality
- RICECO prompt generator
- Claude API integration
- Search and filtering
- Import/export functionality
