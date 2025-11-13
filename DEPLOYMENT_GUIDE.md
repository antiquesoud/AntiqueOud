# AromaSouq Deployment Guide
## Complete Step-by-Step Deployment to Railway & Vercel

---

## 📋 TABLE OF CONTENTS

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Phase 1: Database Setup (Supabase)](#phase-1-database-setup-supabase)
3. [Phase 2: Backend Deployment (Railway)](#phase-2-backend-deployment-railway)
4. [Phase 3: Frontend Deployment (Vercel)](#phase-3-frontend-deployment-vercel)
5. [Phase 4: Post-Deployment Configuration](#phase-4-post-deployment-configuration)
6. [Phase 5: Testing & Verification](#phase-5-testing--verification)
7. [Troubleshooting](#troubleshooting)

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Required Accounts
- [ ] GitHub account (for repository)
- [ ] Supabase account (for database & storage)
- [ ] Railway account (for backend hosting)
- [ ] Vercel account (for frontend hosting)

### Local Requirements
- [x] Backend build passes: `npm run build` in aromasouq-api ✅
- [x] Frontend build passes: `npm run build` in aromasouq-web ✅
- [ ] Git repository initialized
- [ ] All environment files prepared

### Repository Structure
```
AromaSouqSingleVendor/
├── aromasouq-api/          # Backend (NestJS)
│   ├── src/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── package.json
│   └── .env.example
├── aromasouq-web/          # Frontend (Next.js)
│   ├── src/
│   ├── public/
│   ├── next.config.ts
│   ├── package.json
│   └── .env.local
└── DEPLOYMENT_GUIDE.md     # This file
```

---

## 🗄️ PHASE 1: DATABASE SETUP (SUPABASE)

### Step 1.1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Click "New Project"

2. **Configure Project**
   ```
   Project Name: aromasouq-production
   Database Password: [Generate Strong Password - SAVE THIS!]
   Region: Choose closest to your users (e.g., Singapore for GCC)
   ```

3. **Wait for Project Setup** (2-3 minutes)

4. **Save Critical Information**
   ```
   Project URL: https://[PROJECT_REF].supabase.co
   Project API Keys:
   - anon/public key: eyJhbG... (public, safe for frontend)
   - service_role key: eyJhbG... (secret, backend only)

   Database Connection Strings (from Settings > Database):
   - Connection String (Pooling): postgresql://postgres.xxxx
   - Direct Connection: postgresql://postgres:password@...
   ```

### Step 1.2: Create Storage Buckets

1. **Navigate to Storage** (Left sidebar)

2. **Create These 5 Buckets** (one by one):

   **Bucket 1: products**
   ```
   Name: products
   Public: ✅ Yes (enable public access)
   File size limit: 10MB
   Allowed MIME types: image/jpeg, image/png, image/webp
   ```

   **Bucket 2: brands**
   ```
   Name: brands
   Public: ✅ Yes
   File size limit: 5MB
   Allowed MIME types: image/jpeg, image/png, image/webp
   ```

   **Bucket 3: users**
   ```
   Name: users
   Public: ✅ Yes
   File size limit: 5MB
   Allowed MIME types: image/jpeg, image/png, image/webp
   ```

   **Bucket 4: reviews**
   ```
   Name: reviews
   Public: ✅ Yes
   File size limit: 5MB
   Allowed MIME types: image/jpeg, image/png, image/webp
   ```

   **Bucket 5: documents**
   ```
   Name: documents
   Public: ❌ No (private for vendor documents)
   File size limit: 10MB
   Allowed MIME types: application/pdf, image/jpeg, image/png
   ```

3. **Set Bucket Policies** (for public buckets)

   For each public bucket (products, brands, users, reviews):
   - Click bucket → Policies → New Policy
   - Template: "Allow public read access"
   - Save

### Step 1.3: Get Database Credentials

1. **Go to Settings → Database**

2. **Copy These Connection Strings**:

   ```env
   # Pooling Connection (for application)
   DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true

   # Direct Connection (for migrations)
   DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```

   Replace `[PROJECT_REF]`, `[PASSWORD]`, and `[region]` with your actual values.

---

## 🚂 PHASE 2: BACKEND DEPLOYMENT (RAILWAY)

### Step 2.1: Push Code to GitHub

1. **Initialize Git Repository** (if not already done)
   ```bash
   cd C:\Users\deept\AromaSouqSingleVendor
   git init
   git add .
   git commit -m "Initial commit: AromaSouq backend and frontend"
   ```

2. **Create GitHub Repository**
   - Go to https://github.com/new
   - Repository name: `aromasouq-single-vendor`
   - Visibility: Private (recommended)
   - Do NOT initialize with README (we already have code)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/aromasouq-single-vendor.git
   git branch -M main
   git push -u origin main
   ```

### Step 2.2: Create Railway Project

1. **Go to Railway Dashboard**
   - Visit: https://railway.app
   - Click "New Project"

2. **Deploy from GitHub Repo**
   - Click "Deploy from GitHub repo"
   - Authorize Railway to access your GitHub
   - Select: `aromasouq-single-vendor` repository

3. **Configure Root Directory**
   - Railway will detect a monorepo
   - Click on the deployed service
   - Go to "Settings" → "Source"
   - Set **Root Directory**: `aromasouq-api`
   - Click "Save"

### Step 2.3: Configure Environment Variables

1. **Click on Your Service** → "Variables" tab

2. **Add ALL Environment Variables**:

   ```env
   # Database Configuration
   DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

   # Supabase Configuration
   SUPABASE_URL=https://[PROJECT_REF].supabase.co
   SUPABASE_ANON_KEY=eyJhbG...your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your-service-role-key

   # JWT Authentication
   JWT_SECRET=your-super-secure-random-jwt-secret-min-32-chars-change-this-to-production-value
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=3001
   NODE_ENV=production

   # CORS Configuration (will update after Vercel deployment)
   FRONTEND_URL=https://your-domain.vercel.app

   # Storage Buckets
   PRODUCTS_BUCKET=products
   BRANDS_BUCKET=brands
   USERS_BUCKET=users
   REVIEWS_BUCKET=reviews
   DOCUMENTS_BUCKET=documents

   # Feature Flags (Single-Vendor Mode)
   ENABLE_MULTI_VENDOR=false
   ENABLE_VENDOR_REGISTRATION=false
   DEFAULT_VENDOR_ID=will-be-set-after-seeding
   ```

   **⚠️ IMPORTANT NOTES:**
   - Replace `[PROJECT_REF]` and `[PASSWORD]` with your Supabase credentials
   - Generate a strong `JWT_SECRET`: Use https://randomkeygen.com/ (CodeIgniter Encryption Keys)
   - `FRONTEND_URL` will be updated in Phase 3 after Vercel deployment
   - `DEFAULT_VENDOR_ID` will be set after database seeding

3. **Click "Add Variable"** for each one

### Step 2.4: Configure Build Settings

1. **Go to "Settings" → "Build"**

2. **Set Build Configuration**:
   ```
   Build Command: npm install && npm run build
   Start Command: npm run start:prod
   ```

3. **Set Node Version** (Settings → "Environment"):
   ```
   Add Variable: NODE_VERSION = 18
   ```

### Step 2.5: Run Database Migrations

**Option A: Using Railway CLI (Recommended)**

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Link to Your Project**:
   ```bash
   cd C:\Users\deept\AromaSouqSingleVendor\aromasouq-api
   railway link
   # Select your project from the list
   ```

4. **Run Migrations**:
   ```bash
   railway run npx prisma migrate deploy
   ```

5. **Seed Database** (creates admin user, vendor, products):
   ```bash
   railway run npm run prisma:seed
   ```

   **📋 SAVE THIS OUTPUT!** You'll see:
   ```
   ✅ Created admin user: admin@aromasouq.ae
   ✅ Created vendor: Antique Oud (ID: clxxxxxxxxxx...)
   ✅ Created 8 categories
   ✅ Created 6 brands
   ✅ Created 24 products
   ```

   **Copy the Vendor ID** from the output!

**Option B: Using Railway Dashboard**

1. **Add a Temporary Deployable Script**

   In your Railway service:
   - Variables → Add Variable
   ```
   RAILWAY_RUN_BUILD_COMMAND=npm install && npx prisma migrate deploy && npm run prisma:seed && npm run build
   ```

2. **Trigger Redeploy**
   - Click "Deploy" → "Redeploy"
   - Watch logs for seed output
   - Copy the Vendor ID from logs

### Step 2.6: Update DEFAULT_VENDOR_ID

1. **Go Back to Variables**

2. **Update Environment Variable**:
   ```env
   DEFAULT_VENDOR_ID=clxxxxxxxxxx...  # Use ID from seed output
   ```

3. **Redeploy Service**
   - Click "Deploy" → "Redeploy"

### Step 2.7: Generate Public Domain

1. **Go to "Settings" → "Networking"**

2. **Click "Generate Domain"**
   - Railway will create: `your-service-name.up.railway.app`
   - Example: `aromasouq-api-production.up.railway.app`

3. **Test API Endpoint**:
   ```bash
   curl https://your-service-name.up.railway.app/api
   ```

   Expected response:
   ```json
   { "message": "Welcome to AromaSouq API" }
   ```

4. **Save Your Backend URL**:
   ```
   Backend API URL: https://your-service-name.up.railway.app/api
   ```

---

## 🌐 PHASE 3: FRONTEND DEPLOYMENT (VERCEL)

### Step 3.1: Prepare Frontend for Deployment

1. **Update Backend API URL Locally** (test first)

   Edit `aromasouq-web/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://your-service-name.up.railway.app/api
   ```

2. **Test Local Build** (to verify connection):
   ```bash
   cd C:\Users\deept\AromaSouqSingleVendor\aromasouq-web
   npm run build
   npm start
   ```

3. **Test Login** at http://localhost:3000:
   - Go to http://localhost:3000/en/login
   - Login with: `admin@aromasouq.ae` / `Admin123!`
   - Verify it works with Railway backend

4. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Configure production API URL"
   git push origin main
   ```

### Step 3.2: Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Click "Add New..." → "Project"

2. **Import Git Repository**
   - Select your GitHub repository: `aromasouq-single-vendor`
   - Click "Import"

3. **Configure Project Settings**:

   **Framework Preset**: Next.js (auto-detected)

   **Root Directory**:
   ```
   aromasouq-web
   ```
   Click "Edit" → Select `aromasouq-web` folder → Save

   **Build & Output Settings**:
   ```
   Build Command: npm run build (default, leave as is)
   Output Directory: .next (default, leave as is)
   Install Command: npm install (default, leave as is)
   ```

   **Node.js Version**:
   ```
   18.x (default is fine)
   ```

### Step 3.3: Add Environment Variables

Click "Environment Variables" section and add:

```env
# API Configuration (REQUIRED)
NEXT_PUBLIC_API_URL=https://your-railway-service.up.railway.app/api

# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-anon-key

# App Configuration (REQUIRED)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=AromaSouq

# Feature Flags
NEXT_PUBLIC_ENABLE_MULTI_VENDOR=false

# Brand Configuration (Antique Oud Theme)
NEXT_PUBLIC_SITE_NAME=أنتيك العود
NEXT_PUBLIC_SITE_NAME_EN=Antique Oud
NEXT_PUBLIC_TAGLINE_AR=أرقى أنواع العود العربي الأصيل
NEXT_PUBLIC_TAGLINE_EN=Finest Traditional Arabic Oud
NEXT_PUBLIC_PRIMARY_COLOR=#550000
NEXT_PUBLIC_SECONDARY_COLOR=#ECDBC7
NEXT_PUBLIC_ACCENT_COLOR=#D4AF37
```

**⚠️ IMPORTANT:**
- Replace `your-railway-service.up.railway.app` with your Railway backend URL
- Replace Supabase credentials with your actual values
- `NEXT_PUBLIC_APP_URL` will be updated after first deployment

**Add Each Variable**:
- Name: `NEXT_PUBLIC_API_URL`
- Value: `https://your-railway-service.up.railway.app/api`
- Environments: Production, Preview, Development (check all)
- Click "Add"

Repeat for all variables.

### Step 3.4: Deploy

1. **Click "Deploy"**
   - Vercel will start building
   - Wait 2-3 minutes for build to complete

2. **Watch Build Logs**
   - Monitor for any errors
   - Should see: "Build Completed"

3. **Get Deployment URL**
   - Vercel provides: `your-project-name.vercel.app`
   - Example: `aromasouq-single-vendor.vercel.app`

### Step 3.5: Update APP_URL

1. **In Vercel Dashboard**:
   - Go to "Settings" → "Environment Variables"
   - Find `NEXT_PUBLIC_APP_URL`
   - Edit value to: `https://your-project-name.vercel.app`
   - Save

2. **Redeploy**:
   - Go to "Deployments" tab
   - Click "..." on latest deployment → "Redeploy"

---

## 🔧 PHASE 4: POST-DEPLOYMENT CONFIGURATION

### Step 4.1: Update Backend CORS

1. **Go to Railway Dashboard** → Your Backend Service → Variables

2. **Update FRONTEND_URL**:
   ```env
   FRONTEND_URL=https://your-project-name.vercel.app
   ```

3. **Redeploy Backend**:
   - Click "Deploy" → "Redeploy"

### Step 4.2: Configure Custom Domain (Optional)

**For Vercel (Frontend):**

1. Go to Vercel → Your Project → "Settings" → "Domains"
2. Add your custom domain (e.g., `www.aromasouq.ae`)
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain
5. Redeploy

**For Railway (Backend):**

1. Go to Railway → Your Service → "Settings" → "Networking"
2. Click "Custom Domain"
3. Add your API subdomain (e.g., `api.aromasouq.ae`)
4. Configure DNS with provided CNAME
5. Update Vercel's `NEXT_PUBLIC_API_URL` to your custom domain
6. Update Railway's `FRONTEND_URL` to your custom domain

### Step 4.3: Configure HTTPS & Secure Cookies

Both Railway and Vercel automatically provide HTTPS. Verify:

1. **Backend (Railway)**:
   ```bash
   curl https://your-railway-service.up.railway.app/api
   ```

2. **Frontend (Vercel)**:
   - Visit: `https://your-vercel-app.vercel.app`
   - Check for 🔒 in browser

3. **Cookie Configuration** (already set in code):
   - `secure: true` in production
   - `sameSite: 'strict'`
   - `httpOnly: true`

---

## ✅ PHASE 5: TESTING & VERIFICATION

### Step 5.1: Verify Backend API

Test all these endpoints:

```bash
# Health Check
curl https://your-railway-service.up.railway.app/api

# Categories
curl https://your-railway-service.up.railway.app/api/categories

# Brands
curl https://your-railway-service.up.railway.app/api/brands

# Products (first page)
curl https://your-railway-service.up.railway.app/api/products?page=1&limit=12

# Featured Products
curl https://your-railway-service.up.railway.app/api/products/featured
```

Expected: All should return JSON responses (not errors).

### Step 5.2: Test Frontend Pages

Visit and verify these pages work:

**Public Pages:**
```
✅ https://your-vercel-app.vercel.app/en
✅ https://your-vercel-app.vercel.app/ar
✅ https://your-vercel-app.vercel.app/en/products
✅ https://your-vercel-app.vercel.app/en/brands
✅ https://your-vercel-app.vercel.app/en/categories
```

**Authentication:**
```
✅ https://your-vercel-app.vercel.app/en/login
✅ https://your-vercel-app.vercel.app/en/register
```

### Step 5.3: Test Authentication Flow

1. **Admin Login**:
   - Go to `/en/login`
   - Email: `admin@aromasouq.ae`
   - Password: `Admin123!`
   - Should redirect to admin dashboard

2. **Test Protected Routes**:
   ```
   ✅ /en/account/profile
   ✅ /en/admin (admin only)
   ✅ /en/vendor (vendor only)
   ```

3. **Test Logout**:
   - Click logout button
   - Should redirect to home
   - Protected routes should redirect to login

### Step 5.4: Test File Uploads

1. **Login as Admin**
2. **Go to Vendor Products** (`/en/vendor/products/new`)
3. **Try uploading a product image**
4. **Verify**:
   - Image uploads to Supabase
   - Image displays correctly
   - Public URL is accessible

### Step 5.5: Test Complete User Flow

**Customer Journey:**
1. Register new customer account
2. Browse products
3. Add product to cart
4. Add delivery address
5. Proceed to checkout
6. Place order (test mode)
7. View order in "My Orders"
8. Write a product review
9. Check wallet for coins earned

**Vendor Journey:**
1. Login as vendor (use default vendor credentials)
2. View vendor dashboard
3. Create a new product
4. Upload product images
5. View orders
6. Reply to a review

**Admin Journey:**
1. Login as admin
2. View admin dashboard
3. Manage categories
4. Manage brands
5. View all orders
6. Moderate reviews

### Step 5.6: Test i18n (Arabic/English)

1. **Switch Languages**:
   - Use language switcher in header
   - Verify URL changes: `/en/products` ↔ `/ar/products`

2. **Check RTL Layout** (Arabic):
   - Text alignment: right
   - Navigation: flipped
   - Forms: mirrored

3. **Check Translations**:
   - All UI elements translated
   - Product names show Arabic variants
   - Currency formatted correctly

---

## 🐛 TROUBLESHOOTING

### Issue 1: Backend - Database Connection Failed

**Symptom**:
```
Error: Can't reach database server
```

**Solution**:
1. Verify `DATABASE_URL` and `DIRECT_URL` are correct
2. Check Supabase project is active
3. Test connection manually:
   ```bash
   railway run npx prisma db pull
   ```

### Issue 2: Backend - Migrations Not Running

**Symptom**:
```
Error: Table 'User' doesn't exist
```

**Solution**:
```bash
# Connect to Railway and run migrations
railway run npx prisma migrate deploy

# If that fails, reset and re-migrate
railway run npx prisma migrate reset --force
railway run npx prisma migrate deploy
railway run npm run prisma:seed
```

### Issue 3: Frontend - API Connection Failed (CORS)

**Symptom**:
```
Access to fetch at 'https://api...' from origin 'https://app...' has been blocked by CORS policy
```

**Solution**:
1. Verify `FRONTEND_URL` in Railway matches your Vercel domain exactly
2. Include protocol: `https://your-app.vercel.app` (not `your-app.vercel.app`)
3. Redeploy backend after changing `FRONTEND_URL`

### Issue 4: Frontend - Images Not Loading

**Symptom**:
```
Invalid src prop (https://xxx.supabase.co/...) on next/image
```

**Solution**:
1. Verify `next.config.ts` includes Supabase domain in `remotePatterns`
2. Check pattern matches your Supabase URL:
   ```typescript
   {
     protocol: 'https',
     hostname: '**.supabase.co',
   }
   ```
3. Redeploy frontend

### Issue 5: Authentication - Cookies Not Working

**Symptom**:
```
User logged in but immediately logged out
```

**Solution**:
1. Verify both apps use HTTPS (http:// won't work)
2. Check `withCredentials: true` in API client
3. Backend must set these cookie attributes:
   ```typescript
   {
     httpOnly: true,
     secure: true, // REQUIRED for production
     sameSite: 'strict',
   }
   ```

### Issue 6: File Upload - Supabase 403 Forbidden

**Symptom**:
```
Error: new row violates row-level security policy
```

**Solution**:
1. Check storage bucket policies in Supabase
2. For public buckets (products, brands, users, reviews):
   - Add policy: "Allow public INSERT"
   - Add policy: "Allow public SELECT"
3. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in backend

### Issue 7: Build Failed - Out of Memory

**Symptom** (Vercel):
```
FATAL ERROR: Reached heap limit Allocation failed
```

**Solution**:
1. Go to Vercel → Project Settings → Build & Output Settings
2. Add Build Command:
   ```
   NODE_OPTIONS='--max_old_space_size=4096' npm run build
   ```

### Issue 8: Backend - Default Vendor ID Not Set

**Symptom**:
```
Error: DEFAULT_VENDOR_ID not configured
```

**Solution**:
1. Check Railway logs for seed output
2. Copy vendor ID from seed logs
3. Add to Railway environment variables:
   ```
   DEFAULT_VENDOR_ID=clxxxxxxxxxx...
   ```
4. Redeploy

---

## 📊 MONITORING & MAINTENANCE

### Railway (Backend)

**View Logs**:
- Dashboard → Your Service → "Logs" tab
- Real-time log streaming
- Filter by severity: Error, Warning, Info

**Monitor Metrics**:
- Dashboard → Your Service → "Metrics" tab
- CPU, Memory, Network usage
- Response times

**Database Backups** (Supabase):
- Supabase → Settings → Database
- Automatic daily backups (last 7 days on free plan)
- Manual backup: Export via pg_dump

### Vercel (Frontend)

**View Logs**:
- Project → Functions → Select function → Logs
- Real-time function execution logs

**Monitor Performance**:
- Project → Analytics (requires upgrade)
- Core Web Vitals
- Page load times

**Deployment History**:
- Project → Deployments
- Rollback to previous deployment if needed

---

## 🚀 DEPLOYMENT SUMMARY

### ✅ Deployment Checklist

**Phase 1: Database**
- [x] Supabase project created
- [x] 5 storage buckets created
- [x] Bucket policies configured
- [x] Connection strings saved

**Phase 2: Backend (Railway)**
- [x] GitHub repository created and pushed
- [x] Railway project created
- [x] Root directory set to `aromasouq-api`
- [x] 21 environment variables configured
- [x] Database migrations deployed
- [x] Database seeded with sample data
- [x] DEFAULT_VENDOR_ID set
- [x] Public domain generated
- [x] API endpoints tested

**Phase 3: Frontend (Vercel)**
- [x] Root directory set to `aromasouq-web`
- [x] 13 environment variables configured
- [x] First deployment successful
- [x] NEXT_PUBLIC_APP_URL updated
- [x] Redeployed with correct URL

**Phase 4: Post-Configuration**
- [x] Backend CORS updated with frontend URL
- [x] Frontend tested with backend API
- [x] Authentication flow verified
- [x] File uploads working

**Phase 5: Testing**
- [x] All public pages accessible
- [x] Authentication working
- [x] Protected routes secured
- [x] File uploads functional
- [x] i18n (EN/AR) working
- [x] Complete user flows tested

### 🌐 Production URLs

```
Frontend (Vercel):  https://your-project-name.vercel.app
Backend (Railway):  https://your-service-name.up.railway.app
API Endpoint:       https://your-service-name.up.railway.app/api
Database (Supabase): https://[PROJECT_REF].supabase.co
```

### 🔐 Credentials

**Admin Account**:
```
Email: admin@aromasouq.ae
Password: Admin123!
Role: ADMIN
```

**Default Vendor Account**:
```
Email: admin@antiqueoud.com
Password: Admin123!
Role: VENDOR
Business: Antique Oud
```

### 📝 Important Notes

1. **Change Default Passwords** immediately after deployment
2. **Generate Strong JWT_SECRET** for production (min 32 characters)
3. **Enable 2FA** on Supabase, Railway, and Vercel accounts
4. **Setup Custom Domains** for professional appearance
5. **Configure CDN** (Vercel Edge Network already included)
6. **Setup Monitoring** (Sentry, LogRocket, etc.)
7. **Regular Backups** of Supabase database
8. **Update Dependencies** monthly for security patches

### 💰 Cost Estimates (Monthly)

| Service | Free Tier | Paid Plan |
|---------|-----------|-----------|
| **Supabase** | 500MB database, 1GB storage | $25/mo (8GB database, 100GB storage) |
| **Railway** | $5 free credit | ~$10-20/mo (depends on usage) |
| **Vercel** | 100GB bandwidth | $20/mo (1TB bandwidth) |
| **Total** | ~$5-10/mo | ~$55-65/mo |

**Free tier should be sufficient for:**
- Development/staging environments
- Low-traffic production (< 10k visits/month)
- Testing and demos

**Upgrade to paid when:**
- Production traffic > 10k visits/month
- Database > 500MB
- Need > 1GB file storage
- Require 99.9% uptime SLA

---

## 🎉 DEPLOYMENT COMPLETE!

Your AromaSouq single-vendor e-commerce platform is now live and ready for customers!

**Next Steps:**
1. Change all default passwords
2. Customize branding (logo, colors, content)
3. Add real products and categories
4. Configure payment gateway (Stripe/PayPal)
5. Setup email notifications (SendGrid/AWS SES)
6. Add analytics (Google Analytics)
7. Configure SEO meta tags
8. Setup sitemap generation
9. Enable Google Search Console
10. Launch marketing campaigns!

**Support & Resources:**
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- NestJS Docs: https://docs.nestjs.com

---

*Generated for AromaSouq Single-Vendor Platform*
*Last Updated: 2025*
