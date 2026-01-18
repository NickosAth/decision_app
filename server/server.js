"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const groq_sdk_1 = __importDefault(require("groq-sdk"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const client = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY
});
app.post("/api/decision", async (req, res) => {
    const { text, category, risk, lang } = req.body;
    console.log("Received request:", { text, category, risk, lang });
    const prompt = lang === "el" ? `
Είσαι ένας έμπειρος σύμβουλος αποφάσεων. Ανάλυσε την ακόλουθη κατάσταση και προτείνε μια σοφή απόφαση.

ΣΗΜΑΝΤΙΚΟ: 
- Αν η ερώτηση περιλαμβάνει αρνητικές συνέπειες (π.χ. "να σπάσω το πόδι μου"), κατάλαβε ότι ο χρήστης ΔΕΔΝ θέλει αυτό - είναι ένας κίνδυνος που θέλει να αποφύγει
- Σκέψου τα πλεονεκτήματα vs μειονεκτήματα της κάθε επιλογής
- Λάβε υπόψιν το επίπεδο κινδύνου

Κατάσταση: "${text}"
Κατηγορία: "${category}", Επίπεδο κινδύνου: "${risk}".

Επίστρεψε ΜΟΝΟ ένα JSON με τα εξής πεδία (χωρίς επιπλέον κείμενο):
{
  "recommendation": "Απόφαση σε ελληνικά (σύντομη, σαφής)",
  "explanation": "Ανάλυση της απόφασης σε ελληνικά (2-3 γραμμές, εξήγησε γιατί είναι καλή ή κακή)",
  "score": αριθμός από 0 έως 100,
  "confidence": "χαμηλή|μέτρια|υψηλή"
}
` : `
You are an experienced decision advisor. Analyze the following situation and recommend a wise decision.

IMPORTANT:
- If the question includes negative consequences (e.g., "and break my leg"), understand that the user does NOT want that - it's a risk they want to avoid
- Consider pros vs cons of each option
- Account for the risk level

Situation: "${text}"
Category: "${category}", Risk level: "${risk}".

Return ONLY a JSON with these fields (no extra text):
{
  "recommendation": "A clear decision recommendation",
  "explanation": "Analysis of the decision (2-3 lines, explain why it's good or bad)",
  "score": number from 0 to 100,
  "confidence": "low|medium|high"
}
`;
    try {
        const response = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        });
        const rawContent = response.choices?.[0]?.message?.content || "";
        const match = rawContent.match(/\{[\s\S]*\}/);
        if (!match)
            throw new Error("No JSON found in AI response");
        let result;
        try {
            result = JSON.parse(match[0]);
        }
        catch {
            console.warn("Parsing AI output failed, fallback:", match[0]);
            return res.status(500).json({ error: "AI returned invalid JSON" });
        }
        res.json(result);
    }
    catch (err) {
        console.error("ERROR in /api/decision:", err);
        res.status(500).json({ error: "AI failed", details: err.message });
    }
});
const port = 5000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
