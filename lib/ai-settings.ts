import { cookies } from "next/headers";

export interface AISettings {
  provider: "default" | "gemini" | "groq" | "ollama" | "openai" | "openrouter";
  apiKey?: string;
  model?: string;
}

/**
 * Server utility to extract user-customized AI keys and settings from browser cookies.
 */
export async function getAISettingsFromCookies(): Promise<AISettings> {
  try {
    const cookieStore = await cookies();
    const provider = (cookieStore.get("custom_provider")?.value || "default") as AISettings["provider"];
    const apiKey = cookieStore.get("custom_api_key")?.value || "";
    const model = cookieStore.get("custom_model")?.value || "";

    return {
      provider,
      apiKey: apiKey.trim() ? apiKey.trim() : undefined,
      model: model.trim() ? model.trim() : undefined,
    };
  } catch (error) {
    // Fail-safe default if cookie reading fails (e.g. static rendering environment)
    return { provider: "default" };
  }
}
