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
      spacing: { before: 600, after: 300 },
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun({ text: "1. Executive Summary .......................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "2. Background & Problem Statement ........................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "3. Goals ........................................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "4. Non-Goals ....................................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "5. User Stories .................................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "6. Functional Requirements ..................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "7. Non-Functional Requirements ..............................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "8. High-Level Architecture ...................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "9. Technology Stack ............................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "10. System Components .......................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "11. Frontend Design .............................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "12. Backend Design ..............................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "13. Database Design .............................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "14. AI Pipeline ..................................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "15. API Design ...................................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "16. Error Handling .............................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "17. Security .....................................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "18. Performance & Scalability .................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "19. Monitoring & Logging .......................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "20. Testing Strategy ............................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "21. Future Enhancements .......................................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "22. Trade-offs & Design Decisions .............................................................................\n", bold: true, size: 24 }),
        new TextRun({ text: "23. Appendix .....................................................................................................\n", bold: true, size: 24 }),
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

    // --- GOALS ---
    new Paragraph({
      text: "3. Goals",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "The main objectives of StudyTest AI are to standardize visual PDF document content parsing via OCR, establish dynamically routed cookie-driven BYOK AI API completions gateways, and facilitate low-latency multiplayer presentation decks syncing over standard serverless hosting layers.",
          size: 24,
        }),
      ],
    }),

    // --- NON-GOALS ---
    new Paragraph({
      text: "4. Non-Goals",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Building custom streaming video panels, permanent storage hosts, or third-party email campaign servers are explicitly excluded from the product architecture design scope.",
          size: 24,
        }),
      ],
    }),

    // --- USER STORIES ---
    new Paragraph({
      text: "5. User Stories",
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

    // --- FUNCTIONAL REQUIREMENTS ---
    new Paragraph({
      text: "6. Functional Requirements",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "The platform must support instant slide customizer modifications (adding/ordering slides), separated POLL and MULTIPLE_CHOICE slide presentation behaviors, live tag-cloud submissions, and upvoteable moderator-approved audience Q&A questions.",
          size: 24,
        }),
      ],
    }),

    // --- NON-FUNCTIONAL REQUIREMENTS ---
    new Paragraph({
      text: "7. Non-Functional Requirements",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Student live session updates must sync within a 1.5-second polling interval limit. User credentials must remain secure under Auth.js encrypted cookies. The visual theme must deliver high contrast dark modes conforming to premium responsive CSS layout rules.",
          size: 24,
        }),
      ],
    }),

    // --- HIGH-LEVEL ARCHITECTURE ---
    new Paragraph({
      text: "8. High-Level Architecture",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "The application is built on top of the modern Next.js framework (utilizing App Router structure) for optimized routing, server actions execution, and static page optimizations. Below is the architecture flow mapping frontend clients, server actions controllers, database ORMs, and external API gateways:",
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

    // --- TECHNOLOGY STACK ---
    new Paragraph({
      text: "9. Technology Stack",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "• Core: Next.js (App Router), React, TypeScript\n• Styling: Vanilla CSS, Tailwind CSS Variables\n• Database: Neon Serverless PostgreSQL\n• ORM: Prisma Client\n• Security: Auth.js (NextAuth v5)\n• AI Gateway: Custom BYOK dynamic completions proxy router",
          size: 24,
        }),
      ],
    }),

    // --- SYSTEM COMPONENTS ---
    new Paragraph({
      text: "10. System Components",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "The platform comprises three major integrated components: the self-guided study system (handling quiz generation, diagnostic tracking, and flashcards), the interactive presenter engine (managing lobbies, slide decks, and real-time customizers), and the dynamic AI pipeline middleware.",
          size: 24,
        }),
      ],
    }),

    // --- FRONTEND DESIGN ---
    new Paragraph({
      text: "11. Frontend Design",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Components are built using React and Zustand for state sync. The Presenter UI handles custom slides list states. The Student View uses low-overhead polling updates to reconstruct views dynamically based on the current presenter slide index.",
          size: 24,
        }),
      ],
    }),

    // --- BACKEND DESIGN ---
    new Paragraph({
      text: "12. Backend Design",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Built on top of Next.js Server Actions, backend routes act as transaction controllers. They process actions asynchronously, check auth context, update PostgreSQL schemas, and push updates safely to target clients.",
          size: 24,
        }),
      ],
    }),

    // --- DATABASE DESIGN ---
    new Paragraph({
      text: "13. Database Design",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Prisma schema includes: User, Document, StudyPlanner, FlashcardDeck, InteractiveSession (holds lobby properties), SessionSlide (tracks indices, types, option arrays, correct answers), SessionParticipant, SessionResponse (stores student votes/quiz scores), and SessionQA (holds live audience questions).",
          size: 24,
        }),
      ],
    }),

    // --- AI PIPELINE ---
    new Paragraph({
      text: "14. AI Pipeline",
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

    // --- API DESIGN ---
    new Paragraph({
      text: "15. API Design",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "• submitSlideResponseAction(slideId, value, participantUserId): Records quiz choices or poll selections.\n• updateSessionSlidesAction(sessionId, slides): Handles slide customizations inside a Prisma transaction block.\n• advanceSlideAction(sessionId, direction): Advances slide numbers.",
          size: 24,
        }),
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

    // --- ERROR HANDLING ---
    new Paragraph({
      text: "16. Error Handling",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "If an LLM parser request fails, visual outlines fall back to default dynamic structures. Database connection retries and transactional rollbacks protect student slide lobby submissions.",
          size: 24,
        }),
      ],
    }),

    // --- SECURITY ---
    new Paragraph({
      text: "17. Security",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Cookie-stored API keys prevent server compliance risks. Auth.js secures student profile paths. Host validation rules restrict Local Ollama configurations solely to 'localhost' bindings, blocking external network access.",
          size: 24,
        }),
      ],
    }),

    // --- PERFORMANCE & SCALABILITY ---
    new Paragraph({
      text: "18. Performance & Scalability",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Connection pools are managed through serverless Neon endpoints. Polling routes fetch lightweight state representations to minimize lock contentions, enabling seamless multiplayer scaling under heavy workloads.",
          size: 24,
        }),
      ],
    }),

    // --- MONITORING & LOGGING ---
    new Paragraph({
      text: "19. Monitoring & Logging",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Server processes write formatted logs tracking LLM response times, database write transaction metrics, and polling network load factors.",
          size: 24,
        }),
      ],
    }),

    // --- TESTING STRATEGY ---
    new Paragraph({
      text: "20. Testing Strategy",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "The testing matrix combines unit verification for OCR visual models, transactional integration testing for database schemas, and end-to-end simulation of student joining flows.",
          size: 24,
        }),
      ],
    }),

    // --- FUTURE ENHANCEMENTS ---
    new Paragraph({
      text: "21. Future Enhancements",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Planned upgrades include WebRTC channels for instantaneous real-time presentation events and multi-lingual voice advisor generation.",
          size: 24,
        }),
      ],
    }),

    // --- TRADE-OFFS & DESIGN DECISIONS ---
    new Paragraph({
      text: "22. Trade-offs & Design Decisions",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "WebSockets vs Polling: Standard polling (1.5s interval) was chosen over WebSocket sockets to fit serverless Vercel host runtimes directly without sticky servers. Cookie storage was chosen over database persistence for security and ease of compliance.",
          size: 24,
        }),
      ],
    }),

    // --- APPENDIX ---
    new Paragraph({
      text: "23. Appendix",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Includes details for configuring local Ollama servers (network bindings, port exposures) and Prisma db push commands.",
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
    console.log(`Successfully generated Technical Design Document with TOC formatted properly: ${filePath}`);
  })
  .catch((err) => {
    console.error("Failed to generate DOCX document:", err);
    process.exit(1);
  });
