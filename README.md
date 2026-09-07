# 📚 StudyTest AI

[![Live Demo](https://img.shields.io/badge/Live%20Demo-studytest--ai--nu.vercel.app-0070f3?style=for-the-badge&logo=vercel)](https://studytest-ai-nu.vercel.app/dashboard)
[![Next.js](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon.tech-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma%20ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

> **Live Application**: [https://studytest-ai-nu.vercel.app](https://studytest-ai-nu.vercel.app)  
> **Interactive Dashboard**: [https://studytest-ai-nu.vercel.app/dashboard](https://studytest-ai-nu.vercel.app/dashboard)  
> **Technical Architecture & Trade-Offs**: [`decisions.md`](./decisions.md)  
> **Technical Specification Document**: [`TECHSPEC.md`](./TECHSPEC.md)

---

## 🎯 Overview

**StudyTest AI** is an intelligent learning operating system designed to eliminate passive learning. By uploading study documents (PDFs, lectures) or entering topic queries, students synthesize active learning pipelines:
- **Diagnostic Knowledge Heatmaps** with one-click automated remediation
- **SuperMemo-2 (SM-2)** Algorithmic Spaced Repetition Flashcards
- **Multi-Speaker Audio Podcasts** (Alex & Taylor) using dynamic client-side voice synthesis
- **Interactive Mermaid.js Concept Mind-Maps**
- **Real-Time Multiplayer Quiz Battles & RPG Gamification**

---

## ✨ Core Features

### 1. 🎯 AI Weakness Diagnostic Cockpit
* **Concept Heatmap**: Aggregates question-level scores by conceptual topic tags to expose exact retention gaps ($<70\%$ accuracy threshold).
* **🔥 Slay Weaknesses**: A single-click remediation workflow that triggers AI to synthesize targeted remedial SM-2 flashcard decks specifically for your weakest concepts.
* **Granular Analytics**: Deep performance tracking with historical attempt trajectories and topic-by-topic breakdowns (`/dashboard/diagnostics`).

### 2. 🧠 Algorithmic Spaced Repetition (SuperMemo-2)
* Built on the **SM-2 algorithm** with Ease Factor clamping ($\ge 1.3$) to prevent interval collapse.
* Dynamically computes personalized review schedules based on student recall ratings (1–5 scale).

### 3. 🎙️ AI Lecture Podcast (Alex & Taylor)
* Formats uploaded materials into a dynamic co-host debate between two AI personas (`Alex` & `Taylor`).
* Uses browser `SpeechSynthesis` API with custom pitch/gender queues and a synchronized bouncing frequency visualizer with zero streaming latency.

### 4. 📝 Configurable Practice Quizzes
* **Multiple Modes**: MCQ (with contextual fill-in-the-blank variants), True/False, and Short Answer with AI semantic grading.
* **Cognitive Styles**: Focus on **Theory** (definitions & facts), **Practical** (scenario problem solving), or **Mixed**.

### 5. 🕸️ Mermaid Concept Flowcharts & Mind-Maps
* Generates interactive Mermaid diagram hierarchy graphs on-the-fly.
* Clickable concept sidebar to instantly seed the AI tutor chat or generate instant drill quizzes.

### 6. ⚔️ Gamified RPG Questboard & Merchant Shop
* Daily study quests grant $+50\text{ XP}$ and $+10\text{ Gold}$.
* In-app Merchant Shop allows students to unlock custom scholastic titles and adaptive themes (Neon Cyberpunk, Lofi Cafe, Glassmorphism).

---

## 🏗️ Tech Stack & Architecture

```mermaid
graph TD
    User([Next.js 16 Client App]) <-->|Type-Safe Server Actions| SA[Server Actions RPC Layer]
    SA <--> Services[Domain Business Services]
    Services <-->|Prisma ORM v7| NeonDB[(Neon PostgreSQL Serverless)]
    Services <-->|Structured JSON Chains| AI[Gemini API / Local Gemma]
    User <-->|SpeechSynthesis Queue| Audio[Dual-Voice Podcast Player]
```

* **Frontend**: Next.js 16 (App Router, Turbopack), Tailwind CSS v4, Lucide React, Mermaid.js
* **Backend**: Next.js Server Actions (`"use server"`), Prisma ORM v7, Neon PostgreSQL
* **AI Engine**: Google Gemini API client with defensive JSON parsing & local Ollama fallback
* **Authentication**: Auth.js (NextAuth v5) supporting Google SSO & Account Linking

---

## 🚀 Getting Started

### 1. Environment Configuration
Create a `.env.local` file in the root directory:
```bash
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require&connect_timeout=30"
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

### 3. Setup Database Schemas
```bash
npx prisma db push
npx prisma generate
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing
Run the automated test suite covering SM-2 scheduling, quiz evaluation, and defensive AI response parsing:
```bash
npm test
```

---

## 📖 Key Documentation
* [Architecture & Trade-Off Decisions (`decisions.md`)](./decisions.md)
* [Full Technical Specification (`TECHSPEC.md`)](./TECHSPEC.md)
* [Deployment Guide (`DEPLOYMENT.md`)](./DEPLOYMENT.md)
