# 🏛️ Engineering Architecture & Technical Decisions: StudyTest AI

**Live Application URL**: [https://studytest-ai-nu.vercel.app](https://studytest-ai-nu.vercel.app)  
**Dashboard**: [https://studytest-ai-nu.vercel.app/dashboard](https://studytest-ai-nu.vercel.app/dashboard)

---

## 1. Project Framing & Core Problem Formulation

### 1.1 What is the Problem and Who is it For?
* **Target Audience**: University students, self-taught engineers, and professionals studying dense, technical domains (e.g., computer science, biology, finance, law) who must assimilate large volumes of unstructured materials (PDF textbooks, lecture slide decks, and syllabus notes).
* **The Core Problem**: Digital study tools suffer from the **"Passive Consumption Trap"**. Students spend dozens of hours highlighting and passively rereading notes, generating a psychological *illusion of competence*. Decades of cognitive psychology (e.g., Roediger & Karpicke) prove that passive rereading yields poor long-term retention compared to **active recall testing, diagnostic feedback loops, and spaced repetition**. Traditional tools either act as passive document viewers or standalone flashcard apps with no connection to the source material.

---

### 1.2 The Hard Part — The Specific Sub-Problem That Makes This Non-Trivial
Generating a generic quiz from text is easy. Building a **reliable, closed-loop diagnostic learning system from arbitrary unstructured documents** is hard because:
1. **Schema Non-Determinism & Hallucinations**: Raw LLMs frequently generate malformed JSON, produce option lists that omit the correct answer, hallucinate answers outside the document's scope, or fail on edge cases (e.g., LaTeX formulas, code snippets).
2. **Semantic Free-Text Evaluation**: Objective grading of open-ended student answers requires distinguishing between superficial keyword absence and true conceptual understanding.
3. **Concept Extraction & Error Attribution**: Mapping question-level mistakes to a structured taxonomy of topics, computing mastery decay over time, and generating targeted remediation without drowning the student in redundant cards.
4. **Algorithmic State Scheduling vs. Static LLM Text**: Spaced repetition cannot be handled by an LLM prompt; it requires mathematical state machines (SuperMemo-2) calculating dynamic intervals, tracking user-specific Ease Factors ($\text{EF}$), and clamping bounds ($\text{EF} \ge 1.3$) to avoid the "interval collapse trap" across 30–90 day retention cycles.

---

### 1.3 The Slice — The One End-to-End Path Actually Shipped
The complete, end-to-end path shipped in StudyTest AI is the **"Document-to-Remediation Diagnostic Loop"**:
```
Unstructured PDF / Topic Query
    │
    ▼
1. Ingestion & Visual Concept Outline Extraction
    │
    ▼
2. Calibrated Quiz Generation (Theory, Practical, Mixed) with Defensive JSON Validation
    │
    ▼
3. Interactive Quiz Attempt & Semantic Evaluation (MCQ + Short Answer)
    │
    ▼
4. Diagnostic Heatmap Engine (Flags Weak Topics with Accuracy < 70%)
    │
    ▼
5. "🔥 Slay Weaknesses" 1-Click Remediation Action
    │
    ▼
6. SuperMemo-2 (SM-2) Algorithmic Spaced Repetition Scheduling & Long-Term Mastery
```

Every stage of this path is live and fully interactive on the deployed application.

---

### 1.4 Why This Instead of a Fixed Prompt?
A common question for LLM-powered applications is: *"Why not just use a well-crafted prompt in ChatGPT or Claude?"*

| Dimension | Fixed LLM Prompt (ChatGPT / Claude) | StudyTest AI Architecture |
| :--- | :--- | :--- |
| **State & Memory** | Zero persistent memory across sessions. Forgets past attempt errors, weak topics, and study cadence. | Relational PostgreSQL state tracking every attempt, question, and topic accuracy score over time. |
| **Spaced Repetition** | LLMs cannot compute mathematical time-series intervals or schedule reviews according to forgetting curves. | Algorithmic **SuperMemo-2 (SM-2)** scheduler managing personalized interval decay and next-review timestamps. |
| **Diagnostic Loop** | Generates text answers, but cannot aggregate error rates across 10 quizzes to identify that your *Mitochondrial Electron Transport* is at 40% accuracy. | Real-time **Diagnostic Cockpit** clustering mistakes into topic heatmaps with 1-click targeted remediation. |
| **Schema Guarantees** | Output frequently breaks format, markdown fences, or key schemas when prompt complexity grows. | Multi-pass defensive parser with regex strippers, auto-repair, and strict **Zod runtime schema enforcement**. |
| **UX & Modalities** | Pure text wall. | Multi-speaker **browser-native audio debate podcast (Alex & Taylor)**, interactive **Mermaid.js mind-maps**, and real-time multiplayer presentation sessions. |

---

## 2. Key Architectural Decisions & Trade-Offs

```mermaid
graph TD
    User([Student Client - Next.js 16 App Router]) <-->|Type-Safe RPC Actions| SA[Next.js Server Actions Layer]
    SA <--> Services[Domain Business Services Layer]
    Services <-->|ORM & Connection Pooling| Prisma[Prisma v7 Client]
    Prisma <--> NeonDB[(Neon PostgreSQL Serverless)]
    Services <-->|Prompt Chains & Defensive Parser| AI[Gemini API / Local Gemma via Ollama]
    User <-->|Client-Side SpeechSynthesis| TTS[Local Dual-Voice Audio Visualizer]
    User <-->|Dynamic Diagram Rendering| Mermaid[Mermaid.js Flowcharts]
```

### 2.1 Next.js 16 App Router & Server Actions vs. Standalone Microservices
* **Decision**: Full-stack Next.js 16 App Router architecture utilizing Server Actions (`"use server"`) as a type-safe RPC boundary directly invoking domain services.
* **Rationale**:
  - **End-to-End Type Safety**: Shared TypeScript interfaces between database models, business logic, and UI components eliminate API contract drift and redundant DTO boilerplate.
  - **Atomic Transaction Boundaries**: Server Actions encapsulate multi-table writes within Prisma `$transaction` blocks without exposing intermediate REST endpoints.
  - **Zero-Cold-Start Serverless Runtime**: Server Actions compile to isolated serverless lambdas on Vercel/Node edge runtimes, minimizing infrastructure overhead and operational maintenance.
* **Trade-Off & Mitigation**: Serverless functions have execution limits (15–60s). For heavy document ingestion and AI generation, we structured requests with token budgeting, streaming feedback, and aggressive database caching.

---

### 2.2 Relational Database Model (PostgreSQL + Prisma) vs. NoSQL / Document Store
* **Decision**: Relational schema on PostgreSQL (Neon.tech) with Prisma ORM v7, adopting a hybrid normalization pattern.
* **Rationale**:
  - **Relational Integrity**: Deep relational dependencies (`User -> Document -> GeneratedQuiz -> Question -> Attempt -> Answer`) require foreign-key cascades, relational constraints, and aggregation queries (e.g., calculating topic-specific error rates across historical attempts).
  - **Hybrid Normalization**: Core business entities are fully normalized, while flexible data (MCQ option arrays, JSON badge unlocks, user preferences) are stored in Postgres `JSONB` columns to avoid costly multi-join queries for static sub-structures.
* **Trade-Off**: Schema changes require schema push/migration steps, but provide compile-time guarantees and typed query outputs across the codebase.

---

### 2.3 Spaced Repetition Engine: SuperMemo-2 (SM-2) Implementation
* **Decision**: Implemented an algorithmic spaced repetition system (`services/flashcard.service.ts`) using the SuperMemo-2 (SM-2) formula rather than static Leitner 3-box systems.
* **Mathematical Model**:
  - **Ease Factor (EF)**: Starts at default `2.5`. On each review with quality rating $q \in [0, 5]$:
    $$\text{EF}' = \text{EF} + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))$$
  - **Lower Bound Clamping**: $\text{EF}' = \max(\text{EF}', 1.3)$ — preventing the **"interval collapse trap"** where difficult concepts become permanently over-scheduled and demoralize the learner.
  - **Interval Scheduling**:
    - If $q < 3$ (failure): repetitions reset to $0$, interval reset to $1$ day.
    - If $q \ge 3$ (success):
      - $n = 1 \implies I_1 = 1 \text{ day}$
      - $n = 2 \implies I_2 = 6 \text{ days}$
      - $n > 2 \implies I_n = \text{round}(I_{n-1} \times \text{EF})$
* **Rationale**: Adapts to individual concept difficulty dynamically over months of review cycles.

---

### 2.4 Browser Web Speech API vs. Cloud Text-to-Speech (TTS)
* **Decision**: Implemented a browser-native audio synthesis engine using the Web Speech (`SpeechSynthesis`) API for the **Alex & Taylor AI Podcast** study feature.
* **Rationale**:
  - **Zero Streaming Latency & Zero Running Cost**: Audio is synthesized entirely on the client's device without incurring per-character costs (e.g., ElevenLabs / OpenAI Audio API) or streaming buffering delays.
  - **Dynamic Turn Management**: The client parses dialogue tokens (`[Alex]:`, `[Taylor]:`) and alternates between pitch-shifted male/female voices while driving an animated frequency visualizer.
* **Trade-Off**: Voice fidelity depends on local OS voice engines. In a commercial enterprise deployment, an optional cloud TTS fallback could be toggled for premium users.

---

### 2.5 Dual AI Engine: Google Gemini Cloud with Local Ollama / Gemma Fallback
* **Decision**: Abstracted AI provider layer supporting both Google Gemini API and local Ollama (`gemma:2b` / `gemma`).
* **Rationale**:
  - **Developer Flexibility & Zero Cost Testing**: Developers can run and test the complete AI feature suite locally without an active internet connection or paid API keys.
  - **Defensive LLM Response Parsing**: LLM output parsing includes regex markdown strippers, JSON bracket auto-repair, and fallback parsers to guarantee valid JSON even when models produce unexpected preambles or trailing commentary.

---

## 3. Product & UX Decisions

### 3.1 AI Diagnostic Cockpit vs. Vanity Score Metrics
* Standard LMS platforms display vanity percentages (e.g., "78% on Biology Quiz"). This fails to guide actionable remediation.
* **Our Solution**: The Diagnostic Cockpit (`services/analytics.service.ts`) aggregates question-level attempt data by conceptual topic tags. Concepts scoring $<70\%$ accuracy are flagged with a **"🔥 Slay Weaknesses"** action that automatically generates a targeted, remedial SM-2 flashcard deck.

### 3.2 RPG Gamification Economy
* Learning platforms experience steep drop-offs after initial signup.
* **Our Solution**: Implemented a balanced daily quest progression system ($+50 \text{ XP}, +10 \text{ Gold}$ per completed daily study quest) with an in-app Merchant Shop where students spend study gold on visual themes and scholastic titles.

---

## 4. What We Would Do Differently at Production Scale

1. **Background Job Queues for Ingestion (BullMQ / Inngest)**:
   - *Current*: PDF extraction and AI quiz generation run inside the request-response lifecycle.
   - *Production Scale*: Offload multi-page OCR and deep synthesis to background workers with Server-Sent Events (SSE) streaming progress to the client.

2. **Vector Embeddings & Hybrid RAG (pgvector + BM25)**:
   - *Current*: Passes extracted document text into Gemini's large context window.
   - *Production Scale*: Chunk documents into semantic vectors stored in Postgres `pgvector` with hybrid BM25 + dense retrieval for 500+ page textbook queries.

3. **WebSocket Real-Time Multi-Player Lobbies**:
   - *Current*: Database-backed state synchronization for multiplayer quiz battles.
   - *Production Scale*: Upgrade to WebSockets (LiveKit / Redis PubSub) for sub-50ms synchronized question clocks and live spectator leaderboards.
