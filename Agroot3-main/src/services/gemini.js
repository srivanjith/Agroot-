import Groq from "groq-sdk";

let groq = null;

const initGroq = () => {
    const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    if (!API_KEY) {
        console.error("VITE_GROQ_API_KEY is missing in .env");
        return false;
    }
    groq = new Groq({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
    return true;
};

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export const getChatResponse = async (prompt, language = "en", retries = 2) => {
    if (!groq) {
        const success = initGroq();
        if (!success) return "Error: VITE_GROQ_API_KEY missing. Please add it to your .env file.";
    }

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",   // free, fast Groq model
            messages: [
                {
                    role: "system",
                    content: `You are Agroot AI, a helpful farming assistant for Indian farmers. Answer briefly and precisely. Respond in the user's language: ${language}.`,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: 512,
            temperature: 0.7,
        });

        return completion.choices[0]?.message?.content || "No response received.";
    } catch (error) {
        console.error("Groq API Error:", error);

        // Retry on rate-limit (429)
        if (retries > 0 && (error?.status === 429 || error?.message?.includes("429"))) {
            const delay = (3 - retries) * 5000;
            console.warn(`Rate limited. Retrying in ${delay / 1000}s...`);
            await sleep(delay);
            return getChatResponse(prompt, language, retries - 1);
        }

        if (error?.status === 429 || error?.message?.includes("429")) {
            return "⚠️ The AI is temporarily busy. Please wait a moment and try again.";
        }

        return `AI Error: ${error.message || error.toString()}`;
    }
};
