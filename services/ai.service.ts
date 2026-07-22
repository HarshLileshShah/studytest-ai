import OpenAI from "openai";
import { z } from "zod";
import type { GeneratedQuestion } from "@/types";

const isOllama = process.env.USE_OLLAMA === "true";

// Groq or local Ollama OpenAI-compatible client setup
const client = new OpenAI({
  apiKey: isOllama ? "ollama" : (process.env.GROQ_API_KEY || ""),
  baseURL: isOllama
    ? (process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1")
    : "https://api.groq.com/openai/v1",
});

// Model selection (uses llama-3.3-70b-versatile or custom local Ollama model like gemma:2b)
const AI_MODEL = isOllama
  ? (process.env.OLLAMA_MODEL || "gemma:2b")
  : "llama-3.3-70b-versatile";

const questionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  explanation: z.string(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  topic: z.string(),
});

const questionsResponseSchema = z.object({
  questions: z.array(questionSchema),
});

/**
 * Generate practice questions from document text using Groq (Llama 3).
 */
export async function generateQuestions(
  text: string,
  count: number = 10,
  format: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "FILL_IN_THE_BLANKS" = "MCQ",
  cognitiveStyle: "THEORY" | "PRACTICAL" | "MIXED" = "MIXED",
  customPrompt?: string
): Promise<GeneratedQuestion[]> {
  // Truncate text to stay within Groq's 12K TPM rate limit
  const maxTextLength = 4000;
  const truncatedText =
    text.length > maxTextLength ? text.slice(0, maxTextLength) + "\n\n[Text truncated...]" : text;

  // Format-specific details
  let formatRequirements = "";
  let formatOutput = "";

  if (format === "MCQ") {
    formatRequirements = `- Generate a mix of standard multiple choice questions and fill-in-the-blank questions (where the question contains a blank indicated by underscores '_______' and the correct answer is one of the options)
- Each question must have exactly 4 options (A, B, C, D)
- One option must be the correct answer
- Make wrong options plausible (not obviously wrong)`;
    formatOutput = `- options: array of 4 option strings
- correctAnswer: the exact text of the correct option`;
  } else if (format === "TRUE_FALSE") {
    formatRequirements = `- Each question must be a statement that is either True or False
- options must be exactly ["True", "False"] (or in the script of the native language)
- correctAnswer must be either the "True" option or "False" option`;
    formatOutput = `- options: array containing exactly two strings: ["True", "False"] (translated to native script if necessary)
- correctAnswer: either the string "True" or the string "False" (exactly matching one of the options)`;
  } else if (format === "SHORT_ANSWER") {
    formatRequirements = `- Each question must require a short written response (1-2 sentences)
- options must be an empty array []`;
    formatOutput = `- options: empty array []
- correctAnswer: a concise but complete correct reference answer text`;
  } else if (format === "FILL_IN_THE_BLANKS") {
    formatRequirements = `- Each question must contain a single blank indicated by exactly seven underscores '_______'
- The answer must be a single specific word or short phrase that goes into that blank
- options must be an empty array []`;
    formatOutput = `- options: empty array []
- correctAnswer: the exact word or short phrase that fits into the blank '_______'`;
  }

  // Cognitive Style Prompting Instruction
  let styleInstruction = "";
  if (cognitiveStyle === "THEORY") {
    styleInstruction = `- Generate questions focusing strictly on theoretical concepts, definitions, rules, formulas, and academic facts.`;
  } else if (cognitiveStyle === "PRACTICAL") {
    styleInstruction = `- Generate questions focusing strictly on practical application, real-world case studies, scenario-based problem solving, and hands-on examples.
- For each practical question, you MUST include a concrete example, real-world scenario, or sample case inside the question text to illustrate the concept's application.`;
  } else if (cognitiveStyle === "MIXED") {
    styleInstruction = `- Generate a balanced combination of both theoretical questions and practical scenario-based application questions.`;
  }

  const systemPrompt = `You are an expert educational assessment creator. Your task is to generate high-quality questions from study material text.

CRITICAL LANGUAGE REQUIREMENT:
- Identify the language of the study material text.
- You MUST generate the questions, options, correctAnswer, explanation, and topic in the EXACT same language as the study material text.
- This includes full support for regional Indian languages: Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు), Kannada (കನ್ನಡ), Malayalam (മലയാളം), Marathi (मराठी), Gujarati (ગુજરાતી), Bengali (বাংলা), Punjabi (ਪੰਜਾਬੀ), Urdu (اردו), and Odia (ଓଡ଼ିଆ).
- You MUST write the output in the correct script/alphabet of that language.

REQUIREMENTS:
- Generate exactly ${count} questions
- ${formatRequirements}
- ${styleInstruction}
- Academic Rigor & Tone: Write questions using a formal, academic tone, similar to official standardised exams, licensing tests, or university-level entrance exams.
- No Conversational Banter: Do NOT include chatty intros, friendly remarks, or transitional phrases (e.g. do NOT say 'Here is a question about...', 'Based on your notes...', or 'Let's check...'). The question text must be stated directly and formally.
- Clear & Standalone Context: The question must be standalone and complete. Do NOT refer to external reading context with phrases like 'According to the text...', 'Based on the passage...', or 'From the document above...'.
- Include a clear explanation for why the answer is correct
- Write concise explanations (1-2 sentences max) to avoid long responses
- Assign a difficulty level: EASY, MEDIUM, or HARD
- Assign a topic/concept name that the question tests
- Mix difficulty levels: roughly 30% EASY, 50% MEDIUM, 20% HARD
- Cover diverse concepts from the material
- Avoid duplicate or very similar questions
- Questions should test understanding, not just memorization${
  customPrompt && customPrompt.trim()
    ? `\n- USER PERSONALIZATION INSTRUCTIONS: The user has requested this specific customization: "${customPrompt.trim()}". You MUST strictly prioritize and adhere to these instructions when selecting topics and drafting the questions and options.`
    : ""
}

OUTPUT FORMAT:
Return a JSON object with a "questions" array. Each question object must have:
- question: the question text
- ${formatOutput}
- explanation: why this answer is correct
- difficulty: "EASY" | "MEDIUM" | "HARD"
- topic: short topic/concept name`;

  const formatTextMap = {
    MCQ: "multiple-choice",
    TRUE_FALSE: "true or false",
    SHORT_ANSWER: "short written answer",
    FILL_IN_THE_BLANKS: "fill in the blanks",
  };

  const userPrompt = `Generate ${count} ${formatTextMap[format]} practice questions from the following study material:

---
${truncatedText}
---

Return ONLY valid JSON.`;

  const response = await client.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI model");
  }

  const parsed = JSON.parse(content);
  const validated = questionsResponseSchema.parse(parsed);

  // Validate correctAnswer constraint
  const validQuestions = validated.questions.filter((q) => {
    if (format === "SHORT_ANSWER" || format === "FILL_IN_THE_BLANKS") {
      return true; // No options verification needed
    }
    return q.options.includes(q.correctAnswer);
  });

  if (validQuestions.length === 0) {
    throw new Error("AI generated questions with invalid correct answers");
  }

  return validQuestions;
}

