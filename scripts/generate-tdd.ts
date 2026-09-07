import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, BorderStyle } from "docx";
import * as fs from "fs";
import * as path from "path";

function createTdd() {
  const sections: Paragraph[] = [
    // =========================================================================
    // TITLE & COVER PAGE
    // =========================================================================
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1400, after: 300 },
      children: [
        new TextRun({
          text: "StudyTest AI",
          bold: true,
          size: 76,
          color: "7C3AED", // Violet-600
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: "COMPREHENSIVE TECHNICAL DESIGN DOCUMENT",
          bold: true,
          size: 30,
          color: "1F2937",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 1200 },
      children: [
        new TextRun({
          text: "An Intelligent Learning Operating System, Algorithmic Spaced Repetition Platform, and Real-Time Interactive Presentation Engine",
          size: 22,
          italics: true,
          color: "4B5563",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 2400, after: 600 },
      children: [
        new TextRun({ text: "Document Version: ", bold: true, size: 24 }),
        new TextRun({ text: "2.0.0 (Production Architecture Specification)\n", size: 24 }),
        new TextRun({ text: "Author / Engineering Team: ", bold: true, size: 24 }),
        new TextRun({ text: "StudyTest AI Core Architecture & Systems Engineering\n", size: 24 }),
        new TextRun({ text: "Target Environment: ", bold: true, size: 24 }),
        new TextRun({ text: "Production Serverless (Vercel Edge/Node) + PostgreSQL (Neon)\n", size: 24 }),
        new TextRun({ text: "Live Application: ", bold: true, size: 24 }),
        new TextRun({ text: "https://studytest-ai-nu.vercel.app\n", size: 24 }),
        new TextRun({ text: "Last Updated: ", bold: true, size: 24 }),
        new TextRun({ text: `${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}\n`, size: 24 }),
      ],
    }),

    // =========================================================================
    // TABLE OF CONTENTS
    // =========================================================================
    new Paragraph({
      text: "Table of Contents",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 800, after: 300 },
    }),
    new Paragraph({
      spacing: { after: 300 },
      children: [
        new TextRun({ text: "1. Executive Summary .......................................................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "2. Background & Problem Statement ........................................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "3. Goals & Objectives ........................................................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "4. Non-Goals & Scope Boundaries ............................................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "5. User Stories & Personas .................................................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "6. Functional Requirements ..................................................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "7. Non-Functional Requirements ..............................................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "8. High-Level Architecture (Figure 1) .....................................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "9. Technology Stack & Frameworks ............................................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "10. Core System Components .................................................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "11. Frontend Architecture & Design Primitives .............................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "12. Backend Architecture & RPC Server Actions ..............................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "13. Database Schema & Data Models (Figure 2) ...............................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "14. AI Document Pipeline & Defensive Ingestion Engine (Figure 3) ............................................\n", bold: true, size: 22 }),
        new TextRun({ text: "15. Spaced Repetition Engine: SuperMemo-2 (SM-2) Mechanics (Figure 4) .......................................\n", bold: true, size: 22 }),
        new TextRun({ text: "16. Interactive Presentation & Real-time Live Session Engine (Figure 5) .....................................\n", bold: true, size: 22 }),
        new TextRun({ text: "17. API Contracts & Action Signatures ........................................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "18. Error Handling, Retries & Transaction Rollbacks .........................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "19. Security, Authentication & Isolation ....................................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "20. Performance, Latency & Connection Pooling ...............................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "21. Observability, Telemetry & Logging ......................................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "22. Automated Testing Matrix & Quality Assurance ............................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "23. Production Scaling Roadmap .............................................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "24. Trade-Offs & Key Design Decisions .......................................................................\n", bold: true, size: 22 }),
        new TextRun({ text: "25. Appendix .................................................................................................\n", bold: true, size: 22 }),
      ],
    }),

    // =========================================================================
    // 1. EXECUTIVE SUMMARY
    // =========================================================================
    new Paragraph({
      text: "1. Executive Summary",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "StudyTest AI is a high-performance educational operating system engineered to eliminate the 'passive consumption trap' in modern learning. Traditional learning environments flood students with static PDFs, lengthy textbook chapters, and fragmented notes that fail to cultivate long-term memory retention. StudyTest AI solves this by transforming unstructured academic inputs into dynamic, diagnostic, and active recall learning loops.",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "The platform integrates four foundational pillars: (1) An AI-driven diagnostic evaluation cockpit that flags knowledge deficiencies with conceptual heatmaps and triggers targeted remediation; (2) An algorithmic spaced repetition flashcard engine powered by SuperMemo-2 (SM-2); (3) A browser-native dual-voice podcast synthesis player (Alex & Taylor) delivering zero-latency multi-speaker debates; and (4) An interactive live slide presenter engine facilitating real-time classroom polls, MCQ tournaments, tag cloud visualizers, and audience Q&A boards.",
          size: 24,
        }),
      ],
    }),

    // =========================================================================
    // 2. BACKGROUND & PROBLEM STATEMENT
    // =========================================================================
    new Paragraph({
      text: "2. Background & Problem Statement",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Digital education tools currently suffer from two primary architectural flaws:",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "1. The Passive Rereading Trap: ", bold: true, size: 24 }),
        new TextRun({ text: "Students spend hours rereading highlighted text, which creates an illusion of competence while yielding near-zero long-term retention compared to active recall testing.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "2. Disconnected Classroom Tooling: ", bold: true, size: 24 }),
        new TextRun({ text: "Classroom presentation and polling tools (e.g., Mentimeter, Kahoot) operate in complete isolation from students' individual study outlines, requiring teachers to manually duplicate questions and preventing students from continuing post-lecture review on their weak topics.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "StudyTest AI unifies document ingestion, concept graph extraction, personalized spaced repetition, and real-time live presentation into a single cohesive data model.",
          size: 24,
        }),
      ],
    }),

    // =========================================================================
    // 3. GOALS & OBJECTIVES
    // =========================================================================
    new Paragraph({
      text: "3. Goals & Objectives",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "• Automated Synthesis: ", bold: true, size: 24 }),
        new TextRun({ text: "Convert any PDF or topic query into structured quiz banks, flashcard decks, and Mermaid mind-maps in under 10 seconds.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "• Diagnostic Precision: ", bold: true, size: 24 }),
        new TextRun({ text: "Map every student mistake to specific topic taxonomies, displaying conceptual heatmaps and offering 1-click remedial flashcard generation.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "• Spaced Repetition Rigor: ", bold: true, size: 24 }),
        new TextRun({ text: "Implement standard SM-2 mathematical intervals with lower bound clamping (EF >= 1.3) to prevent interval collapse.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "• Zero-Cost Audio Synthesis: ", bold: true, size: 24 }),
        new TextRun({ text: "Synthesize multi-speaker podcast debates entirely on the client device using Web Speech APIs, eliminating cloud TTS per-character API costs.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200, left: 720 },
      children: [
        new TextRun({ text: "• Serverless Multiplayer: ", bold: true, size: 24 }),
        new TextRun({ text: "Provide low-latency live presentation synchronization (sub-1.5s) over serverless PostgreSQL infrastructure without requiring dedicated long-running stateful servers.", size: 24 }),
      ],
    }),

    // =========================================================================
    // 4. NON-GOALS & SCOPE BOUNDARIES
    // =========================================================================
    new Paragraph({
      text: "4. Non-Goals & Scope Boundaries",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "To maintain architectural simplicity and rapid execution, the following are explicitly out of scope for the current release: (1) Hosting custom streaming video infrastructure; (2) Permanent raw binary file warehousing (extracted text is stored, while binary blobs are discarded after parsing); (3) Replacing full-scale Learning Management Systems (LMS) like Canvas/Blackboard.",
          size: 24,
        }),
      ],
    }),

    // =========================================================================
    // 5. USER STORIES & PERSONAS
    // =========================================================================
    new Paragraph({
      text: "5. User Stories & Personas",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "• Student (Self-Study): ", bold: true, size: 24 }),
        new TextRun({ text: "As a student preparing for exams, I want to upload my lecture slides, take adaptive quizzes with AI semantic feedback, and review flashcards on optimal SM-2 intervals so that I retain concepts effortlessly.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "• Student (Weakness Remediation): ", bold: true, size: 24 }),
        new TextRun({ text: "As a student with low scores in specific chapters, I want the Diagnostic Cockpit to highlight my weak concepts (<70% accuracy) and generate a remedial deck in 1 click.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "• Presenter / Educator: ", bold: true, size: 24 }),
        new TextRun({ text: "As an instructor, I want to create customized slide decks with interactive polls, timed MCQs, and word clouds so that I can gauge classroom understanding in real-time.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200, left: 720 },
      children: [
        new TextRun({ text: "• Participant (Classroom Attendee): ", bold: true, size: 24 }),
        new TextRun({ text: "As a lecture participant, I want to enter a 6-character room code on my phone, submit live responses, and view aggregate results instantly on the presenter screen.", size: 24 }),
      ],
    }),

    // =========================================================================
    // 6. FUNCTIONAL REQUIREMENTS
    // =========================================================================
    new Paragraph({
      text: "6. Functional Requirements",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun({ text: "FR-1: Document Processing & Topic Synthesizer: ", bold: true, size: 24 }),
        new TextRun({ text: "Support PDF parsing and pure text extraction. Also support ad-hoc topic inputs where the AI bootstraps a full study document from scratch.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun({ text: "FR-2: Configurable Practice Quizzes: ", bold: true, size: 24 }),
        new TextRun({ text: "Support Multiple Choice (MCQ), True/False, Short Answer (with semantic AI evaluation), and Fill-in-the-Blank modes, filtered by cognitive style (Theory, Practical, Mixed).", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun({ text: "FR-3: Diagnostic Heatmap & 'Slay Weaknesses': ", bold: true, size: 24 }),
        new TextRun({ text: "Group all historical attempt mistakes by topic, calculate aggregate percentage accuracy, and expose a 1-click remediation action.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun({ text: "FR-4: SM-2 Spaced Repetition Engine: ", bold: true, size: 24 }),
        new TextRun({ text: "Grade flashcards on a 0–5 quality scale and compute next review dates using SuperMemo-2 mathematical formulas.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun({ text: "FR-5: AI Dual-Voice Podcast Engine: ", bold: true, size: 24 }),
        new TextRun({ text: "Generate structured co-host scripts with speaker tags ([Alex]: / [Taylor]:) and render them via dynamic browser speech synthesis queues with visualizer animation.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({ text: "FR-6: Interactive Slide Session Customizer: ", bold: true, size: 24 }),
        new TextRun({ text: "Create and order slides (Content, MCQ, Poll, Word Cloud, Q&A), broadcast active slide index, and aggregate student participant submissions in real-time.", size: 24 }),
      ],
    }),

    // =========================================================================
    // 7. NON-FUNCTIONAL REQUIREMENTS
    // =========================================================================
    new Paragraph({
      text: "7. Non-Functional Requirements",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun({ text: "NFR-1: Latency & Synchronization: ", bold: true, size: 24 }),
        new TextRun({ text: "Live presentation polling cycle must not exceed 1500ms; quiz evaluation responses must return within 800ms.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun({ text: "NFR-2: Type Safety: ", bold: true, size: 24 }),
        new TextRun({ text: "100% strict TypeScript codebase with shared types between frontend components, server actions, and Prisma ORM models.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun({ text: "NFR-3: Security & Privacy: ", bold: true, size: 24 }),
        new TextRun({ text: "User credentials protected by Auth.js encrypted session cookies; API keys isolated; Local Ollama requests strictly validated to prevent SSRF vulnerabilities.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({ text: "NFR-4: Accessibility & Theming: ", bold: true, size: 24 }),
        new TextRun({ text: "Theme-adaptive design system conforming to WCAG AA color contrast standards across light and dark modes.", size: 24 }),
      ],
    }),

    // =========================================================================
    // 8. HIGH-LEVEL ARCHITECTURE
    // =========================================================================
    new Paragraph({
      text: "8. High-Level Architecture",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "The platform leverages Next.js 16 (App Router) as a unified full-stack architecture. Frontend client components communicate directly with backend domain services via Server Actions ('use server'). The domain service layer manages business workflows, executes Prisma ORM transactions against serverless PostgreSQL, and delegates prompt chains to the abstracted AI gateway.",
          size: 24,
        }),
      ],
    }),
    // Embedded Figure 1: System Architecture
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 200 },
      children: [
        new ImageRun({
          data: fs.readFileSync(path.join(process.cwd(), "public/system_architecture.png")),
          transformation: {
            width: 520,
            height: 520,
          },
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: "Figure 1: StudyTest AI - High-Level System Architecture & Component Interactions",
          bold: true,
          italics: true,
          size: 20,
          color: "4B5563",
        }),
      ],
    }),

    // =========================================================================
    // 9. TECHNOLOGY STACK
    // =========================================================================
    new Paragraph({
      text: "9. Technology Stack & Frameworks",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({ text: "• Frontend Framework: ", bold: true, size: 24 }),
        new TextRun({ text: "Next.js 16 (App Router, Turbopack, React 19)\n", size: 24 }),
        new TextRun({ text: "• Styling & Design System: ", bold: true, size: 24 }),
        new TextRun({ text: "Tailwind CSS v4 with adaptive CSS variables, Lucide React icons\n", size: 24 }),
        new TextRun({ text: "• State Management: ", bold: true, size: 24 }),
        new TextRun({ text: "Zustand (client-side quiz and audio playback states), React Query\n", size: 24 }),
        new TextRun({ text: "• Backend & RPC: ", bold: true, size: 24 }),
        new TextRun({ text: "Next.js Server Actions ('use server') with atomic transaction boundaries\n", size: 24 }),
        new TextRun({ text: "• Database: ", bold: true, size: 24 }),
        new TextRun({ text: "PostgreSQL on Neon Serverless with connection pooling\n", size: 24 }),
        new TextRun({ text: "• ORM Layer: ", bold: true, size: 24 }),
        new TextRun({ text: "Prisma Client v7 with generated TypeScript bindings\n", size: 24 }),
        new TextRun({ text: "• AI Completion Gateway: ", bold: true, size: 24 }),
        new TextRun({ text: "Google Gemini 1.5 API client with Local Ollama (Gemma 2B) fallback\n", size: 24 }),
        new TextRun({ text: "• Audio Synthesis: ", bold: true, size: 24 }),
        new TextRun({ text: "Browser-native Web Speech Synthesis API\n", size: 24 }),
        new TextRun({ text: "• Visual Diagrams: ", bold: true, size: 24 }),
        new TextRun({ text: "Mermaid.js dynamic rendering engine\n", size: 24 }),
        new TextRun({ text: "• Authentication: ", bold: true, size: 24 }),
        new TextRun({ text: "Auth.js (NextAuth v5) supporting Google SSO and account linking\n", size: 24 }),
      ],
    }),

    // =========================================================================
    // 10. CORE SYSTEM COMPONENTS
    // =========================================================================
    new Paragraph({
      text: "10. Core System Components",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun({ text: "1. Document & Ingestion Engine: ", bold: true, size: 24 }),
        new TextRun({ text: "Parses PDF buffers, strips noise, generates visual outlines, and token-budgets text for downstream generation.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun({ text: "2. Practice Quiz & Diagnostic Engine: ", bold: true, size: 24 }),
        new TextRun({ text: "Generates varied question formats, handles automated scoring, evaluates open-ended short answers semantically, and updates user mastery heatmaps.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun({ text: "3. Spaced Repetition Engine: ", bold: true, size: 24 }),
        new TextRun({ text: "Executes the SM-2 mathematical model, manages card review schedules, and handles single-card highlights from text.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun({ text: "4. Dual-Voice Podcast Engine: ", bold: true, size: 24 }),
        new TextRun({ text: "Synthesizes multi-speaker educational scripts and coordinates client audio queues with synchronized frequency bars.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({ text: "5. Interactive Presentation & Live Session Engine: ", bold: true, size: 24 }),
        new TextRun({ text: "Maintains real-time classroom lobbies, controls slide advancement, records audience votes, and computes live leaderboard ranks.", size: 24 }),
      ],
    }),

    // =========================================================================
    // 11. FRONTEND ARCHITECTURE
    // =========================================================================
    new Paragraph({
      text: "11. Frontend Architecture & Design Primitives",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "The frontend adopts a component-driven architecture built around a unified UI design primitive library (`components/ui/`):",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "• Card Primitive: ", bold: true, size: 24 }),
        new TextRun({ text: "Standardizes surface depth, border glow, and glassmorphism styling across light and dark modes.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "• Button Primitive: ", bold: true, size: 24 }),
        new TextRun({ text: "Provides variant hierarchy (primary, secondary, danger, ghost), active loading spinners, and keyboard focus rings.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "• Modal & Drawer Primitives: ", bold: true, size: 24 }),
        new TextRun({ text: "React portal overlays with focus traps, escape key listeners, and backdrop blur dismissals.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200, left: 720 },
      children: [
        new TextRun({ text: "• ProgressBar & Heatmap Badges: ", bold: true, size: 24 }),
        new TextRun({ text: "Color-coded indicators rendering mastery levels (<60% red, 60-79% amber, >=80% emerald).", size: 24 }),
      ],
    }),

    // =========================================================================
    // 12. BACKEND ARCHITECTURE
    // =========================================================================
    new Paragraph({
      text: "12. Backend Architecture & RPC Server Actions",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "All backend business logic is encapsulated in domain service modules (`services/*.service.ts`) invoked exclusively through Next.js Server Actions (`app/actions/*.actions.ts`). Server Actions act as type-safe controllers that enforce user authorization, sanitize input payloads via Zod, manage database transactions via Prisma `$transaction`, and revalidate UI paths upon state mutation.",
          size: 24,
        }),
      ],
    }),

    // =========================================================================
    // 13. DATABASE SCHEMA & DATA MODELS
    // =========================================================================
    new Paragraph({
      text: "13. Database Schema & Data Models",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "The PostgreSQL schema consists of 14 interconnected models designed for relational integrity, cascade deletions, and optimal query indexing. Figure 2 illustrates the Entity Relationship Diagram (ERD).",
          size: 24,
        }),
      ],
    }),
    // Embedded Figure 2: Database ERD
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 200 },
      children: [
        new ImageRun({
          data: fs.readFileSync(path.join(process.cwd(), "public/database_erd.jpg")),
          transformation: {
            width: 540,
            height: 304,
          },
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: "Figure 2: PostgreSQL Entity Relationship Diagram (ERD) - Schema Architecture & Relations",
          bold: true,
          italics: true,
          size: 20,
          color: "4B5563",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Core Models Summary:\n• User: Stores profile, gamification stats (XP, Gold, Level), streak counters, and active visual themes.\n• Document: Manages uploaded PDF text, visual outlines, and generated podcast scripts.\n• GeneratedQuiz & Question: Stores AI-generated quiz questions, format types, option arrays, and topic tags.\n• Attempt & Answer: Captures student quiz attempt performance, question-by-question selections, and AI feedback.\n• FlashcardDeck, Flashcard & FlashcardProgress: Tracks Leitner/SM-2 review intervals, ease factors, repetitions, and next review timestamps.\n• InteractiveSession, SessionSlide & SessionResponse: Powers real-time live presenter lobbies, slide sequences, and audience responses.",
          size: 24,
        }),
      ],
    }),

    // =========================================================================
    // 14. AI DOCUMENT PIPELINE & DEFENSIVE INGESTION
    // =========================================================================
    new Paragraph({
      text: "14. AI Document Pipeline & Defensive Ingestion Engine",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "AI generation in production is vulnerable to non-deterministic formatting, hallucinated schemas, and rate limit failures. StudyTest AI solves this with a resilient multi-stage pipeline illustrated in Figure 3.",
          size: 24,
        }),
      ],
    }),
    // Embedded Figure 3: AI Pipeline Flow
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 200 },
      children: [
        new ImageRun({
          data: fs.readFileSync(path.join(process.cwd(), "public/ai_pipeline_flow.jpg")),
          transformation: {
            width: 540,
            height: 304,
          },
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: "Figure 3: Multi-Stage AI Document Processing Pipeline & Defensive Sanitization Flow",
          bold: true,
          italics: true,
          size: 20,
          color: "4B5563",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Key Pipeline Steps:\n1. Ingestion: PDF buffers or topic strings are extracted and token-budgeted.\n2. LLM Gateway: Routes requests to Google Gemini 1.5 Pro or local Ollama Gemma 2B based on environment config.\n3. Defensive Parser: Regex strips markdown code fences (```json ... ```) and auto-repairs truncated trailing brackets.\n4. Zod Schema Validation: Validates object shapes and enforces business constraints (e.g. verifying that correctAnswer exists within options array).\n5. Persistence: Transactionally commits validated entities to PostgreSQL.",
          size: 24,
        }),
      ],
    }),

    // =========================================================================
    // 15. SPACED REPETITION ENGINE: SM-2 MECHANICS
    // =========================================================================
    new Paragraph({
      text: "15. Spaced Repetition Engine: SuperMemo-2 (SM-2) Mechanics",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "The Spaced Repetition Engine optimizes memory consolidation using the SuperMemo-2 (SM-2) algorithm. The complete execution state machine is illustrated in Figure 4.",
          size: 24,
        }),
      ],
    }),
    // Embedded Figure 4: SM-2 Flowchart
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 200 },
      children: [
        new ImageRun({
          data: fs.readFileSync(path.join(process.cwd(), "public/sm2_algorithm_flow.jpg")),
          transformation: {
            width: 540,
            height: 304,
          },
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: "Figure 4: SuperMemo-2 (SM-2) Spaced Repetition Interval & Ease Factor State Machine",
          bold: true,
          italics: true,
          size: 20,
          color: "4B5563",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Mathematical Specification:\n• Ease Factor (EF) Adjustment:\n  EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))\n• Lower Bound Clamping:\n  EF' = Math.max(EF', 1.3) — Critical guard to prevent permanent interval collapse on difficult concepts.\n• Interval (I) Progression:\n  - If q < 3 (Recall Failure): Repetitions = 0, Interval = 1 Day\n  - If q >= 3 (Recall Success):\n      Repetition 1: I = 1 Day\n      Repetition 2: I = 6 Days\n      Repetition n > 2: I(n) = Math.round(I(n-1) * EF')",
          size: 24,
        }),
      ],
    }),

    // =========================================================================
    // 16. INTERACTIVE PRESENTATION & LIVE SESSION ENGINE
    // =========================================================================
    new Paragraph({
      text: "16. Interactive Presentation & Real-Time Live Session Engine",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "The Live Session Engine facilitates synchronized classroom interactions between presenters and hundreds of student participants. The synchronization loop is shown in Figure 5.",
          size: 24,
        }),
      ],
    }),
    // Embedded Figure 5: Live Session Flow
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 200 },
      children: [
        new ImageRun({
          data: fs.readFileSync(path.join(process.cwd(), "public/live_session_flow.png")),
          transformation: {
            width: 520,
            height: 520,
          },
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: "Figure 5: Interactive Live Presentation Real-Time Synchronization & Polling Loop",
          bold: true,
          italics: true,
          size: 20,
          color: "4B5563",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Protocol Design:\n• Presenter advances slide -> updates activeSlideIndex in database.\n• Student clients poll every 1.5s -> fetch lightweight state payloads and render the current slide view.\n• Student submits vote/response -> transaction controller logs answer and recomputes aggregated leaderboard stats.",
          size: 24,
        }),
      ],
    }),

    // =========================================================================
    // 17. API CONTRACTS & ACTION SIGNATURES
    // =========================================================================
    new Paragraph({
      text: "17. API Contracts & Action Signatures",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Key Server Action Signatures:\n• generateQuizAction(documentId: string, options: QuizOptions): Promise<GeneratedQuiz>\n• submitAttemptAction(quizId: string, answers: AnswerInput[], timeSpent: number): Promise<AttemptResult>\n• reviewFlashcardAction(cardId: string, quality: number): Promise<FlashcardProgress>\n• slayWeaknessesAction(topic: string): Promise<FlashcardDeck>\n• advanceSlideAction(sessionId: string, direction: 'NEXT' | 'PREV'): Promise<SessionState>\n• submitSlideResponseAction(slideId: string, value: string): Promise<void>",
          size: 24,
        }),
      ],
    }),

    // =========================================================================
    // 18. ERROR HANDLING & TRANSACTIONS
    // =========================================================================
    new Paragraph({
      text: "18. Error Handling, Retries & Transaction Rollbacks",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "All multi-entity database mutations (e.g. creating quizzes with nested questions, or saving attempt logs with answers) are wrapped in Prisma `$transaction` blocks. If any nested write fails, the entire transaction rolls back cleanly, preventing orphaned database records. AI completion failures trigger exponential backoff retries before gracefully falling back to static visual outlines.",
          size: 24,
        }),
      ],
    }),

    // =========================================================================
    // 19. SECURITY & AUTHENTICATION
    // =========================================================================
    new Paragraph({
      text: "19. Security, Authentication & Isolation",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "• Session Management: Auth.js (NextAuth v5) using encrypted HTTP-only JWT cookies.\n• Authorization: Server Actions verify session userId against document and quiz ownership before executing mutations.\n• Host Validation: Local Ollama connections are strictly constrained to localhost loopbacks (127.0.0.1 / localhost) to eliminate Server-Side Request Forgery (SSRF) attack vectors.",
          size: 24,
        }),
      ],
    }),

    // =========================================================================
    // 20. PERFORMANCE & SCALABILITY
    // =========================================================================
    new Paragraph({
      text: "20. Performance, Latency & Connection Pooling",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Database connections are pooled through Neon's serverless connection pooler (`?sslmode=require&connect_timeout=30`), preventing connection exhaustion under heavy concurrent serverless lambda invocations. Client-side audio generation offloads computation from servers entirely.",
          size: 24,
        }),
      ],
    }),

    // =========================================================================
    // 21. OBSERVABILITY & LOGGING
    // =========================================================================
    new Paragraph({
      text: "21. Observability, Telemetry & Logging",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Server Actions log structured event payloads capturing execution timings, LLM token usage, parsing status, and database latency metrics, enabling rapid root-cause diagnosis for production incidents.",
          size: 24,
        }),
      ],
    }),

    // =========================================================================
    // 22. AUTOMATED TESTING MATRIX
    // =========================================================================
    new Paragraph({
      text: "22. Automated Testing Matrix & Quality Assurance",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "The testing suite (`npm test`) executes automated unit and regression tests covering:\n1. SuperMemo-2 Spaced Repetition Engine: Validates interval progressions (1 -> 6 -> I*EF), recall failure resets (q < 3), EF decay formulas, and minimum clamping (EF >= 1.3).\n2. Quiz Evaluation Engine: Validates case-insensitive MCQ grading, whitespace trimming, and score percentage calculations.\n3. Utility Functions: Validates time formatters, file size converters, and score color thresholds.",
          size: 24,
        }),
      ],
    }),

    // =========================================================================
    // 23. PRODUCTION SCALING ROADMAP
    // =========================================================================
    new Paragraph({
      text: "23. Production Scaling Roadmap",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "• Asynchronous Background Workers (BullMQ + Redis): Offload multi-page PDF OCR and podcast generation to background job queues with Server-Sent Events (SSE).\n• Vector Embeddings & Hybrid RAG (pgvector + BM25): Semantic chunking and vector similarity search across 500+ page textbook libraries.\n• WebSockets / LiveKit: Upgrade live classroom synchronization from polling to WebSockets for sub-50ms real-time question clocks.",
          size: 24,
        }),
      ],
    }),

    // =========================================================================
    // 24. TRADE-OFFS & DESIGN DECISIONS
    // =========================================================================
    new Paragraph({
      text: "24. Trade-offs & Key Design Decisions",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "1. Next.js Server Actions vs Microservices: Server Actions eliminate API contract drift and enable transactional Prisma queries directly, avoiding microservice deployment overhead.\n2. Web Speech API vs Cloud TTS: Client-side synthesis provides zero-cost and instant playback, trading off synthetic voice consistency across operating systems.\n3. Polling vs WebSockets: 1.5s polling runs natively on serverless Vercel endpoints without requiring dedicated persistent socket servers.",
          size: 24,
        }),
      ],
    }),

    // =========================================================================
    // 25. APPENDIX
    // =========================================================================
    new Paragraph({
      text: "25. Appendix",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Environment Configuration Reference:\nDATABASE_URL='postgresql://user:pass@host/db?sslmode=require&connect_timeout=30'\nNEXTAUTH_SECRET='...'\nAUTH_GOOGLE_ID='...'\nAUTH_GOOGLE_SECRET='...'\nGEMINI_API_KEY='...'\nUSE_OLLAMA='false'\nOLLAMA_BASE_URL='http://localhost:11434/v1'\nOLLAMA_MODEL='gemma:2b'",
          size: 24,
        }),
      ],
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  return doc;
}

// Generate the docx and save it
const doc = createTdd();
Packer.toBuffer(doc)
  .then((buffer) => {
    const filePath = path.join(process.cwd(), "Technical_Design_Document.docx");
    fs.writeFileSync(filePath, buffer);
    console.log(`Successfully generated Comprehensive Technical Design Document: ${filePath}`);
  })
  .catch((err) => {
    console.error("Failed to generate DOCX document:", err);
    process.exit(1);
  });
