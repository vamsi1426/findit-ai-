const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
import { toast } from 'react-hot-toast';

export const identifyObjectWithGemini = async (base64Image) => {
    if (!API_KEY) {
        console.warn("Gemini API Key missing");
        toast.error("Gemini Key Missing");
        return [];
    }

    try {
        // Clean base64 string (remove data prefix)
        const base64Data = base64Image.split(',')[1];

        // Use stable Gemini 1.5 Flash
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Identify the main object in this image. Return ONLY 3-5 precise keywords describing the object (e.g., 'Blue Wallet', 'Leather Bag'). Do not write sentences. Return as a comma-separated list." },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: base64Data
                            }
                        }
                    ]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.warn("Gemini API Error (Silent):", data);
            return [];
        }

        // Parse Response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return [];

        const tags = text.split(',').map(t => t.trim()).filter(t => t.length > 0);
        return tags;

    } catch (error) {
        console.error("Gemini Network Error:", error);
        toast.error("Gemini Connection Failed");
        return [];
    }
};
