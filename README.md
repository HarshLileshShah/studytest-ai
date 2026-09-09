# 📚 StudyTest AI

[![Live Demo](https://img.shields.io/badge/Live%20Demo-studytest--ai--nu.vercel.app-0070f3?style=for-the-badge&logo=vercel)](https://studytest-ai-nu.vercel.app/dashboard)
[![Next.js](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon.tech-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma%20ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

> **Live Application**: [https://studytest-ai-nu.vercel.app](https://studytest-ai-nu.vercel.app)  
> **Interactive Dashboard**: [https://studytest-ai-nu.vercel.app/dashboard](https://studytest-ai-nu.vercel.app/dashboard)  
> **Engineering Decisions & Trade-Offs**: [`decisions.md`](./decisions.md)  
> **Technical Specification Document**: [`TECHSPEC.md`](./TECHSPEC.md)

---

## ⚡ Quick Demo & Evaluation Setup (Zero Friction)

For evaluating this project, you have two instant options:

### Option A: Test the Live Deployed App (0 Setup)
Open [https://studytest-ai-nu.vercel.app](https://studytest-ai-nu.vercel.app) and click **"Continue with Google"** or **"⚡ Instant Demo Sign-In"** to access the live dashboard with pre-configured data.

---

### Option B: Run Locally in 60 Seconds (No Google OAuth Needed)

You do **not** need to configure Google Cloud OAuth or API credentials to test the platform locally. A built-in demo provider and rich seed script are included.

1. **Clone & Setup Environment**:
   ```bash
   cp .env.example .env.local
   npm install
   ```

2. **Push Schema & Seed Demo Data**:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
   > *The seed script populates a realistic Operating Systems study course with pre-generated quizzes, historical attempt logs with topic error rates (so the Diagnostic Cockpit displays weak spots immediately), and active SuperMemo-2 flashcards.*

3. **Start the App**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000/login](http://localhost:3000/login) and click **"⚡ Instant Demo Sign-In (Zero Setup)"**.

---

## 🧪 Automated Testing

Run the automated test suite (21 tests in ~1.1s) covering SM-2 interval calculations, defensive JSON repair, schema enforcement, and quiz grading:
```bash
npm test
```

```
✔ Defensive JSON Parser & Schema Validation Engine (7 tests)
✔ Quiz Evaluation Engine (4 tests)
✔ SuperMemo-2 (SM-2) Spaced Repetition Algorithm (6 tests)
✔ Utility Functions (4 tests)

ℹ tests 21 | suites 8 | pass 21 | fail 0
```

---

## 🎯 What is StudyTest AI?

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
* **AI Engine**: Google Gemini API / Groq client with defensive regex parsing & local Ollama fallback
* **Authentication**: Auth.js (NextAuth v5) supporting Google SSO & Instant Demo Login

---

## ⚙️ Full Production Environment Setup (Optional)

If you want to configure your own custom OAuth and AI API keys in `.env.local`:
```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=verify-full&connect_timeout=30"
AUTH_SECRET="your_32byte_random_secret"
AUTH_GOOGLE_ID="your_google_oauth_client_id"
AUTH_GOOGLE_SECRET="your_google_oauth_client_secret"
GROQ_API_KEY="gsk_your_groq_api_key"

# Local Ollama AI settings (optional offline mode)
USE_OLLAMA="false"
OLLAMA_BASE_URL="http://localhost:11434/v1"
OLLAMA_MODEL="gemma:2b"
```

---

## 📖 Key Documentation
* [Architecture & Trade-Off Decisions (`decisions.md`)](./decisions.md)
* [Full Technical Specification (`TECHSPEC.md`)](./TECHSPEC.md)
* [Technical Design Document (.docx)](./Technical_Design_Document.docx)
* [Deployment Guide (`DEPLOYMENT.md`)](./DEPLOYMENT.md)