/**
 * Generate personalized AI feedback based on quiz results.
 */
export async function generateFeedback(data: {
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  topicResults: Array<{
    topic: string;
    correct: number;
    total: number;
  }>;
  incorrectQuestions: Array<{
    question: string;
    topic: string;
    correctAnswer: string;
    selectedAnswer: string;
  }>;
}): Promise<string> {
  const prompt = `Based on the following quiz results, provide personalized study feedback and recommendations.

CRITICAL LANGUAGE REQUIREMENT:
- You MUST provide the feedback and study recommendations in the EXACT same language as the quiz title and topics provided. If the quiz content is in Spanish, write the feedback in Spanish. If in French, write in French, etc.
- This includes full support for regional Indian languages: Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Marathi (मराठी), Gujarati (ગુજરાતી), Bengali (বাংলা), Punjabi (ਪੰਜਾਬੀ), Urdu (اردو), and Odia (ଓଡ଼ିଆ). Write in the native script of that language. Do not translate the response to English.

Quiz: "${data.quizTitle}"
Score: ${data.score}/${data.totalQuestions} (${data.percentage.toFixed(1)}%)

Topic Performance:
${data.topicResults.map((t) => `- ${t.topic}: ${t.correct}/${t.total} correct`).join("\n")}

${
  data.incorrectQuestions.length > 0
    ? `Questions Answered Incorrectly:
${data.incorrectQuestions.map((q) => `- Topic: ${q.topic} | Q: "${q.question}" | Chose: "${q.selectedAnswer}" | Correct: "${q.correctAnswer}"`).join("\n")}`
    : "All questions were answered correctly!"
}

Provide:
1. An overall assessment (1-2 sentences)
2. Specific strengths identified
3. Topics that need more review (be specific)
4. 2-3 actionable study recommendations
5. An encouraging closing statement

Keep it concise, direct, and actionable. Use bullet points. Do not use markdown headers.`;

  const response = await client.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: "system",
        content: "You are a supportive, insightful study coach providing personalized feedback to students.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || "Unable to generate feedback at this time.";
}

