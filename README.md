# AI Prompt Lab

A comprehensive prompt management system designed for content creators who need to efficiently organize, store, and retrieve their AI prompts and JSON configurations.

## Current Status: v0.2.0 - Complete Database Schema

The foundation of AI Prompt Lab is now complete! Authentication is functional and the complete database schema for all features has been designed and implemented.

## Features

### Implemented (v0.2.0)
- **User Authentication** (v0.1.0)
  - User registration with validation
  - Secure login with email/password
  - Password hashing with bcrypt
  - JWT-based session management
  - Protected routes and dashboard

- **Complete Database Schema** (v0.2.0)
  - Prompt storage with versioning and metadata
  - Multi-step workflow support with ordered steps
  - Hierarchical category system with nesting
  - Tag system for flexible organization
  - Pin/favorite system for quick access
  - Comprehensive relationships and data integrity
  - Performance-optimized indexes
  - Full TypeScript type safety with Prisma

### Coming Soon
- Prompt management UI (CRUD operations)
- Workflow builder interface
- Tag and category management
- Full-text search implementation
- RICECO framework prompt generator
- Claude API integration
- Import/export functionality

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS 3.4
- **Authentication**: NextAuth.js 4.24
- **Database**: PostgreSQL with Prisma ORM 5.18
- **Validation**: Zod 3.23
- **Password Hashing**: bcryptjs 2.4

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+
- npm or yarn
- PostgreSQL 12+

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/TheRealTamaki/AI-Prompt-Lab.git
cd AI-Prompt-Lab
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and update it with your configuration:

```bash
cp .env.example .env.local
```

Edit `.env.local` and update the following variables:

```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/ai_prompt_lab?schema=public"

# NextAuth - Keep localhost:3000 for local development
NEXTAUTH_URL="http://localhost:3000"

# NextAuth Secret - Generate a secure random string
# Run: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"

# Claude API (Optional - for future features)
CLAUDE_API_KEY="your-claude-api-key-here"
```

### 4. Set Up the Database

First, ensure PostgreSQL is running and create a database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ai_prompt_lab;
\q
```

Then generate the Prisma client and run migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
AI-Prompt-Lab/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   └── auth/                 # Authentication endpoints
│   │       ├── [...nextauth]/    # NextAuth handler
│   │       └── register/         # User registration
│   ├── auth/                     # Auth pages
│   │   ├── login/                # Login page
│   │   └── register/             # Registration page
│   ├── dashboard/                # Protected dashboard
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── auth/                     # Auth-related components
│   │   └── ProtectedRoute.tsx   # Route protection wrapper
│   └── providers/                # Context providers
│       └── SessionProvider.tsx  # NextAuth session provider
├── lib/                          # Utility functions
│   ├── auth.ts                   # NextAuth configuration
│   └── prisma.ts                 # Prisma client singleton
├── prisma/                       # Database schema
│   └── schema.prisma             # Prisma schema definition (12 models)
├── docs/                         # Documentation
│   └── DATABASE_SCHEMA.md        # Comprehensive schema documentation
├── types/                        # TypeScript type definitions
│   └── next-auth.d.ts            # NextAuth custom types
├── .env.local                    # Environment variables (git-ignored)
├── .env.example                  # Environment variables template
├── CHANGELOG.md                  # Detailed changelog
└── README.md                     # This file
```

## Usage

### Registration

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click "Register"
3. Fill in your name, email, and password (min. 8 characters)
4. Click "Create account"

### Login

1. Navigate to the login page
2. Enter your email and password
3. Click "Sign in"
4. You'll be redirected to the dashboard

### Dashboard

After logging in, you'll see:
- Your user information
- Navigation with sign out button
- Placeholder cards for upcoming features

## Database Schema

The complete database schema includes 12 models organized into three categories:

### Authentication Models (4)
- **User**: Core user authentication and profile
- **Account**: OAuth provider integrations (NextAuth)
- **Session**: User session management (NextAuth)
- **VerificationToken**: Email verification tokens (NextAuth)

### Core Application Models (8)
- **Prompt**: AI prompts with versioning, metadata, and organization
- **Workflow**: Multi-step workflows with execution tracking
- **WorkflowStep**: Individual ordered steps within workflows
- **Tag**: Flexible labeling system for prompts and workflows
- **Category**: Hierarchical categorization with nesting support
- **PinnedPrompt**: User favorites for quick access
- **PromptTag**: Many-to-many prompt-tag associations
- **WorkflowTag**: Many-to-many workflow-tag associations

