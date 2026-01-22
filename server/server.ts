import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.post("/api/decision", async (req, res) => {
  const { text, category, risk, lang } = req.body;
  console.log("Received request:", { text, category, risk, lang });

  const prompt = lang === "el" ? `Είσαι ένας έμπειρος ψυχολόγος και σύμβουλος αποφάσεων με χρόνια εμπειρία. Ανάλυσε ΠΡΟΣΕΚΤΙΚΆ την ακόλουθη κατάσταση και προτείνε μια πρακτική, ρεαλιστική απόφαση.

ΚΑΝΟΝΕΣ:
1. Αν η ερώτηση περιλαμβάνει αρνητικές συνέπειες (π.χ. "θα σπάσω το πόδι μου"), κατάλαβε ότι ο χρήστης ΔΕΔΝ θέλει αυτό - είναι κίνδυνος να αποφύγει
2. ΑΝΑΛΥΣΕ διεξοδικά: πλεονεκτήματα, μειονεκτήματα, κόστη, οφέλη
3. Λάβε υπόψιν το επίπεδο κινδύνου: ${risk}
4. Δώσε ΜΙΑ ΣΥΓΚΕΚΡΙΜΕΝΗ απάντηση, όχι γενικές φράσεις
5. Score: 0-100 όπου 0=κακή ιδέα, 100=εξαιρετική ιδέα (για την ΣΥΝΙΣΤΩΜΕΝΗ απόφαση)
6. Χρησιμοποίησε ΜΟΝΟ ελληνικά

ΠΕΡΙΠΤΩΣΗ: "${text}"
ΚΑΤΗΓΟΡΙΑ: ${category}, ΚΙΝΔΥΝΟΣ: ${risk}

ΑΠΑΝΤΗΣΕ ΜΟΝΟ με ένα έγκυρο JSON (χωρίς επιπλέον κείμενο, χωρίς markdown, χωρίς επεξηγήσεις):
{
  "recommendation": "Μία συγκεκριμένη πρακτική σύσταση (1 πρόταση, ξεκάθαρη και δράσιμη)",
  "explanation": "Σύντομη ανάλυση: γιατί αυτή είναι η καλύτερη επιλογή δεδομένων των περιστάσεων",
  "score": 85,
  "confidence": "υψηλή"
}` : `You are an experienced psychologist and decision advisor with years of expertise. Analyze CAREFULLY the following situation and recommend a practical, realistic decision.

RULES:
1. If the question includes negative consequences (e.g., "break my leg"), understand the user does NOT want that - it's a risk to avoid
2. ANALYZE thoroughly: pros, cons, costs, benefits
3. Account for risk level: ${risk}
4. Give ONE SPECIFIC answer, not generic phrases
5. Score: 0-100 where 0=bad idea, 100=excellent idea (for the RECOMMENDED decision, not the negative alternative)
6. Use ONLY English

CASE: "${text}"
CATEGORY: ${category}, RISK: ${risk}

RESPOND ONLY with valid JSON (no extra text, no markdown, no explanations):
{
  "recommendation": "One specific practical suggestion (1 sentence, clear and actionable)",
  "explanation": "Brief analysis: why this is the best choice given the circumstances",
  "score": 75,
  "confidence": "high"
}`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500
    });

    const rawContent = response.choices?.[0]?.message?.content || "";
    
    const match = rawContent.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in AI response");

    let result;
    try {
      result = JSON.parse(match[0]);
    } catch {
      console.warn("Parsing AI output failed, fallback:", match[0]);
      return res.status(500).json({ error: "AI returned invalid JSON" });
    }

    res.json(result);

  } catch (err) {
    console.error("ERROR in /api/decision:", err);
    res.status(500).json({ error: "AI failed", details: (err as Error).message });
  }
});

const port = 5000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