const flashcardSchema = z.object({
  front: z.string(),
  back: z.string(),
});

const flashcardsResponseSchema = z.object({
  flashcards: z.array(flashcardSchema),
});

/**
 * Generate spaced-repetition flashcards from document text using Groq (Llama 3).
 */
export async function generateFlashcards(
  text: string,
  count: number = 10
): Promise<Array<{ front: string; back: string }>> {
  const maxTextLength = 4000;
  const truncatedText =
    text.length > maxTextLength ? text.slice(0, maxTextLength) + "\n\n[Text truncated...]" : text;

  const systemPrompt = `You are an expert learning tutor. Your task is to generate high-quality, concise study flashcards from the provided study material.
  
Each flashcard consists of:
- front: A key term, concept question, or formula. Keep it concise, engaging, and clear.
- back: The corresponding definition, direct answer, or explanation. Make it highly clear and digestible (1-2 sentences).

CRITICAL LANGUAGE REQUIREMENT:
- Identify the language of the study material text.
- You MUST generate the front and back of every card in the EXACT same language as the study material text.
- Support all scripts, including regional Indian languages (Hindi, Tamil, Telugu, Marathi, Gujarati, etc.).

OUTPUT FORMAT:
Return a JSON object with a "flashcards" array containing exactly ${count} objects.
Each object must have "front" and "back" keys.`;

  const userPrompt = `Generate exactly ${count} flashcard question/answer pairs from this material:

---
${truncatedText}
---

Return ONLY valid JSON.`;

  const response = await client.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI model");
  }

  const parsed = JSON.parse(content);
  const validated = flashcardsResponseSchema.parse(parsed);

  return validated.flashcards;
}

/**
 * Grade a short written answer semantically.
 */
export async function evaluateShortAnswer(
  question: string,
  correctAnswer: string,
  selectedAnswer: string
): Promise<boolean> {
  if (!selectedAnswer.trim()) {
    return false;
  }

  const systemPrompt = `You are an automated student grading system.
Your job is to compare the "Student's Answer" against the "Expected Answer" for the given "Question", and determine if it is semantically correct.

CRITICAL RULES:
- The answer does NOT need to be a word-for-word match.
- If the Student's Answer captures the core concept, main facts, or correct calculation of the Expected Answer, grade it as correct (isCorrect: true).
- Ignore spelling mistakes, poor grammar, or capitalization differences.
- If the Student's Answer is incorrect, incomplete, or misses the core concept, grade it as incorrect (isCorrect: false).

OUTPUT FORMAT:
Return a JSON object with:
- isCorrect: boolean (true or false)`;

  const userPrompt = `Question: "${question}"
Expected Answer: "${correctAnswer}"
Student's Answer: "${selectedAnswer}"

Does the student's answer semantically match? Return ONLY valid JSON.`;

  try {
    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // low temp for deterministic grading
      max_tokens: 150,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return false;

    const parsed = JSON.parse(content);
    return !!parsed.isCorrect;
  } catch (error) {
    console.error("AI semantic grading failed:", error);
    // Fallback: check if the normalized string includes the correct answer
    const cleanStudent = selectedAnswer.toLowerCase().trim();
    const cleanCorrect = correctAnswer.toLowerCase().trim();
    return cleanStudent.includes(cleanCorrect) || cleanCorrect.includes(cleanStudent);
  }
}

