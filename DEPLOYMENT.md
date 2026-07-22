# 🚀 Deployment Guide: StudyTest AI

This guide walks you through deploying **StudyTest AI** to production on **Vercel** (recommended), **Railway**, **Render**, or **Docker**.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have gathered the following credentials:
1. **Neon PostgreSQL URL**: Sign up at [Neon.tech](https://neon.tech) and copy your connection string (ensure `&connect_timeout=30` is appended).
2. **Groq API Key**: Create a free API key at [Groq Console](https://console.groq.com/keys).
3. **Google OAuth Client**: Set up a Web Application OAuth Client ID in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
4. **Auth Secret**: Generate a secure 32-byte secret (e.g. `openssl rand -hex 32`).

---

## ⚡ Deployment Option 1: Deploy to Vercel (Recommended)

Vercel provides native zero-config support for Next.js 16 App Router applications.

### Step 1: Push Repository to GitHub
Ensure your latest code is pushed to your remote GitHub or GitLab repository.

### Step 2: Import Project to Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your `create-test` / `studytest-ai` repository.
3. Framework Preset: **Next.js**.

### Step 3: Configure Environment Variables
Add the following key-value pairs under **Environment Variables**:

| Variable Name | Description | Example / Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon Postgres Connection String | `postgresql://user:pass@ep-host.neon.tech/neondb?sslmode=verify-full&connect_timeout=30` |
| `AUTH_SECRET` | Auth.js secret | `a3f91e92d89b14c3e80f97bc4a7d...` |
| `AUTH_TRUST_HOST` | Host header trust for NextAuth | `true` |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | `your_id.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | `GOCSPX-your_secret` |
| `GROQ_API_KEY` | Cloud Groq Llama 3 Key | `gsk_your_key` |
| `USE_OLLAMA` | Cloud fallback flag | `false` |

### Step 4: Deploy
Click **Deploy**. Vercel will automatically run `npm install`, trigger `postinstall` (`prisma generate`), build static pages, and assign a production URL (e.g. `https://studytest-ai.vercel.app`).

### Step 5: Update Google OAuth Redirect URIs
1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Edit your OAuth 2.0 Client ID.
3. Add your Vercel URL to **Authorized JavaScript origins**:
   `https://studytest-ai.vercel.app`
4. Add your callback route to **Authorized redirect URIs**:
   `https://studytest-ai.vercel.app/api/auth/callback/google`

---

## 🚄 Deployment Option 2: Deploy to Railway / Render

### Railway Setup
1. Log in to [Railway.app](https://railway.app) and create a **New Project**.
2. Choose **Deploy from GitHub repo**.
3. Add a PostgreSQL plugin or attach your Neon `DATABASE_URL`.
4. In **Variables**, add all keys from `.env.example`.
5. Railway will automatically run `npm run build` and start the server with `npm run start`.

---

## 🐳 Deployment Option 3: Docker Container

If you prefer to run inside a standalone Docker container or Kubernetes cluster, use the following `Dockerfile`:

```dockerfile
# Base image
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# Production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

---

## 🧪 Post-Deployment Verification

1. Open your deployed domain (e.g. `https://your-domain.vercel.app`).
2. Log in using Google SSO.
3. Upload a sample study document or create a topic.
4. Click **Generate Quiz** and verify that the AI quiz builder succeeds and saves attempt logs to Neon Postgres.
