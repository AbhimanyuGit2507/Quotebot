# Quotebot Backend - Quick Setup Guide

This guide walks you through the complete setup process to get the Quotebot ERP backend running with a PostgreSQL database.

## Prerequisites

- **Node.js** v18+ (check with `node --version`)
- **npm** v9+ (check with `npm --version`)
- **PostgreSQL** 14+ (running locally or accessible)
- **Git** (for version control)

## Setup Steps

### 1. Install @nestjs/config (Handle Dependency)

```bash
cd backend
npm install @nestjs/config
```

### 2. Create PostgreSQL Database

Open your PostgreSQL client (psql, pgAdmin, or DBeaver) and create the database:

```sql
CREATE DATABASE quotebot_db;
```

Or using psql from terminal:

```bash
createdb -U postgres quotebot_db
```

> **Note**: Update the `DATABASE_URL` in `.env` if your PostgreSQL credentials differ from the defaults (username: `postgres`, password: `postgres`, host: `localhost`).

### 3. Run Database Migrations

This creates all the tables defined in `prisma/schema.prisma`:

```bash
npm run db:migrate -- --name init
```

You'll see output like:
```
✅ Your database is now in sync with your schema. Done in 0.25s
```

### 4. Seed the Database

Populate the database with initial test data (roles, admin user, products, clients, RFQs, quotations):

```bash
npm run db:seed
```

You should see:
```
═══════════════════════════════════════
✅ Database seeding completed!
═══════════════════════════════════════

📝 Test Credentials:
  Email: admin@quotebot.com
  Password: Admin@123
  Tenant ID: [UUID shown here]
```

### 5. Install @nestjs/config Package (if not done in step 1)

```bash
npm install @nestjs/config
```

### 6. Start the Development Server

```bash
npm run start:dev
```

You should see:
```
═══════════════════════════════════════════════════
✅ Quotebot Backend API running on port 3001
📍 API Prefix: /api
🔗 Base URL: http://localhost:3001/api
═══════════════════════════════════════════════════
```

## Test the Backend

### Using curl:

```bash
# Test health endpoint
curl http://localhost:3001/api

# Expected response:
# {"message":"Quotebot Backend API is running"}
```

## Common Issues & Solutions

### "connect ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL is not running
- **Solution**: Start your PostgreSQL service

### "database "quotebot_db" does not exist"
- Database wasn't created in step 2
- **Solution**: Create it using the provided SQL

### "password authentication failed for user 'postgres'"
- Wrong PostgreSQL credentials in `.env`
- **Solution**: Check your PostgreSQL username/password and update `DATABASE_URL`

### "relation does not exist" after seed
- Migrations didn't run properly
- **Solution**: Run `npm run db:reset` to reset and recreate all tables

### TypeScript compilation errors
- Missing dependencies
- **Solution**: Run `npm install` again to ensure all packages are installed

## Useful Commands

```bash
# Development server with auto-reload
npm run start:dev

# Production build
npm run build
npm run start:prod

# Reset database (CAUTION: deletes all data!)
npm run db:reset

# Open Prisma Studio (GUI for database management)
npm run db:studio

# Run tests
npm test

# Run tests with coverage
npm run test:cov
```

## Database Structure Overview

The database includes these main entities:

- **Tenancy**: Tenant, User, Role
- **Products**: Product, ProductCategory
- **Business**: Client, RFQ, RFQItem, Quotation, QuotationItem, QuotationVersion
- **Operations**: Activity, AuditLog, File, AnalyticsCache
- **Settings**: SettingsCompany, SettingsNotifications, SettingsTemplate, AutomationRule

All entities support multi-tenancy via `tenant_id` field.

## Next Steps

After setup completes:

1. **API Development**: Modules are ready in `src/` (currently Auth is next to implement)
2. **Frontend Integration**: Connect your React frontend to `http://localhost:3001/api`
3. **Testing**: Use Postman, Insomnia, or curl to test endpoints
4. **Database Monitoring**: Use `npm run db:studio` for visual database management

## Environment Variables Reference

```env
DATABASE_URL          # PostgreSQL connection string
JWT_SECRET            # Secret key for JWT token signing (min 32 chars in prod)
JWT_EXPIRATION        # Token expiry time (e.g., "24h")
API_PORT              # Port the server runs on (default: 3001)
API_PREFIX            # API route prefix (default: "api")
CORS_ORIGIN           # Comma-separated origins for CORS
UPLOAD_FOLDER         # Directory for file uploads
MAX_FILE_SIZE         # Maximum file size in bytes
NODE_ENV              # Environment: "development" or "production"
```

## Support

For complete implementation details, guides, and code examples, see:
- `BACKEND_IMPLEMENTATION_GUIDE.md` - Comprehensive architecture and module guides
- `prisma/schema.prisma` - Complete data model
- `src/` - Source code modules

---

**Total Setup Time**: ~5-10 minutes

Now you're ready to start implementing API endpoints!