const studyTaskSchema = z.object({
  dayNumber: z.number(),
  topic: z.string(),
  description: z.string(),
  estimatedMinutes: z.number(),
});

const studyPlanResponseSchema = z.object({
  tasks: z.array(studyTaskSchema),
});

/**
 * Generate a day-by-day study roadmap based on materials, days count, daily limit, and study goal.
 */
export async function generateStudyPlan(
  materialsSummary: string,
  daysCount: number,
  dailyMinutes: number,
  goalTitle: string
): Promise<Array<{ dayNumber: number; topic: string; description: string; estimatedMinutes: number }>> {
  const maxSummaryLength = 4000;
  const truncatedSummary =
    materialsSummary.length > maxSummaryLength
      ? materialsSummary.slice(0, maxSummaryLength) + "\n\n[Summary truncated...]"
      : materialsSummary;

  const systemPrompt = `You are an expert study planner and academic roadmap builder.
Your task is to create a structured, day-by-day study calendar/plan for a student preparing for a specific study goal/exam.

Parameters:
- Student Goal: "${goalTitle}"
- Planning Duration: ${daysCount} days
- Daily Limit: ${dailyMinutes} minutes/day
- Available Study Material Summary: "${truncatedSummary}"

Requirements:
- Generate EXACTLY ${daysCount} days of structured study tasks (Day 1 through Day ${daysCount}).
- For each day, specify:
  * dayNumber: the day integer (starting at 1 up to ${daysCount})
  * topic: a clear concept title for that day
  * description: 2-3 sentences explaining exactly what concepts they should read and practice
  * estimatedMinutes: realistic study duration in minutes (integer, must be less than or equal to ${dailyMinutes})
- Ensure the roadmap covers all concepts sequentially.
- The final day (Day ${daysCount}) MUST be a dedicated mock practice, review, and quiz day.

CRITICAL LANGUAGE REQUIREMENT:
- Identify the language of the student goal/study materials.
- You MUST generate the topics and descriptions in the EXACT same language as the study materials (e.g. Hindi, Spanish, French, etc.).

OUTPUT FORMAT:
Return a JSON object with a "tasks" array containing the day objects.`;

  const userPrompt = `Generate a daily ${daysCount}-day study roadmap for: "${goalTitle}". Return ONLY valid JSON.`;

  const response = await client.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI model");
  }

  const parsed = JSON.parse(content);
  const validated = studyPlanResponseSchema.parse(parsed);

  return validated.tasks;
}

export async function rescheduleStudyPlanTasks(
  uncompletedTasksSummary: string,
  daysCount: number,
  dailyMinutes: number,
  goalTitle: string
): Promise<Array<{ dayNumber: number; topic: string; description: string; estimatedMinutes: number }>> {
  const systemPrompt = `You are an expert study planner. The student missed some study days and needs to recalibrate/reschedule their remaining uncompleted topics over the remaining available days.

Parameters:
- Study Goal: "${goalTitle}"
- Remaining Days: ${daysCount} days (Day 1 represents today through Day ${daysCount})
- Daily Limit: ${dailyMinutes} minutes/day
- Remaining Uncompleted Topics:
---
${uncompletedTasksSummary}
---

Requirements:
- Reschedule and distribute the remaining uncompleted topics evenly over EXACTLY ${daysCount} days (Day 1 through Day ${daysCount}).
- For each day, specify:
  * dayNumber: the day integer (starting at 1 up to ${daysCount})
  * topic: a clear concept title for that day
  * description: 2-3 sentences explaining exactly what concepts they should read and practice
  * estimatedMinutes: realistic study duration in minutes (integer, must be less than or equal to ${dailyMinutes})
- Ensure all uncompleted topics are covered sequentially.
- The final day (Day ${daysCount}) should include a mock review/practice quiz of these topics.

OUTPUT FORMAT:
Return a JSON object with a "tasks" array containing the day objects.`;

  const userPrompt = `Reschedule these uncompleted topics over ${daysCount} days for: "${goalTitle}". Return ONLY valid JSON.`;

  const response = await client.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI model");
  }

  const parsed = JSON.parse(content);
  const validated = studyPlanResponseSchema.parse(parsed);

  return validated.tasks;
}

