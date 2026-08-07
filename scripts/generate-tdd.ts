import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from "docx";
import * as fs from "fs";
import * as path from "path";

// Main Document Builder
function createTdd() {
  const sections = [
    // --- TITLE PAGE ---
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
          text: "COMPREHENSIVE TECHNICAL DESIGN DOCUMENT",
          bold: true,
          size: 28,
          color: "4B5563",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 1200 },
      children: [
        new TextRun({
          text: "An AI-Powered Learning Platform and Interactive Presentation Engine",
          size: 20,
          italics: true,
          color: "6B7280",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 2000 },
      children: [
        new TextRun({ text: "Author: ", bold: true, size: 24 }),
        new TextRun({ text: "StudyTest AI Architecture Team\n", size: 24 }),
        new TextRun({ text: "OS Platform: ", bold: true, size: 24 }),
        new TextRun({ text: "macOS Core Target\n", size: 24 }),
        new TextRun({ text: "Version: ", bold: true, size: 24 }),
        new TextRun({ text: "1.5.0 (Enterprise Specification)\n", size: 24 }),
        new TextRun({ text: "Date: ", bold: true, size: 24 }),
        new TextRun({ text: new Date().toLocaleDateString() + "\n", size: 24 }),
      ],
    }),

    // --- Page Spacer ---
    new Paragraph({ text: "", spacing: { before: 100 } }),

    // --- TABLE OF CONTENTS ---
    new Paragraph({
      text: "Table of Contents",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ text: "1. Executive Summary\n", bold: true, size: 24 }),
        new TextRun({ text: "2. Background & Problem Statement\n", bold: true, size: 24 }),
        new TextRun({ text: "3. Goals & Non-Goals\n", bold: true, size: 24 }),
        new TextRun({ text: "4. User Stories\n", bold: true, size: 24 }),
        new TextRun({ text: "5. Functional & Non-Functional Requirements\n", bold: true, size: 24 }),
        new TextRun({ text: "6. High-Level Architecture & Tech Stack\n", bold: true, size: 24 }),
        new TextRun({ text: "7. System Components & Interface Design\n", bold: true, size: 24 }),
        new TextRun({ text: "8. AI Pipeline & Gateway Routing\n", bold: true, size: 24 }),
        new TextRun({ text: "9. API Design & Security Configurations\n", bold: true, size: 24 }),
        new TextRun({ text: "10. Performance, Scale & Logging\n", bold: true, size: 24 }),
        new TextRun({ text: "11. Testing Strategy & Design Decisions\n", bold: true, size: 24 }),
        new TextRun({ text: "12. Future Enhancements & Appendix\n", bold: true, size: 24 }),
      ],
    }),

    // --- EXECUTIVE SUMMARY ---
    new Paragraph({
      text: "1. Executive Summary",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "StudyTest AI is a premium educational technology platform designed to streamline material assimilation through automated artificial intelligence pipelines. The platform targets two user personas: Students (who need contextual tutoring, mock quiz attempts, smart study planning calendar tools, and gamified flashcards) and Presenters/Teachers (who host live interactive sessions containing bullet point outlines, multiple choice quiz tournaments, real-time polls, tag cloud visualizers, and audience Q&A boards).",
          size: 24,
        }),
      ],
    }),

    // --- BACKGROUND & PROBLEM STATEMENT ---
    new Paragraph({
      text: "2. Background & Problem Statement",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Traditional learning methodologies fail to keep students engaged during remote self-study and classroom instruction. Study materials (such as long PDFs and textbook chapters) are dry and hard to structure, while interactive classroom tools (like Mentimeter) are disconnected from self-study outlines. StudyTest AI bridges this gap by merging a document processing AI engine with an E2E real-time multiplayer slide deck engine so that study resources feed directly into quiz game rooms and live sessions.",
          size: 24,
        }),
      ],
    }),

    // --- GOALS & NON-GOALS ---
    new Paragraph({
      text: "3. Goals & Non-Goals",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 150, left: 360 },
      children: [
        new TextRun({ text: "3.1 Project Goals\n", bold: true, size: 24 }),
        new TextRun({ text: "• Standardize Visual PDF Parsing: Support parsing multi-page documents and converting pages to base64 images for OCR extraction.\n", size: 24 }),
        new TextRun({ text: "• Unified AI Gateways: Allow users to securely provide their own keys (BYOK model) dynamically saved in browser cookie variables.\n", size: 24 }),
        new TextRun({ text: "• Live Interactive Deck: Sync presenters with student devices over rapid polling loops with distinct poll, quiz, Q&A, and leaderboard states.\n", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200, left: 360 },
      children: [
        new TextRun({ text: "3.2 Non-Goals\n", bold: true, size: 24 }),
        new TextRun({ text: "• Built-in Video Conferencing: Hosting audio/video streams is out of scope; the presentation engine assumes screen sharing or physical classrooms.\n", size: 24 }),
        new TextRun({ text: "• Permanent File Hosting: The system acts as a processor; heavy file storage hosting remains out of bounds.\n", size: 24 }),
      ],
    }),

    // --- USER STORIES ---
    new Paragraph({
      text: "4. User Stories",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "• As an Educator, ", bold: true, size: 24 }),
        new TextRun({ text: "I want to create customized slide decks with information bullets, MCQ quizzes, and survey polls so that I can gauge class comprehension in real time.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 720 },
      children: [
        new TextRun({ text: "• As a Student, ", bold: true, size: 24 }),
        new TextRun({ text: "I want to join multiplayer quiz lobbies via sharing codes, submit answers, and see my rank on leaderboards to stay motivated.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200, left: 720 },
      children: [
        new TextRun({ text: "• As a Student, ", bold: true, size: 24 }),
        new TextRun({ text: "I want to upload a PDF textbook outline, auto-generate flashcards, and study them with gamified score systems.", size: 24 }),
      ],
    }),

    // --- REQUIREMENTS ---
    new Paragraph({
      text: "5. Functional & Non-Functional Requirements",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 150, left: 360 },
      children: [
        new TextRun({ text: "5.1 Functional Requirements\n", bold: true, size: 24 }),
        new TextRun({ text: "• Render dynamic presentations with instant slide customizations (add, delete, reorder slides).\n• Handle distinct POLL and MULTIPLE_CHOICE slide structures (polls display live votes without score calculations; quiz slides award 100 points for correct submissions).\n• Support audience Q&A submission boards with presenter-approved moderations and upvotes.\n", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200, left: 360 },
      children: [
        new TextRun({ text: "5.2 Non-Functional Requirements\n", bold: true, size: 24 }),
        new TextRun({ text: "• Synchronization Latency: Interactive slide state updates must propagate to student clients within a target threshold of 1.5 seconds.\n• High-Contrast Premium Theme: Responsive visual interfaces optimized for mobile and desktop viewports utilizing sleek dark themes.\n", size: 24 }),
      ],
    }),

    // --- HIGH-LEVEL ARCHITECTURE ---
    new Paragraph({
      text: "6. High-Level Architecture & Tech Stack",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "StudyTest AI is architected as a Next.js web application utilizing Neon serverless PostgreSQL storage, Auth.js for session validation, and Prisma ORM client mappings.",
          size: 24,
        }),
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

    // --- SYSTEM COMPONENTS ---
    new Paragraph({
      text: "7. System Components & Interface Design",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 150, left: 360 },
      children: [
        new TextRun({ text: "7.1 Frontend Component Design\n", bold: true, size: 24 }),
        new TextRun({ text: "• Presenter Client: Controls Lobby status, slide transitions, results displays, and customizer slide lists.\n• Student Client: Polling loop updates slide views dynamically, displaying voting cards and input fields.\n", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 360 },
      children: [
        new TextRun({ text: "7.2 Backend Component Design\n", bold: true, size: 24 }),
        new TextRun({ text: "• Server Actions Controllers: Transactional routes executing state logic (join lobbies, submit answers, advanced slides).\n", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200, left: 360 },
      children: [
        new TextRun({ text: "7.3 Database schema design\n", bold: true, size: 24 }),
        new TextRun({ text: "• InteractiveSession: maps session lobby settings.\n• SessionSlide: tracks indices, types, options, and correct answers.\n• SessionParticipant & SessionResponse: tracks connected sockets/profiles, scores, and votes.\n", size: 24 }),
      ],
    }),

    // --- AI PIPELINE ---
    new Paragraph({
      text: "8. AI Pipeline & Gateway Routing",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "The AI router utilizes request-level configuration. Settings (keys, providers, model names) are read from cookies, ensuring zero database key persistence. PDF processing executes visual outlines via multimodal AI prompts by passing base64 documents inside a standard data-url. Fallback options generate static layouts if APIs fail.",
          size: 24,
        }),
      ],
    }),

    // --- API DESIGN & SECURITY ---
    new Paragraph({
      text: "9. API Design & Security Configurations",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 150, left: 360 },
      children: [
        new TextRun({ text: "9.1 API Server Actions Interfaces\n", bold: true, size: 24 }),
        new TextRun({ text: "• submitSlideResponseAction(slideId, value, participantUserId): Records poll selections or quiz grades.\n• updateSessionSlidesAction(sessionId, slides): Recreates slide array lists inside a transaction.\n", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150, left: 360 },
      children: [
        new TextRun({ text: "9.2 Error Handling & Resilience\n", bold: true, size: 24 }),
        new TextRun({ text: "If an LLM OCR parser request times out, the backend defaults to standard dynamic text outlines automatically to protect user workflow continuity.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200, left: 360 },
      children: [
        new TextRun({ text: "9.3 Security Specifications\n", bold: true, size: 24 }),
        new TextRun({ text: "• Auth.js validates credentials securely using encrypted cookies.\n• Host checking restricts local Ollama configurations only to 'localhost' connections, avoiding security exposures on public URLs.\n", size: 24 }),
      ],
    }),

    // --- PERFORMANCE, SCALE & LOGGING ---
    new Paragraph({
      text: "10. Performance, Scale & Logging",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 150, left: 360 },
      children: [
        new TextRun({ text: "10.1 Performance & Scalability\n", bold: true, size: 24 }),
        new TextRun({ text: "To support large concurrent sessions, Prisma database connections are pooled, and static page caching is applied to dashboard and document outline screens. The 1.5s student sync poll queries a lightweight session state view, reducing write contention.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200, left: 360 },
      children: [
        new TextRun({ text: "10.2 Monitoring & Logging\n", bold: true, size: 24 }),
        new TextRun({ text: "Backend service processes log structured JSON messages describing request targets, LLM latency metrics, and database transactional execution times for easy monitoring.", size: 24 }),
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

    // --- TESTING & DESIGN DECISIONS ---
    new Paragraph({
      text: "11. Testing Strategy & Design Decisions",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 150, left: 360 },
      children: [
        new TextRun({ text: "11.1 Testing Strategy\n", bold: true, size: 24 }),
        new TextRun({ text: "The strategy combines unit tests for AI parsers, integration tests for server action database inserts, and local E2E simulation of student joining flows.", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200, left: 360 },
      children: [
        new TextRun({ text: "11.2 Trade-offs & Design Decisions\n", bold: true, size: 24 }),
        new TextRun({ text: "• Polling vs. WebSockets: Polling was selected over WebSockets to allow standard serverless action scales on Vercel without configuring separate sticky session servers.\n• Cookie Key Storage: Keeps keys local to browser, ensuring zero compliance overhead for backend database storage.\n", size: 24 }),
      ],
    }),

    // --- FUTURE ENHANCEMENTS ---
    new Paragraph({
      text: "12. Future Enhancements & Appendix",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 150, left: 360 },
      children: [
        new TextRun({ text: "12.1 Future Enhancements\n", bold: true, size: 24 }),
        new TextRun({ text: "• WebRTC sync channels for instantaneous presentations updates.\n• Advanced AI document processing models with audio-out narration support.\n", size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200, left: 360 },
      children: [
        new TextRun({ text: "12.2 Appendix\n", bold: true, size: 24 }),
        new TextRun({ text: "Contains instructions for running local Ollama servers: bind network interfaces via 'OLLAMA_HOST=0.0.0.0 ollama serve' and expose it via localtunnel tunnels.", size: 24 }),
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
    console.log(`Successfully generated Technical Design Document with all requested chapters: ${filePath}`);
  })
  .catch((err) => {
    console.error("Failed to generate DOCX document:", err);
    process.exit(1);
  });
