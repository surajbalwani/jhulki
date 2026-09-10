# Jhulki Haute Couture Apparel

Bespoke luxury clothing website built with **Angular 21** frontend and **Next.js 15 API** backend powered by **Supabase PostgreSQL** & **Prisma ORM**.

---

## 🚀 Quick Vercel Deployment Instructions

### 1. Deploy Next.js Backend API
1. Push repository to GitHub or run Vercel CLI (`vercel` inside `nextjs-backend`).
2. In Vercel Project Settings -> **Root Directory**, set to `nextjs-backend`.
3. Add **Environment Variables**:
   - `DATABASE_URL`: `postgresql://postgres:jhulki%400919@db.oejbnxhrxfrwppozaphg.supabase.co:5432/postgres?sslmode=require`
   - `DIRECT_URL`: `postgresql://postgres:jhulki%400919@db.oejbnxhrxfrwppozaphg.supabase.co:5432/postgres?sslmode=require`
   - `JWT_SECRET`: `jhulki-luxury-secret-key-2026`
4. Deploy! Your API URL will be `https://your-backend.vercel.app`.

---

### 2. Deploy Angular Frontend UI
1. In Vercel Project Settings -> **Root Directory**, set to `frontend`.
2. Build Settings (auto-detected via `vercel.json`):
   - Build Command: `ng build --configuration production`
   - Output Directory: `dist/frontend/browser`
3. Deploy! Your UI URL will be `https://your-frontend.vercel.app`.

---

## 🔑 Demo Credentials
- **Admin Portal**: `admin@jhulki.com` / `AdminPass123!`
- **Client Account**: `client@jhulki.com` / `CustomerPass123!`