interface MiniChatMessage {
  role: string;
  content: string;
}

/**
 * Ask a question to the AI Tutor based on the document text context and chat history.
 */
export async function askTutorQuestion(
  documentTitle: string,
  documentText: string,
  chatHistory: MiniChatMessage[],
  newQuestion: string
): Promise<string> {
  const maxContextLength = 6000;
  const contextText =
    documentText.length > maxContextLength
      ? documentText.slice(0, maxContextLength) + "\n\n[Document context truncated...]"
      : documentText;

  const systemPrompt = `You are a helpful, expert AI Academic Tutor.
Your goal is to assist students in understanding their uploaded study document: "${documentTitle}".

Document Context:
\"\"\"
${contextText}
\"\"\"

CRITICAL WORKFLOW RULES:
1. **Context Priority**: Base your answers primarily on the Document Context provided above.
2. **Context Absence**: If the answer is not explicitly mentioned or inferred from the Document Context, you may use your general knowledge, but you MUST state: "Based on my general knowledge (this is not explicitly mentioned in the document)..." before explaining.
3. **Clarity**: Keep your explanations clear, structured, and easy for students to understand.
4. **Style**: Use clean markdown formatting (bold text, bullet lists, code blocks, tables) to organize your responses. Never use raw HTML.
5. **Language**: Always respond in the SAME language as the student's question.`;

  // Format messages chain
  const messages = [
    { role: "system", content: systemPrompt },
    ...chatHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    })),
    { role: "user", content: newQuestion },
  ];

  const response = await client.chat.completions.create({
    model: AI_MODEL,
    messages: messages as any,
    temperature: 0.5,
    max_tokens: 1500,
  });

  const reply = response.choices[0]?.message?.content;
  if (!reply) {
    throw new Error("Tutor failed to respond.");
  }

  return reply;
}

/**
 * Generate a detailed explanation for a student's wrong answer, referencing source document context.
 */
export async function generateWrongAnswerExplanation(
  documentTitle: string,
  documentText: string,
  question: string,
  choices: string[],
  correctAnswer: string,
  selectedAnswer: string
): Promise<string> {
  const maxContextLength = 5000;
  const contextText =
    documentText.length > maxContextLength
      ? documentText.slice(0, maxContextLength) + "\n\n[Document context truncated...]"
      : documentText;

  const systemPrompt = `You are a helpful, expert academic educator.
Your task is to write a short, targeted learning explanation (2-3 sentences max) for a student who selected the WRONG answer to a quiz question.

Source Document context:
\"\"\"
${contextText}
\"\"\"

Question: "${question}"
Options: ${JSON.stringify(choices)}
Correct Answer: "${correctAnswer}"
Student's Selected Answer: "${selectedAnswer}"

Requirements:
1. Explain clearly why the Correct Answer is correct.
2. Explain clearly why the Student's Selected Answer is wrong.
3. Explicitly include a direct quote from the Source Document context supporting the correct explanation.
4. Keep the response compact (2-3 sentences), direct, and encouraging.
5. Match the language of the question.

Example output:
"The correct answer is A because of Disney's focus on creative ad tools. Your choice, B, is incorrect because standard tools are bypassed. As stated in the text: 'The fleet aims to unleash Disney magic using custom ad tools.'"`;

  const userPrompt = `Generate wrong answer explanation for: "${question}"`;

  try {
    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 250,
    });

    return response.choices[0]?.message?.content || "No explanation generated.";
  } catch (error) {
    console.error("Wrong answer explanation generation failed:", error);
    return `The correct answer is: "${correctAnswer}". Your choice was: "${selectedAnswer}".`;
  }
}

/**
 * Generate a Mermaid.js diagram representing a conceptual mind-map from document text.
 */
