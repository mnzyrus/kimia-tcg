const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyCxU7FeDjWQzIAlaMb4xpqr6LkNiHwKfQs";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Note: getGenerativeModel is for generation, but we iterate differently to list models if using the direct API,
        // but the SDK has no direct 'listModels' on the root client in some versions or needs a specific manager.
        // Actually, looking at docs, standard @google/generative-ai doesn't expose listModels easily on the genAI instance in all versions?
        // Wait, it is on the ModelManager?
        // Let's try to just hit the API with a simple fetch to be raw and accurate, preventing SDK version issues.

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
        } else {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        }

    } catch (error) {
        console.error("Script Error:", error);
    }
}

listModels();
