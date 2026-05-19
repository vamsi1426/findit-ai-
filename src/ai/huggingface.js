const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;
import { toast } from 'react-hot-toast';

const MODEL = "Salesforce/blip-image-captioning-large";

/**
 * Identifies objects using Hugging Face BLIP (Best Quality) via Proxy.
 */
export const identifyObjectWithHuggingFace = async (base64Image) => {
    if (!HF_API_KEY) {
        toast.error("Cloud Vision Key Missing");
        return [];
    }

    try {
        // 1. Prepare raw binary data
        const base64Data = base64Image.split(',')[1];
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // 2. Use 'corsproxy.io' to tunnel the POST request (Bypasses CORS)
        const targetUrl = `https://api-inference.huggingface.co/models/${MODEL}`;
        const proxyUrl = `https://corsproxy.io/?` + encodeURIComponent(targetUrl);
        
        console.log("Calling High-Quality AI (via Tunnel)...");
        const response = await fetch(proxyUrl, {
            method: "POST",
            headers: { 
                Authorization: `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/octet-stream" 
            },
            body: bytes,
        });

        const result = await response.json();

        // [Parsing Logic...]
        if (Array.isArray(result) && result[0]?.generated_text) {
             const sentence = result[0].generated_text;
             console.log("AI Description:", sentence);
             
             const stopwords = ['a', 'an', 'the', 'on', 'in', 'at', 'of', 'is', 'are', 'with', 'to', 'for', 'lying', 'sitting', 'next'];
             const tags = sentence.split(' ')
                .map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
                .filter(w => w.length > 2 && !stopwords.includes(w));
             
             return [...new Set(tags)];
        } 
        
        if (result.error) {
            console.warn("Cloud AI Warning:", result.error); // Warn instead of Error
            if (result.error.includes("loading")) {
                toast("AI waking up... (using local fallback)", { icon: "⏳" });
            }
        }
        return [];

    } catch (error) {
        console.warn("Cloud AI Unreachable (using local):", error); // Soften error
        return [];
    }
};