export async function generateMindMap(text: string): Promise<string> {
  const maxTextLength = 4000;
  const truncatedText =
    text.length > maxTextLength ? text.slice(0, maxTextLength) + "\n\n[Text truncated...]" : text;

  const systemPrompt = `You are a visual learning designer. Your task is to analyze the provided study material and structure it into a clean, hierarchical conceptual outline.
Generate a flowchart using Mermaid.js syntax.

CRITICAL MERMAID SYNTAX RULES:
1. Start with \`graph TD\` (Top Down) or \`graph LR\` (Left to Right).
2. Avoid syntax errors at all costs:
   - Node IDs must be alphanumeric and simple, e.g. A, B, C, Sub1, Leaf1, Root.
   - You MUST quote node labels using double quotes if they contain spaces, parentheses, brackets, or other symbols. For example: A["Concept Title (Extra Info)"] or B["Key Concept: Def"].
   - Do NOT use raw parentheses or brackets directly in node labels without wrapping in double quotes.
   - Do NOT use HTML tags inside node labels.
3. Keep connections clean:
   - Root Node (Document/Core Topic) -> Subtopic Nodes (Main Chapters/Modules) -> Leaf Nodes (Definitions/Equations/Key terms).
4. Example structure:
\`\`\`mermaid
graph TD
  Root["Computer Science Basics"]
  Root --> Sub1["Data Structures"]
  Root --> Sub2["Algorithms"]
  Sub1 --> Leaf1["Arrays: Contiguous elements"]
  Sub1 --> Leaf2["Linked Lists: Node chain"]
  Sub2 --> Leaf3["Sorting: Bubble, Quick"]
  Sub2 --> Leaf4["Searching: Binary, Linear"]
\`\`\`

CRITICAL LANGUAGE REQUIREMENT:
- Identify the language of the study material text.
- Generate all node labels in the same language as the study material text (e.g. Hindi, English, Gujarati, etc.).

Return ONLY the raw Mermaid diagram string starting with \`graph TD\` or \`graph LR\` inside your response. Do not include markdown codeblocks or other explanations.`;

  const userPrompt = `Generate a conceptual Mermaid diagram flowchart mindmap from this material:

---
${truncatedText}
---`;

  try {
    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    });

    let content = response.choices[0]?.message?.content || "";
    // Clean up markdown block wraps if AI returns them
    content = content.replace(/```mermaid/gi, "").replace(/```/g, "").trim();
    return content;
  } catch (error) {
    console.error("Failed to generate study mind-map:", error);
    return `graph TD
  Error["Failed to load mind-map"]
  Error --> Details["Please check Groq API limits or try again later"]`;
  }
}

/**
 * Generate spaced-repetition flashcards targeting specific weak topics.
 */
export async function generateFlashcardsForTopics(
  text: string,
  topics: string[],
  count: number = 8
): Promise<Array<{ front: string; back: string }>> {
  const maxTextLength = 4000;
  const truncatedText =
    text.length > maxTextLength ? text.slice(0, maxTextLength) + "\n\n[Text truncated...]" : text;

  const systemPrompt = `You are an expert learning tutor. Your task is to generate high-quality study flashcards from the provided study material.
  
CRITICAL INSTRUCTION:
- You must ONLY generate flashcards that directly address the following target concepts/topics: ${topics.join(", ")}.
- Do NOT generate cards for other concepts. Focus exclusively on explaining or testing these weak topics.

Each flashcard consists of:
- front: A key term, concept question, or formula related to the target topics. Keep it concise, engaging, and clear.
- back: The corresponding definition, direct answer, or explanation. Make it highly clear and digestible (1-2 sentences).

CRITICAL LANGUAGE REQUIREMENT:
- Identify the language of the study material text.
- You MUST generate the front and back of every card in the EXACT same language as the study material text.
- Support all scripts, including regional Indian languages (Hindi, Tamil, Telugu, Marathi, Gujarati, etc.).

OUTPUT FORMAT:
Return a JSON object with a "flashcards" array containing exactly ${count} objects.
Each object must have "front" and "back" keys.`;

  const userPrompt = `Generate exactly ${count} remedial flashcards focusing ONLY on the concepts "${topics.join(", ")}" from this material:

---
${truncatedText}
---

Return ONLY valid JSON.`;

  try {
    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const rawJSON = response.choices[0]?.message?.content || "{}";
    const data = JSON.parse(rawJSON);
    return data.flashcards || [];
  } catch (error) {
    console.error("Failed to parse remedial flashcards JSON response:", error);
    return [];
  }
}

