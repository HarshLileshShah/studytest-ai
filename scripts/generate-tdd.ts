import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from "docx";
import * as fs from "fs";
import * as path from "path";

// Main Document Builder
function createTdd() {
  const sections = [
    // --- 1. TITLE PAGE ---
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 300 },
      children: [
        new TextRun({
          text: "StudyTest AI",
          bold: true,
          size: 72,
          color: "7C3AED", // Violet-600
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 1200 },
      children: [
        new TextRun({
          text: "TECHNICAL DESIGN DOCUMENT",
          bold: true,
          size: 32,
          color: "4B5563",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 1200 },
      children: [
        new TextRun({
          text: "AI-Powered Learning Platform & Real-Time Classroom Presentation Engine",
          size: 20,
          italics: true,
          color: "6B7280",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 2400 },
      children: [
        new TextRun({ text: "Author: ", bold: true, size: 24 }),
        new TextRun({ text: "StudyTest AI Development Team\n", size: 24 }),
        new TextRun({ text: "OS Target: ", bold: true, size: 24 }),
        new TextRun({ text: "macOS Target Compilation\n", size: 24 }),
        new TextRun({ text: "Version: ", bold: true, size: 24 }),
        new TextRun({ text: "1.4.0 (Stable Release)\n", size: 24 }),
        new TextRun({ text: "Date: ", bold: true, size: 24 }),
        new TextRun({ text: new Date().toLocaleDateString() + "\n", size: 24 }),
      ],
    }),

    // --- Page Break ---
    new Paragraph({ text: "", spacing: { before: 100 } }), // Placeholder for page break spacer

    // --- 2. EXECUTIVE SUMMARY ---
    new Paragraph({
      text: "1. Executive Summary",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "StudyTest AI is a premium, state-of-the-art educational tech platform designed to simplify material assimilation through artificial intelligence. By uploading study documents (PDFs), students can generate personalized mock quizzes, create customizable flashcard decks, chat with an interactive tutor, and schedule smart study plans. For teachers and educators, the platform provides a complete real-time classroom presentation engine (matching Mentimeter core features) to host live slide shows, multiple choice quizzes, keyword word clouds, surveys, and upvoteable audience Q&A sessions.",
          size: 24,
        }),
      ],
    }),

    // --- 3. SYSTEM ARCHITECTURE DESIGN ---
    new Paragraph({
      text: "2. System Architecture Design",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "The application is built on top of the modern Next.js framework (utilizing App Router structure) for optimized routing, server actions execution, and static page optimizations. Below are the key architectural layers:",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "• Client Component Layer: ", bold: true, size: 24 }),
        new TextRun({ text: "Built with React client views, Lucide icons, and Vanilla/Tailwind CSS variables for a premium dark mode aesthetic. Handles real-time polling sync loops (1.5-second intervals) for interactive slideshow synchronization.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "• Server Actions Controllers: ", bold: true, size: 24 }),
        new TextRun({ text: "Next.js server-side modules that execute secure transactional commands (document uploading, live slide updates, quiz creations) directly interfacing with the Prisma client.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200, left: 720 },
      children: [
        new TextRun({ text: "• Database ORM Layer: ", bold: true, size: 24 }),
        new TextRun({ text: "Prisma client connecting to a Neon PostgreSQL instance. Enables transactional queries, cascade deletions, and relational syncs.", size: 24 }),
      ],
    }),
    // Embedded System Architecture Diagram
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 300 },
      children: [
        new ImageRun({
          data: fs.readFileSync(path.join(process.cwd(), "public/system_architecture.png")),
          transformation: {
            width: 450,
            height: 450,
          },
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: "Figure 1: StudyTest AI - Application Architecture Flow Diagram",
          italics: true,
          size: 18,
          color: "6B7280",
        }),
      ],
    }),

    // --- 4. DATABASE ARCHITECTURE ---
    new Paragraph({
      text: "3. Database Schema Architecture",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "The database models are structured to scale and support multiplayer sessions. The main relations are described below:",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 360 },
      children: [
        new TextRun({ text: "3.1 User & Documents relations\n", bold: true, size: 24 }),
        new TextRun({ text: "Users upload documents. Each document records metadata (file size, page count, filename), along with parsed textual representations ('extractedText') and visual summaries ('visualOutline'). Deleting a user cascades and deletes all related documents.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 360 },
      children: [
        new TextRun({ text: "3.2 Quiz & Flashcard models\n", bold: true, size: 24 }),
        new TextRun({ text: "Quiz sessions record options, correct answers, and grading thresholds. Flashcard decks map card terms and definitions generated via visual model extraction.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200, left: 360 },
      children: [
        new TextRun({ text: "3.3 Interactive Live Session tables\n", bold: true, size: 24 }),
        new TextRun({ text: "Interactive Sessions ('interactive_sessions') map to a document. Slides ('session_slides') record index positions, type ('INFO', 'MULTIPLE_CHOICE', 'POLL', 'WORD_CLOUD', 'LEADERBOARD', 'Q_A'), and choices. Student participants register, submit slide responses, and post upvoteable Q&As.", size: 24 }),
      ],
    }),

    // --- 5. CORE SERVICE LAYERS ---
    new Paragraph({
      text: "4. Core Service Layers & AI Proxy",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 150, left: 360 },
      children: [
        new TextRun({ text: "4.1 Dynamic Cookie-Driven AI Router\n", bold: true, size: 24 }),
        new TextRun({ text: "The platform features a 'Bring Your Own Keys' (BYOK) paradigm. The global AI client in 'ai.service.ts' acts as an asynchronous proxy wrapper. It parses settings (API key, model choice, provider choice) dynamically from browser cookies at request time, routing completions to OpenAI, OpenRouter, Groq, or default system Gemini keys securely.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 360 },
      children: [
        new TextRun({ text: "4.2 PDF OCR Engine\n", bold: true, size: 24 }),
        new TextRun({ text: "Utilizes standardized OpenAI-compatible multimodal gateways to pass base64-encoded PDF visual payloads directly in a single data URL call structure: 'data:application/pdf;base64,...' to extract clean structures, outline layouts, and study definitions.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200, left: 360 },
      children: [
        new TextRun({ text: "4.3 Live Slides Sync & Customizer\n", bold: true, size: 24 }),
        new TextRun({ text: "During the LOBBY phase, hosts customize titles, bullet outlines, and poll choice selections. Saving deletes old slides and inserts the new list transactional array using nested relational mappings. Sync clients poll at 1.5s intervals to update views.", size: 24 }),
      ],
    }),
    // Embedded Live Session Sync Flow Diagram
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 300 },
      children: [
        new ImageRun({
          data: fs.readFileSync(path.join(process.cwd(), "public/live_session_flow.png")),
          transformation: {
            width: 450,
            height: 450,
          },
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: "Figure 2: Interactive Live Session Real-time Synchronization Loop",
          italics: true,
          size: 18,
          color: "6B7280",
        }),
      ],
    }),

    // --- 6. DEPLOYMENT & DEVELOPMENT OPERATION ---
    new Paragraph({
      text: "5. Operational Guide & Diagnostics",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "StudyTest AI target deployment is optimized for serverless hosting on Vercel. For local offline development and testing of local Ollama server models:",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "1. Serve Ollama: ", bold: true, size: 24 }),
        new TextRun({ text: "Run 'OLLAMA_HOST=0.0.0.0 ollama serve' locally to bind network interfaces.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "2. Tunnels Routing: ", bold: true, size: 24 }),
        new TextRun({ text: "Execute tunneling services (localtunnel or ngrok on port 11434) to expose endpoints to the Vercel cloud environment.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200, left: 720 },
      children: [
        new TextRun({ text: "3. Host Validation: ", bold: true, size: 24 }),
        new TextRun({ text: "The settings panel dynamically checks 'window.location.hostname' to render the Local Ollama server choice only on 'localhost' and hide it in public cloud deployments.", size: 24 }),
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
    console.log(`Successfully generated Technical Design Document with embedded design diagrams: ${filePath}`);
  })
  .catch((err) => {
    console.error("Failed to generate DOCX document:", err);
    process.exit(1);
  });
