import { google } from "@ai-sdk/google";   


export const DEFUALT_CHAT_MODEL = "gemini-3.6-flash";

export function getChatModel(model?: string | null) {
    return model ? google(model) : google(DEFUALT_CHAT_MODEL);
}