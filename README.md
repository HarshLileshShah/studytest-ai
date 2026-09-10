# 📚 StudyTest AI

[![Live Demo](https://img.shields.io/badge/Live%20Demo-studytest--ai--nu.vercel.app-0070f3?style=for-the-badge&logo=vercel)](https://studytest-ai-nu.vercel.app/dashboard)
[![Next.js](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon.tech-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma%20ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

> **Live Application**: [https://studytest-ai-nu.vercel.app](https://studytest-ai-nu.vercel.app)  
> **Interactive Dashboard**: [https://studytest-ai-nu.vercel.app/dashboard](https://studytest-ai-nu.vercel.app/dashboard)  
> **Option 4 Architectural Brief & Decisions**: [`decisions.md`](./decisions.md)  
> **Technical Specification Document**: [`TECHSPEC.md`](./TECHSPEC.md)

---

## 🎯 Overview

**StudyTest AI** turns unstructured study documents (PDFs, lectures, syllabi) into active recall and diagnostic learning loops:
- **🎯 AI Weakness Diagnostic Cockpit**: Clusters quiz mistakes by concept tags and triggers **"🔥 Slay Weaknesses"** 1-click remedial flashcards.
- **🧠 SuperMemo-2 (SM-2) Spaced Repetition**: Algorithmic scheduling with Ease Factor lower-bound clamping ($\text{EF} \ge 1.3$) to prevent interval collapse.
- **🎙️ Dual-Voice AI Podcast (Alex & Taylor)**: Client-side speech synthesis generating co-host debates with zero API latency or cost.
- **📝 Configurable Practice Quizzes**: Theory vs. Practical cognitive modes, MCQ, True/False, and semantic Short Answer grading.
- **🕸️ Mermaid Concept Flowcharts**: Dynamic on-the-fly hierarchy graph rendering.
- **⚔️ RPG Questboard & Merchant Shop**: Daily learning quests rewarding XP and Gold for theme unlocks.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    User([Next.js 16 Client App]) <-->|Type-Safe Server Actions| SA[Server Actions RPC Layer]
    SA <--> Services[Domain Business Services]
    Services <-->|Prisma ORM v7| NeonDB[(Neon PostgreSQL Serverless)]
    Services <-->|Structured JSON Chains| AI[Gemini API / Local Gemma via Ollama]
    User <-->|SpeechSynthesis Queue| Audio[Dual-Voice Podcast Player]
```

* **Frontend**: Next.js 16 (App Router, Turbopack), Tailwind CSS v4, Lucide React, Mermaid.js
* **Backend**: Next.js Server Actions (`"use server"`), Prisma ORM v7, Neon PostgreSQL
* **AI Engine**: Google Gemini API client with defensive regex parsing & local Ollama fallback
* **Authentication**: Auth.js (NextAuth v5) supporting Google SSO & Instant Demo Login

---

## 🚀 Getting Started

### 🚀 Quick Demo (No Setup Required)

The app is live and ready to test:

**Live URL**: https://studytest-ai-nu.vercel.app

**Demo account** (pre-loaded with sample documents and quiz data):
- Email: demo@studytest.ai
- Sign in via Google using this account

Or sign in with your own Google account — a fresh workspace will be created automatically.

**What to try first:**
1. Go to Dashboard → upload any PDF (lecture notes, textbook chapter, article)
2. Click "Generate Quiz" — Gemini will produce a quiz in ~10 seconds
3. Take the quiz → check the Diagnostics tab to see your weak topics
4. Generate Flashcards → review them with the SM-2 spaced repetition scheduler

---

### 1. Environment Configuration
Create a `.env.local` file in the root directory:
```bash
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=verify-full&connect_timeout=30"
NEXTAUTH_SECRET="your_nextauth_secret_here"
AUTH_GOOGLE_ID="your_google_auth_id"
AUTH_GOOGLE_SECRET="your_google_auth_secret"
GEMINI_API_KEY="your_google_gemini_api_key"

# Local Ollama AI settings (optional fallback)
USE_OLLAMA="false"
OLLAMA_BASE_URL="http://localhost:11434/v1"
OLLAMA_MODEL="gemma:2b"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database Schemas & Seed Data
```bash
npx prisma db push
npx prisma db:seed
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

Run the automated test suite (covering SM-2 interval calculations, defensive JSON repair, schema enforcement, and quiz grading):
```bash
npm test
```

```
✔ Defensive JSON Parser & Schema Validation Engine
✔ Quiz Evaluation Engine
✔ SuperMemo-2 (SM-2) Spaced Repetition Algorithm
✔ Utility Functions

ℹ tests passing without failures
```

---

## 📖 Key Documentation
* [Architecture & Trade-Off Decisions (`decisions.md`)](./decisions.md)
* [Full Technical Specification (`TECHSPEC.md`)](./TECHSPEC.md)
* [Technical Design Document (.docx)](./Technical_Design_Document.docx)
* [Deployment Guide (`DEPLOYMENT.md`)](./DEPLOYMENT.md)