export async function generateSingleFlashcardFromText(
  highlightText: string
): Promise<{ front: string; back: string }> {
  const systemPrompt = `You are an expert academic tutor.
Your task is to create a single high-quality study flashcard (term-definition pair) based specifically on the highlighted text provided by the student.

Highlighted Text:
---
${highlightText.slice(0, 1000)}
---

Instructions:
1. Extract the most important term, concept, or question from the text to place on the "front" (Question/Term) of the card.
2. Formulate a brief, accurate, and clear explanation or answer to place on the "back" (Answer/Definition) of the card.
3. Keep the front and back concise and easy to read.
4. Do not use markdown tags, bold, or HTML elements.

OUTPUT FORMAT:
Return a JSON object with:
- "front": "The term, question, or key concept."
- "back": "The brief explanation, definition, or answer."`;

  const userPrompt = `Create a single flashcard for this highlighted text. Return ONLY valid JSON.`;

  const response = await client.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI model");
  }

  const parsed = JSON.parse(content);
  return {
    front: parsed.front || "Concept",
    back: parsed.back || "Explanation based on highlighted text",
  };
}

export async function generatePodcastScript(documentTitle: string, documentText: string): Promise<string> {
  const maxTextLength = 4000;
  const truncatedText = documentText.length > maxTextLength
    ? documentText.slice(0, maxTextLength) + "\n\n[Text truncated...]"
    : documentText;

  const systemPrompt = `You are two professional educational podcast hosts, Alex and Taylor.
Your goal is to co-host an engaging, lively, and easy-to-understand podcast episode summarizing the provided study material.

Alex: The enthusiastic, curious host who asks practical, simplified questions, makes real-world analogies, and keeps the conversation conversational.
Taylor: The knowledgeable, clear teacher who explains the technical concepts, defines terms, and breaks down complex details simply.

Instructions:
1. Write a script as a back-and-forth dialogue between Alex and Taylor.
2. You MUST prefix every turn with the speaker name in square brackets: "[Alex]: " or "[Taylor]: ".
3. For example:
   [Alex]: Welcome back! Today we are looking at database indexing. Taylor, what's the big deal here?
   [Taylor]: Indexing is like the index at the back of a book. Instead of scanning every page, you go straight to the chapter.
4. Keep each turn short and engaging (1-3 sentences).
5. Do NOT include any other text, header introductions, stage directions, or sound effects brackets. Start directly with Alex's opening turn.
6. Limit the language to English. Avoid complex mathematical symbols that do not translate well to speech synthesis.

Material details:
Title: ${documentTitle}`;

  const userPrompt = `Generate an engaging podcast-style lecture script summarizing this material:

---
${truncatedText}
---`;

  try {
    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return response.choices[0]?.message?.content || "Failed to generate podcast lecture summary.";
  } catch (error) {
    console.error("Failed to generate podcast lecture script:", error);
    return "An error occurred while generating the podcast lecture script.";
  }
}

/**
 * Generate a detailed and comprehensive study guide summary on a given topic name.
 */
export async function generateTopicSummary(topicName: string): Promise<string> {
  const systemPrompt = `You are a world-class academic tutor and textbook writer. Your job is to write a highly detailed, comprehensive, and clear educational study guide on a given topic name.
  
  Your output guide must:
  - Be detailed enough to teach someone about this topic from scratch (aim for roughly 1000-1500 words).
  - Include key concepts, definitions, explanations, formulas (if any), and real-world examples.
  - Use clear headings and structured markdown sections.
  - Support the input language. If the topic is written in Hindi, Gujarati, Spanish, French, etc., write the entire summary in that native language and script.
  
  Write a high-quality educational resource that will serve as the source material for practice quizzes, flashcards, study schedules, and audio lectures.`;

  const userPrompt = `Create a detailed and comprehensive study guide on the topic: "${topicName}".`;

  try {
    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Failed to generate topic summary:", error);
    throw new Error("Failed to compile study guide for this topic. Please try again.");
  }
}





