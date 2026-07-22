# 📚 StudyTest AI

**StudyTest AI** is a premium, AI-powered learning workspace designed to help students master academic concepts. By uploading study documents (PDFs, lectures) or simply typing a topic name, students can let AI synthesize interactive roadmaps, personalized flashcard decks, diagnostic heatmaps, concept flowcharts, audio podcasts, and multi-player quiz sessions.

---

## ✨ Features

### 1. 🎯 AI Weakness Diagnostic Cockpit
* **Concept Heatmap**: Tracks your quiz attempt scores, aggregates errors by specific concepts, and highlights knowledge gaps (accuracy below 70%).
* **Pagination & Detail Subpage**: The dashboard display is limited to the top 4 weakest concepts, with a dedicated `/dashboard/diagnostics` subpage rendering the complete set of knowledge analytics.
* **🔥 Slay Weaknesses**: A single-click remediation tool that uses AI to compile a targeted remedial flashcard deck covering your weakest concepts.

### 2. 📁 AI Topic & Summary Document Creator
* **Upload PDF**: Process local files to build custom study materials.
* **✨ Study Topic**: Simply type the name of any topic (e.g. "Linear Algebra", "Mitochondria") to have the AI generate a high-quality study guide and bootstrap a virtual document.

### 3. 📝 Configurable Practice Quizzes
* **Multiple Formats**: Practice with Multiple Choice Questions (MCQ), True/False statements, Short Answers, or Interactive Oral Exams.
* **Blended MCQ**: The MCQ category automatically blends standard questions and multiple-choice fill-in-the-blank statements (`_______`).
* **Cognitive Style Focus**: Choose between:
  * 📚 **Theory**: Emphasizes concept definitions, academic rules, and facts.
  * 🛠️ **Practical**: Scenario-based problem solving with concrete, real-world examples.
  * 🔄 **Mixed**: A balanced blend of both.
* **Academic Rigor & Tone**: Employs a formal, standardized testing tone with no conversational banter.

### 4. 🕸️ Mermaid Concept Flowcharts
* **Interactive Explorer**: Render dynamic Mermaid flowchart maps of academic concepts on-the-fly. Select concepts from a clickable side panel to trigger immediate chat explanations or quiz generation.

### 5. ⚔️ Gamified RPG Questboard & Merchant Shop
* **Quests**: Complete daily learning tasks to earn XP and Gold. Level up automatically.
* **Merchant Shop**: Spend your study Gold to acquire custom scholastic Titles and unlock premium layout themes.
* **Theme Selectors**: Unlock custom visual modes (e.g. Glassmorphism, Neon Cyberpunk, Lofi Cafe) that dynamically adapt to the application's light/dark mode triggers.

---

## 🏗️ Tech Stack

* **Frontend**: Next.js 16 (App Router, Turbopack), Tailwind CSS v4, Lucide React, Mermaid.js
* **Backend**: Next.js Server Actions (`"use server"`), Prisma ORM Client v7, Neon PostgreSQL
* **AI Engine**: Google Gemini API client
* **Authentication**: Auth.js (NextAuth v5) supporting Google SSO and Dangerous Email Account Linking

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

# Local Ollama AI settings
USE_OLLAMA="false"
OLLAMA_BASE_URL="http://localhost:11434/v1"
OLLAMA_MODEL="gemma:2b"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database Schemas
Sync the Prisma schema migrations directly to your database instance:
```bash
npx prisma db push
npx prisma generate
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Locally with Google Gemma (Ollama)
To run all AI features locally and for free without calling external cloud API endpoints, you can use Ollama:
1. Download and install [Ollama](https://ollama.com) on your local machine.
2. Download the Google Gemma model (we suggest the fast and lightweight `gemma:2b` or the full `gemma`):
   ```bash
   ollama run gemma:2b
   ```
3. Update your `.env.local` to enable local routing:
   ```env
   USE_OLLAMA="true"
   OLLAMA_MODEL="gemma:2b" # must match the downloaded tag name
   ```

---

## 🏆 Reusable UI Library
The project features a custom design primitive layer located in `components/ui/` that unifies layouts and theme behaviors:
* `Card`: Standardizes cards and glass container borders.
* `Button`: Handles standard actions, variant colors, sizes, and spinner state indicators.
* `Modal`: Handles portal-rendered overlays and backdrop dismiss events.
* `Badge`: Visual status tags with semantic colors.
* `ProgressBar`: Theme-adaptive progress indicator matching light/dark mode variables.
