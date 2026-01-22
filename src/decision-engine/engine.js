// Local storage key
const historyStorageKey = "decision_history";
// History
export function saveDecision(entry) {
    const history = loadHistory();
    localStorage.setItem(historyStorageKey, JSON.stringify([entry, ...history]));
}
export function loadHistory() {
    const stored = localStorage.getItem(historyStorageKey);
    return stored ? JSON.parse(stored) : [];
}
export function clearHistory() {
    localStorage.removeItem(historyStorageKey);
}
// Local engine fallback
export function runDecision(input, lang = "en") {
    // Improved recommendation logic
    const recommendations = {
        en: {
            social: {
                low: "Enjoy and connect!",
                medium: "Be mindful, but socialize.",
                high: "Better avoid risky social situations."
            },
            career: {
                low: "Go for it!",
                medium: "Proceed with caution.",
                high: "Reconsider, risk is too high."
            },
            personal: {
                low: "It's safe to proceed.",
                medium: "Think carefully before acting.",
                high: "Avoid it for your safety."
            }
        },
        el: {
            social: {
                low: "Απόλαυσε και συνδέσου!",
                medium: "Να είσαι προσεκτικός, αλλά κοινωνικοποιήσου.",
                high: "Καλύτερα να αποφύγεις επικίνδυνες κοινωνικές καταστάσεις."
            },
            career: {
                low: "Προχώρα!",
                medium: "Προχώρα με προσοχή.",
                high: "Ξανασκέψου το, ο κίνδυνος είναι μεγάλος."
            },
            personal: {
                low: "Είναι ασφαλές να συνεχίσεις.",
                medium: "Σκέψου προσεκτικά πριν ενεργήσεις.",
                high: "Απόφυγέ το για την ασφάλειά σου."
            }
        }
    };
    const categoryLabels = {
        en: { social: "social", career: "career", personal: "personal" },
        el: { social: "κοινωνικό", career: "καριέρα", personal: "προσωπικό" }
    };
    const riskLabels = {
        en: { low: "low", medium: "medium", high: "high" },
        el: { low: "χαμηλό", medium: "μέτριο", high: "υψηλό" }
    };
    const explanations = {
        en: `Local engine suggestion for ${categoryLabels.en[input.category]} (${input.risk} risk): ${recommendations.en[input.category][input.risk]}`,
        el: `Πρόταση τοπικής μηχανής για ${categoryLabels.el[input.category]} (${riskLabels.el[input.risk]} ρίσκο): ${recommendations.el[input.category][input.risk]}`
    };
    const confidenceLabels = {
        en: { low: "low", medium: "medium", high: "high" },
        el: { low: "χαμηλή", medium: "μέτρια", high: "υψηλή" }
    };
    const scoreMap = { low: 80, medium: 55, high: 25 };
    const confidenceMap = { low: "low", medium: "medium", high: "high" };
    return {
        recommendation: recommendations[lang][input.category][input.risk],
        explanation: explanations[lang],
        score: scoreMap[input.risk],
        confidence: confidenceLabels[lang][confidenceMap[input.risk]]
    };
}
// Auto-detect language from text
export function detectLanguage(text) {
    // Greek Unicode ranges: 0x0370–0x03FF
    const greekPattern = /[\u0370-\u03FF]/g;
    const englishPattern = /[a-zA-Z]/g;
    const greekMatches = (text.match(greekPattern) || []).length;
    const englishMatches = (text.match(englishPattern) || []).length;
    // If more Greek characters, use Greek
    return greekMatches > englishMatches ? "el" : "en";
}
// AI engine (calls backend)
export async function runDecisionAI(input, uiLang) {
    try {
        // Auto-detect language from user's question text
        const aiLang = detectLanguage(input.text);
        const res = await fetch("http://localhost:5000/api/decision", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...input, lang: aiLang })
        });
        if (!res.ok)
            throw new Error("AI backend failed");
        const result = await res.json();
        return result;
    }
    catch (err) {
        console.error("AI failed, using local fallback", err);
        return runDecision(input, uiLang);
    }
}
