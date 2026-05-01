"use server";

import { translateText, generateProductDescription } from "@/lib/ai/gemini";

export async function aiTranslateAction(text: string) {
    try {
        console.log("AI_SYNC_INIT: Translating text...", text);
        const langs = ["en", "uk", "pl"];
        const translations = await translateText(text, langs);
        console.log("AI_SYNC_SUCCESS: Received translations", translations);
        return { success: true, data: translations };
    } catch (error: any) {
        console.error("AI_SYNC_ERROR: Translate Action Failed:", error);
        return { success: false, error: error.message };
    }
}

export async function aiGenerateDescriptionAction(productName: string) {
    try {
        console.log("AI_SYNC_INIT: Generating description for...", productName);
        const langs = ["en", "uk", "pl"];
        const descriptions = await generateProductDescription(productName, langs);
        console.log("AI_SYNC_SUCCESS: Received descriptions", descriptions);
        return { success: true, data: descriptions };
    } catch (error: any) {
        console.error("AI_SYNC_ERROR: Generate Description Failed:", error);
        return { success: false, error: error.message };
    }
}
