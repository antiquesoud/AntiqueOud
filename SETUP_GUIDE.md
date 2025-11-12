# AromaSouq Single Vendor - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ installed
- PostgreSQL database (Supabase recommended)
- pnpm (for API) and npm (for Web)

---

## 📦 Step 1: Clone & Install

```bash
# If not already cloned
git clone https://github.com/deeptendu-kuri/AromaSouqSingleVendor.git
cd AromaSouqSingleVendor

# Install API dependencies
cd aromasouq-api
pnpm install

# Install Web dependencies
cd ../aromasouq-web
npm install
```

---

## 🗄️ Step 2: Setup New Supabase Project

### 2.1 Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - **Name**: AromaSouqSingleVendor
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to you
4. Wait for project to be created

### 2.2 Get Database Credentials
1. Go to **Project Settings** → **Database**
2. Copy the **Connection String** (Direct connection)
3. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 2.3 Get API Keys
1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL**: `https://[PROJECT-REF].supabase.co`
   - **anon public** key
   - **service_role** key (keep this secret!)

---

## ⚙️ Step 3: Configure Environment Variables

### 3.1 Backend (aromasouq-api)

Edit `aromasouq-api/.env`:

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"

# Supabase Configuration
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Your anon key
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Your service role key

# JWT Configuration (Generate a random string)
JWT_SECRET="generate-a-random-secure-string-here"
JWT_EXPIRES_IN="7d"

# API Configuration
PORT=3001
NODE_ENV="development"

# CORS Configuration
FRONTEND_URL="http://localhost:3000"

# Storage Buckets
PRODUCTS_BUCKET="products"
BRANDS_BUCKET="brands"
USERS_BUCKET="users"
REVIEWS_BUCKET="reviews"
DOCUMENTS_BUCKET="documents"
```

### 3.2 Frontend (aromasouq-web)

Edit `aromasouq-web/.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Your anon key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=AromaSouq
```

---

## 🗃️ Step 4: Setup Database Schema

### 4.1 Run Migrations

```bash
cd aromasouq-api

# Generate Prisma Client
npx prisma generate

# Run migrations to create database tables
npx prisma migrate deploy

# (Optional) Seed initial data
npx prisma db seed
```

### 4.2 Create Storage Buckets

Run the bucket setup script:

```bash
cd aromasouq-api
npx ts-node scripts/setup-supabase-buckets.ts
```

Or create manually in Supabase Dashboard:
1. Go to **Storage** in Supabase
2. Create buckets:
   - `products` (public)
   - `brands` (public)
   - `users` (public)
   - `reviews` (public)
   - `documents` (private)

---

## 🚀 Step 5: Start Development Servers

### Terminal 1 - Backend API:
```bash
cd aromasouq-api
pnpm start:dev

# API will run at: http://localhost:3001
```

### Terminal 2 - Frontend:
```bash
cd aromasouq-web
npm run dev

# Frontend will run at: http://localhost:3000
```

---

## ✅ Step 6: Verify Setup

Visit: http://localhost:3000

You should see:
- ✅ Homepage loads
- ✅ Language switcher (EN/AR) works
- ✅ Products page loads (may be empty)
- ✅ Login/Register forms work

---

## 🔐 Create Admin/Vendor Accounts

### Create Admin User

```bash
cd aromasouq-api

# Option 1: Via API (Recommended)
# Register via frontend: http://localhost:3000/register
# Then update user role in database:

npx prisma studio
# Open Users table
# Find your user
# Change role to "ADMIN"
```

### Create Vendor Account

```bash
cd aromasouq-api

# Use the create-vendor script
npx ts-node scripts/create-vendor.ts

# Or register as vendor via frontend:
# http://localhost:3000/become-vendor
```

---

## 🌍 i18n (Internationalization)

The app supports **English** and **Arabic** out of the box:

- **English**: http://localhost:3000/en
- **Arabic**: http://localhost:3000/ar (RTL layout)

Translation files:
- `aromasouq-web/messages/en.json`
- `aromasouq-web/messages/ar.json`

---

## 📝 Important Notes

### Environment Variables Priority

**Backend (.env):**
- ❌ DO NOT commit `.env` to git
- ✅ Use `.env.example` as template
- ✅ Keep `SUPABASE_SERVICE_ROLE_KEY` secret

**Frontend (.env.local):**
- ❌ DO NOT commit `.env.local` to git
- ✅ Use `.env.local.example` as template
- ✅ Only `NEXT_PUBLIC_*` vars are exposed to browser

### Production Deployment

When deploying to production:

1. **Change JWT_SECRET** to a secure random string
2. **Update FRONTEND_URL** to your production domain
3. **Update NEXT_PUBLIC_APP_URL** to your production domain
4. **Update CORS** settings in backend
5. **Enable RLS** policies in Supabase
6. **Setup environment variables** in your hosting platform

---

## 🆘 Troubleshooting

### Database Connection Issues
- Check DATABASE_URL is correct
- Ensure Supabase project is active
- Verify password doesn't have special characters that need escaping

### CORS Errors
- Ensure FRONTEND_URL in backend .env matches your frontend URL
- Check if API is running on correct port (3001)

### Missing Translations
- Check `messages/en.json` and `messages/ar.json` exist
- Verify locale is set correctly in URL (`/en` or `/ar`)

### File Upload Issues
- Verify Supabase buckets are created
- Check bucket policies allow public read/write
- Ensure SUPABASE_SERVICE_ROLE_KEY is set correctly

---

## 📚 Additional Resources

- **API Documentation**: See `aromasouq-api/README.md`
- **Database Schema**: See `docs/04-AromaSouq-Database-Schema.md`
- **Supabase Setup**: See `docs/07-AromaSouq-Supabase-Setup-Guide.md`

---

## 🎉 You're All Set!

Your AromaSouq Single Vendor platform is ready for development!

For questions or issues, check the documentation or create an issue on GitHub.
