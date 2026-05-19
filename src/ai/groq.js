import Groq from "groq-sdk";
import { toast } from "react-hot-toast";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Initialize Groq Client
let groq = null;
if (API_KEY) {
    groq = new Groq({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
}

export const getGroqChatCompletion = async (messages) => {
    if (!groq) {
        console.warn("Groq API Key Missing");
        return "I'm currently offline. Please check your connection.";
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile", // Powerful, Fast
            temperature: 0.6,
            max_tokens: 150,
        });

        return completion.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("Groq API Error:", error);
        toast.error("AI Assistant is busy.");
        return "I'm having trouble thinking right now. Please try again.";
    }
};

// Start a chat session helper
export const startChatSession = async (userMessage, history = []) => {
    const systemPrompt = {
        role: "system",
        content: "You are FindIt AI, a friendly assistant for a Lost & Found app. Your goal is to help users report lost items or find reported items. Speak naturally and briefly (1-2 sentences). Do not use technical terms, code blocks, or long explanations. If the user greets you, welcome them warmly."
    };

    const conversation = [systemPrompt, ...history, { role: "user", content: userMessage }];
    
    // Override max_tokens for chat to ensure brevity
    if (!groq) return "I'm offline right now.";
    
    try {
        const completion = await groq.chat.completions.create({
            messages: conversation,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 100, 
        });
        return completion.choices[0]?.message?.content || "";
    } catch (e) {
        console.error("Chat Error", e);
        return "I'm having trouble thinking right now.";
    }
};

// Smart Tag Generation (Text-Based Enhancement)
export const generateSmartTags = async (rawLabels) => {
    if (!groq || rawLabels.length === 0) return [];

    try {
        const prompt = `Generate 5-8 short, precise, comma-separated searchable tags for a lost/found item based on these detected visual labels: "${rawLabels.join(', ')}". Return ONLY the tags, lowercase, no explanation.`;

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are an AI tag generator for a Lost & Found app." },
                { role: "user", content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 100
        });

        const text = response.choices[0]?.message?.content || "";
        return text.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 2);
    } catch (error) {
        console.error("Groq Tag Gen Error:", error);
        return [];
    }
};
