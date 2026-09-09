# Architecture & Engineering Decisions: StudyTest AI

**Live URL**: [https://studytest-ai-nu.vercel.app](https://studytest-ai-nu.vercel.app)  
**Dashboard**: [https://studytest-ai-nu.vercel.app/dashboard](https://studytest-ai-nu.vercel.app/dashboard)

---

## 1. Context & The Core Problem

### What is this and who is it for?
This is for students, engineers, and self-learners who have to study dense material — 40-page PDF textbooks, lecture slides, or exam syllabi.

Most people study by reading and highlighting notes over and over. It feels productive, but you don't actually know if you understand something until a test forces you to retrieve it. Existing tools are either dumb PDF viewers where you do all the manual work, or generic quiz generators that give you a score (like "7/10") and leave you stranded on what to fix.

StudyTest AI takes arbitrary study material, generates interactive quizzes, tracks exactly *which concepts* you failed across attempts, and lets you immediately turn those weak spots into spaced-repetition flashcards.

### The Hard Part — What makes this non-trivial?
Generating 5 multiple-choice questions from a prompt is trivial. Making a reliable diagnostic study loop out of messy user documents is not:
1. **LLM Output Consistency**: LLMs love to hallucinate invalid JSON, put incorrect answers in options, or omit the correct choice entirely. If an AI grades a student wrong on a question it generated incorrectly, trust is instantly destroyed. We had to build schema validation (Zod) and defensive retry/repair logic to catch bad model outputs before they hit the database.
2. **Semantic Evaluation for Free-Text Answers**: Short-answer questions can't be graded with exact string matching. A student might write "powerhouse of the cell" vs "ATP production in mitochondria". We needed a fast semantic grading step that assesses conceptual correctness without adding 5 seconds of latency per question.
3. **Closing the Loop (Diagnostics -> Spaced Repetition)**: Connecting quiz mistakes back to specific concept tags, calculating a running accuracy score per topic, and auto-generating targeted SuperMemo-2 (SM-2) flashcard decks when accuracy drops below 70%.
4. **State & Time Decay**: An LLM has no concept of time or forgetting curves. You can't ask a model "remind me in 6 days if I got it right twice." That has to be an algorithmic state machine backed by persistent storage.

### The Slice — What we actually built and shipped
The end-to-end path in production right now:
1. Upload a PDF (or type an academic topic like "Operating System Deadlocks").
2. AI extracts the text, builds a visual concept hierarchy, and generates a structured quiz (MCQ, True/False, Short Answer).
3. The user takes the quiz with live timer and grading. Short answers get semantically graded by AI with instant explanations.
4. Attempt results update the user's Topic Diagnostic Heatmap (e.g., *Deadlock Avoidance: 50% accuracy*).
5. The user hits **"Slay Weaknesses"** -> AI immediately builds a remedial flashcard deck targeting those exact weak topics.
6. The user studies cards using the **SuperMemo-2 (SM-2)** algorithm, which calculates the next review interval based on recall quality.

### Why this instead of a fixed prompt in ChatGPT?
If you paste a PDF into ChatGPT and say "quiz me":
* **Zero state or memory**: ChatGPT doesn't remember that you missed Question 3 yesterday, or that your accuracy on *Dynamic Programming* is 40% across 5 sessions.
* **No algorithmic scheduling**: ChatGPT cannot track mathematical decay curves or calculate whether a card should be reviewed in 1 day, 6 days, or 16 days.
* **No automated remediation**: In a chat, you get answers and move on. Here, failure directly feeds the spaced repetition scheduler.
* **Brittle UX**: Chatting back and forth to answer 20 questions is clunky compared to a dedicated testing UI with keyboard shortcuts, timer countdowns, and topic heatmaps.

---

## 2. Technical Decisions & Trade-Offs

### 2.1 Next.js 16 App Router + Server Actions (Instead of Express / NestJS API)
* **Decision**: Full-stack Next.js 16 using TypeScript Server Actions (`"use server"`) directly calling domain services in `services/*.service.ts`.
* **Why**:
  - **No API boilerplate**: No maintaining separate REST DTOs or OpenAPI schemas between frontend and backend. Types flow end-to-end from Prisma models to UI components.
  - **Transaction boundaries**: Server Actions run directly in Node on the server, letting us wrap multi-table writes in Prisma `$transaction` blocks without exposing intermediate REST endpoints.
  - **Zero hosting overhead**: Deploys cleanly to Vercel serverless without having to manage a separate Node/Express container.
* **Trade-off**: Serverless functions have hard execution timeouts (15–60s). Heavy document processing has to finish fast, so we chunk text and budget tokens upfront instead of running massive unbounded chains.

### 2.2 PostgreSQL + Prisma (Instead of MongoDB / DynamoDB)
* **Decision**: Relational schema on Neon PostgreSQL with Prisma ORM v7, using JSON columns only for flexible metadata.
* **Why**:
  - **Data is inherently relational**: A User has Documents, which have Quizzes, which have Questions, which have Attempts, which have Answers, which link back to Questions and Topics. If a user deletes a document, cascade deletes should clean up everything cleanly.
  - **Analytical queries**: Calculating topic accuracy requires grouping Answers by `question.topic` across multiple attempts. This is clean in SQL (`JOIN` + `GROUP BY`), but messy and error-prone in a document store.
  - **Hybrid JSON pragmatism**: We used JSONB for non-relational fields (like MCQ option string arrays `["A", "B", "C", "D"]` and user badge unlocks) to avoid creating useless join tables for simple lists.

### 2.3 Spaced Repetition: SuperMemo-2 (SM-2) Implementation
* **Decision**: Implemented standard SM-2 in `services/flashcard.service.ts` instead of static Leitner boxes.
* **How it works**:
  - Each review rating $q \in [0, 5]$ updates the card's **Ease Factor (EF)**:
    $$\text{EF}' = \text{EF} + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))$$
  - **The 1.3 Minimum Clamp**: If a user struggles with a card repeatedly, the formula drops EF. Without a hard clamp ($\text{EF} \ge 1.3$), the ease factor collapses to zero, and the card gets scheduled every single day forever (the "ease hell" trap).
  - **Interval Progression**:
    - Score $q < 3$ (failure): Repetitions reset to 0, Interval resets to 1 day.
    - Score $q \ge 3$ (success): Repetition 1 = 1 day, Repetition 2 = 6 days, Repetition $n > 2 = I_{n-1} \times \text{EF}$.
* **Why this matters**: It scales naturally from 10 cards to 5,000 cards without hardcoding arbitrary bucket timers.

### 2.4 Browser Web Speech API (Instead of ElevenLabs / OpenAI Audio API)
* **Decision**: Used the browser's native `window.speechSynthesis` API for the **AI Podcast (Alex & Taylor)** feature.
* **Why**:
  - **Zero API cost**: Synthesizing 10-minute multi-speaker audio via ElevenLabs or OpenAI TTS costs real money per user. Web Speech is completely free and runs locally.
  - **Zero latency**: Playback starts instantly without waiting for audio chunks to download or buffer.
  - **Voice switching**: We parse the generated dialogue script for speaker tags (`[Alex]:` vs `[Taylor]:`) and swap pitch/voice profiles on the fly.
* **Trade-off**: Local speech engines sound more robotic than modern neural voice models, and voice availability varies by OS. For a hackathon/project scale, free and instant wins.

### 2.5 Multi-Provider AI (Gemini + Local Ollama Fallback) & Defensive Parsing
* **Decision**: Abstracted AI provider layer supporting Google Gemini API with local Ollama (`gemma:2b`) fallback.
* **Handling bad LLM outputs**:
  - LLMs often wrap JSON in ```json ... ``` code blocks or add conversational preambles ("Sure, here are your questions:").
  - We run a regex sanitizer to extract the raw JSON object, repair missing closing brackets if truncated, and pass the result through **Zod schemas**.
  - We explicitly validate that for every MCQ question, `question.options.includes(question.correctAnswer)` is `true`. If the model hallucinates an answer that isn't in the options list, the question is rejected and regenerated.

### 2.6 Real-Time Presentation Sync: 1.5s Polling (Instead of WebSockets)
* **Decision**: Used a 1.5-second polling interval on the database for live slide presenter sessions.
* **Why**:
  - WebSockets require persistent connections and stateful servers, which break or require expensive add-ons (like Pusher or Redis Pub/Sub) on serverless platforms like Vercel.
  - For classroom slide changes (which happen every 1–2 minutes), a 1.5s poll with a lightweight endpoint returning `{ slideIndex, status }` is fast enough, bulletproof, and costs virtually nothing to host.

---

## 3. What Sucks & What We'd Do Differently at Scale

If we had another month to work on this for production traffic, here's what we'd change:

1. **Background Queues for Ingestion**:
   - Right now, PDF text extraction and quiz generation happen inside the Server Action lifecycle. If a user uploads a 100-page scanned PDF, the request will time out.
   - *Fix*: Push PDF jobs to a **BullMQ + Redis** queue, extract text asynchronously in worker processes, and push progress to the frontend via Server-Sent Events (SSE).

2. **Semantic RAG with `pgvector`**:
   - Right now, we pass extracted text directly into the LLM context window. This works fine for 10–20 page lecture notes (Gemini has a large context window), but fails for 600-page textbooks.
   - *Fix*: Chunk documents, generate embeddings, store them in PostgreSQL via `pgvector`, and retrieve relevant chunks using hybrid keyword (BM25) + dense vector search.

3. **WebSockets for Multiplayer Quiz Battles**:
   - Database polling works fine for 20 students in a classroom presentation, but starts causing database lock contention with 500 concurrent players taking a timed live quiz tournament.
   - *Fix*: Move the live battle lobby to WebSocket channels (via LiveKit or Redis Pub/Sub) for sub-50ms synchronized question countdowns.
