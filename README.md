# AI Prompt Lab

A comprehensive prompt management system designed for content creators who need to efficiently organize, store, and retrieve their AI prompts and JSON configurations.

## Current Status: v0.1.0 - User Authentication Module

The first module of AI Prompt Lab is now complete! Users can register, login, and access a protected dashboard.

## Features

### Implemented (v0.1.0)
- User registration with validation
- Secure login with email/password
- Password hashing with bcrypt
- JWT-based session management
- Protected routes and dashboard
- Responsive UI with Tailwind CSS
- PostgreSQL database with Prisma ORM
- Full TypeScript support

### Coming Soon
- Prompt management (CRUD operations)
- Multi-step workflow functionality
- Prompt favoriting/pinning
- Full-text search across prompts
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
│   └── schema.prisma             # Prisma schema definition
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

### User Model

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
}
```

See `prisma/schema.prisma` for the complete schema including Account, Session, and VerificationToken models.

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

### v0.2.0 - Prompt Management
- [ ] Create, read, update, delete prompts
- [ ] Prompt metadata (title, description, tags)
- [ ] Prompt versioning

### v0.3.0 - Workflows
- [ ] Multi-step workflow creation
- [ ] Workflow step management
- [ ] Workflow execution

### v0.4.0 - Organization Features
- [ ] Prompt favoriting/pinning
- [ ] Tags and categories
- [ ] Full-text search

### v0.5.0 - RICECO Generator
- [ ] RICECO framework implementation
- [ ] Prompt template generation
- [ ] Framework customization

### v0.6.0 - Claude Integration
- [ ] Claude API integration
- [ ] Prompt testing
- [ ] Response handling

### v0.7.0 - Import/Export
- [ ] JSON export
- [ ] JSON import
- [ ] Bulk operations

## License

This project is private and proprietary.

## Author

TheRealTamaki

## Support

For issues or questions, please open an issue in the GitHub repository.
