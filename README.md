# The Great Physician Hospital - EMR

A hospital Electronic Medical Records (EMR) system built for the typical Nigerian hospital workflow.

## Workflow

```
Registration → Appointment → Vitals → Consultation → Prescription → Pharmacy → Lab → Billing
```

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express + TypeScript + Prisma + PostgreSQL
- **Auth**: JWT + bcrypt

## Local PC Setup

### 1. Prerequisites

Install on your PC:
- Node.js 20+ (https://nodejs.org)
- PostgreSQL 16+ (https://www.postgresql.org/download/)
- Git (https://git-scm.com/downloads)

### 2. Clone / Copy Project

If you received this as a zip, extract it. Otherwise:

```bash
git clone <your-repo-url> tgph-emr
cd tgph-emr
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup PostgreSQL

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE tgph;
CREATE USER tgph WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE tgph TO tgph;
\q
```

### 5. Configure Environment

Create `.env` in the root:

```env
DATABASE_URL=postgresql://tgph:your_secure_password@localhost:5432/tgph?schema=public
JWT_SECRET=change_this_to_a_random_long_string_in_production
PORT=3000
NODE_ENV=development
```

### 6. Run Database Migrations

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
cd ../..
```

### 7. Start Development

Open **two terminal windows**:

**Terminal 1 - API:**
```bash
cd apps/api
npm run dev
```

**Terminal 2 - Web:**
```bash
cd apps/web
npm run dev
```

### 8. Open in Browser

```
Web:  http://localhost:5173
API:  http://localhost:3000
```

### 9. Create First Admin User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tgph.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }'
```

Login with `admin@tgph.com` / `admin123`.

## Project Structure

```
tgph-emr/
├── apps/
│   ├── web/                    # React frontend
│   │   ├── src/
│   │   │   ├── pages/          # Route pages
│   │   │   ├── components/     # Reusable UI
│   │   │   ├── lib/            # API client
│   │   │   └── types/          # TypeScript types
│   │   └── package.json
│   │
│   └── api/                    # Express backend
│       ├── src/
│       │   ├── routes/         # API routes
│       │   ├── middleware/     # Auth, validation
│       │   ├── config/         # Database
│       │   └── app.ts          # Entry point
│       ├── prisma/
│       │   └── schema.prisma   # Database schema
│       └── package.json
│
├── docker-compose.yml
└── package.json
```

## Next Steps

1. Get the login page working
2. Build patient registration
3. Build appointment booking
4. Build consultation form
5. Add billing

Build one module at a time. Test with the hospital staff before moving to the next.