### Key Features
- **20+ Foreign Key Relationships** for data integrity
- **25+ Performance Indexes** for fast queries
- **Hierarchical Categories** with self-referencing relationships
- **Flexible Tagging** with many-to-many relationships
- **Version Tracking** for prompt iterations
- **JSON Metadata** fields for extensibility
- **Soft Deletes** via archive flags
- **Cascade Deletes** for proper cleanup

### Schema Example (Prompt Model)

```prisma
model Prompt {
  id              String         @id @default(cuid())
  title           String
  description     String?        @db.Text
  content         String         @db.Text
  version         Int            @default(1)
  userId          String         @map("user_id")
  categoryId      String?        @map("category_id")
  isPinned        Boolean        @default(false)
  isArchived      Boolean        @default(false)
  metadata        Json?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  user            User           @relation(fields: [userId], references: [id])
  category        Category?      @relation(fields: [categoryId], references: [id])
  tags            PromptTag[]
  workflowSteps   WorkflowStep[]
  pinnedBy        PinnedPrompt[]
}
```

For comprehensive documentation including:
- Visual schema diagrams
- Detailed field descriptions
- Relationship mapping
- Performance optimization tips
- Example queries
- Migration instructions

**See: [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)**

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (Success):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-10-27T...",
    "updatedAt": "2025-10-27T..."
  }
}
```

#### POST /api/auth/signin
Handled by NextAuth - use signIn() from next-auth/react

#### POST /api/auth/signout
Handled by NextAuth - use signOut() from next-auth/react

## Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev  # Run migrations in development
```

## Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Sessions**: Secure, HTTP-only cookies
- **CSRF Protection**: Built into NextAuth
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **XSS Protection**: React's built-in escaping
- **Input Validation**: Zod schema validation

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | Secret for JWT signing | Yes |
| `CLAUDE_API_KEY` | Claude API key (future use) | No |

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. Ensure PostgreSQL is running: `sudo service postgresql status`
2. Verify your DATABASE_URL in `.env.local`
3. Check PostgreSQL is accepting connections on port 5432
4. Verify database exists: `psql -U postgres -l`

### Prisma Client Not Found

If you see "Cannot find module '@prisma/client'":

```bash
npx prisma generate
```

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or run on a different port
npm run dev -- -p 3001
```

## Contributing

This is a private project, but if you're collaborating:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m 'Add some feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a Pull Request

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## Roadmap

### v0.1.0 - User Authentication ✅
- [x] User registration with validation
- [x] Secure login with email/password
- [x] JWT-based session management
- [x] Protected routes and dashboard

### v0.2.0 - Complete Database Schema ✅
- [x] Prompt model with versioning and metadata
- [x] Workflow and WorkflowStep models
- [x] Tag and Category models with relationships
- [x] PinnedPrompt model for favorites
- [x] Performance-optimized indexes
- [x] Comprehensive documentation

### v0.3.0 - Prompt Management UI
- [ ] Create, read, update, delete prompts
- [ ] Prompt editor with syntax highlighting
- [ ] Prompt metadata management
- [ ] Prompt versioning UI
- [ ] Prompt list with filtering

### v0.4.0 - Workflows UI
- [ ] Multi-step workflow creation
- [ ] Workflow builder interface
- [ ] Workflow step management
- [ ] Workflow execution

### v0.5.0 - Organization Features
- [ ] Prompt favoriting/pinning UI
- [ ] Tag management interface
- [ ] Category management with nesting
- [ ] Full-text search implementation

### v0.6.0 - RICECO Generator
- [ ] RICECO framework implementation
- [ ] Prompt template generation
- [ ] Framework customization

### v0.7.0 - Claude Integration
- [ ] Claude API integration
- [ ] Prompt testing interface
- [ ] Response handling and display

### v0.8.0 - Import/Export
- [ ] JSON export functionality
- [ ] JSON import with validation
- [ ] Bulk operations

## License

This project is private and proprietary.

## Author

TheRealTamaki

## Support

For issues or questions, please open an issue in the GitHub repository.
