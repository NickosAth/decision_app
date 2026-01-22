import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { runDecision, runDecisionAI, saveDecision, loadHistory, clearHistory } from "../decision-engine/engine";
import "../index.css";
function Home() {
    const [text, setText] = useState("");
    const [category, setCategory] = useState("social");
    const [risk, setRisk] = useState("low");
    const [result, setResult] = useState(null);
    const [resultLanguage, setResultLanguage] = useState("en");
    const [history, setHistory] = useState([]);
    const [dark, setDark] = useState(false);
    const [language, setLanguage] = useState("en");
    const [loading, setLoading] = useState(false);
    const [useAI, setUseAI] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    useEffect(() => setHistory(loadHistory()), []);
    useEffect(() => {
        if (result) {
            const timer = setTimeout(() => {
                setResult(null);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [result]);
    function toggleTheme() {
        setDark(prev => {
            const next = !prev;
            document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
            return next;
        });
    }
    async function handleDecision() {
        if (!text.trim())
            return;
        const input = { text, category, risk };
        setLoading(true);
        let output;
        try {
            output = useAI ? await runDecisionAI(input, language) : runDecision(input, language);
        }
        catch {
            output = runDecision(input, language);
        }
        setResult(output);
        setResultLanguage(language);
        const entry = { input, result: output, date: new Date().toISOString(), language };
        saveDecision(entry);
        setHistory(prev => [entry, ...prev]);
        setText("");
        setLoading(false);
    }
    function exportHistory() {
        const txtContent = history.map((item, index) => {
            const date = new Date(item.date).toLocaleString();
            const categoryLabel = language === "en" ? {
                social: "Social", career: "Career", personal: "Personal"
            } : {
                social: "Κοινωνική", career: "Καριέρα", personal: "Προσωπική"
            };
            return `
═══════════════════════════════════════════════════
DECISION #${index + 1}
═══════════════════════════════════════════════════
${language === "en" ? "Date" : "Ημερομηνία"}: ${date}
${language === "en" ? "Category" : "Κατηγορία"}: ${categoryLabel[item.input.category]}
${language === "en" ? "Risk Level" : "Επίπεδο Κινδύνου"}: ${item.input.risk}

${language === "en" ? "DECISION" : "ΑΠΌΦΑΣΗ"}:
${item.input.text}

${language === "en" ? "RECOMMENDATION" : "ΣΎΣΤΑΣΗ"}:
${item.result.recommendation}

${language === "en" ? "ANALYSIS" : "ΑΝΆΛΥΣΗ"}:
${item.result.explanation}

${language === "en" ? "SCORE" : "ΒΑΘΜΌΣ"}: ${item.result.score}/100
${language === "en" ? "CONFIDENCE" : "ΕΜΠΙΣΤΟΣΎΝΗ"}: ${item.result.confidence}
`;
        }).join("\n");
        const header = `
╔════════════════════════════════════════════════════╗
║        ${language === "en" ? "DECISION HISTORY EXPORT" : "ΕΞΑΓΩΓΉ ΙΣΤΟΡΙΚΟΎ ΑΠΟΦΆΣΕΩΝ"}        ║
╚════════════════════════════════════════════════════╝

${language === "en" ? "Generated on" : "Δημιουργήθηκε στις"}: ${new Date().toLocaleString()}
${language === "en" ? "Total Decisions" : "Σύνολο Αποφάσεων"}: ${history.length}

════════════════════════════════════════════════════
`;
        const footer = `
════════════════════════════════════════════════════
${language === "en" ? "End of Report" : "Τέλος Αναφοράς"}
════════════════════════════════════════════════════`;
        const fullContent = header + txtContent + footer;
        const blob = new Blob([fullContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `decisions-${new Date().toISOString().split("T")[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
    const filteredHistory = history.filter(item => {
        const matchSearch = item.input.text.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = filterCategory === "all" || item.input.category === filterCategory;
        return matchSearch && matchCategory;
    });
    return (_jsxs("div", { className: "container", children: [_jsxs("div", { className: "header", style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs("h1", { className: "app-title", children: [_jsx("span", { style: { fontSize: "2.2rem", verticalAlign: "middle", marginRight: "0.5rem" }, children: "\uD83E\uDDE0" }), _jsxs("span", { className: "app-title-text", children: [language === "en" ? "Decision " : "Εφαρμογή ", _jsx("span", { className: "sparkle-emoji", style: { display: "inline-block", animation: "sparkle 1.5s infinite alternate" }, children: "\u2728" }), language === "en" ? "App" : "Αποφάσεων"] })] }), _jsx("button", { onClick: toggleTheme, children: dark ? (language === "en" ? "Light" : "Φωτεινό") : (language === "en" ? "Dark" : "Σκοτεινό") })] }), _jsxs("div", { className: "selects", children: [_jsxs("div", { children: [_jsxs("label", { children: [language === "en" ? "Language" : "Γλώσσα", ": "] }), _jsxs("select", { value: language, onChange: e => setLanguage(e.target.value), children: [_jsx("option", { value: "en", children: "English" }), _jsx("option", { value: "el", children: "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC" })] })] }), _jsxs("div", { className: "toggle-container", children: [_jsxs("label", { children: [language === "en" ? "Use AI" : "Χρήση AI", ": "] }), _jsx("button", { className: "toggle-switch", onClick: () => setUseAI(!useAI), "data-active": useAI, children: _jsx("span", { className: "toggle-slider" }) })] })] }), _jsx("textarea", { placeholder: language === "en" ? "Describe your decision..." : "Περιέγραψε την απόφασή σου...", value: text, onChange: e => setText(e.target.value) }), _jsxs("div", { className: "selects", children: [_jsxs("div", { children: [_jsxs("label", { children: [language === "en" ? "Category" : "Κατηγορία", ": "] }), _jsxs("select", { value: category, onChange: e => setCategory(e.target.value), children: [_jsx("option", { value: "social", children: language === "en" ? "Social" : "Κοινωνικό" }), _jsx("option", { value: "career", children: language === "en" ? "Career" : "Καριέρα" }), _jsx("option", { value: "personal", children: language === "en" ? "Personal" : "Προσωπικό" })] })] }), _jsxs("div", { children: [_jsxs("label", { children: [language === "en" ? "Risk" : "Κίνδυνος", ": "] }), _jsxs("select", { value: risk, onChange: e => setRisk(e.target.value), children: [_jsx("option", { value: "low", children: language === "en" ? "Low" : "Χαμηλό" }), _jsx("option", { value: "medium", children: language === "en" ? "Medium" : "Μέτριο" }), _jsx("option", { value: "high", children: language === "en" ? "High" : "Υψηλό" })] })] })] }), _jsx("div", { className: "buttons", children: _jsx("button", { onClick: handleDecision, disabled: !text.trim() || loading, children: loading ? (_jsx("span", { className: "spinner", children: language === "en" ? "Thinking..." : "Σκέψη..." })) : (language === "en" ? "Decide" : "Απόφαση") }) }), loading && (_jsx("div", { className: "spinner-container", children: _jsx("div", { className: "spinner" }) })), result && (_jsxs("div", { className: "result-card fade-in", children: [_jsx("h3", { children: result.recommendation }), _jsx("p", { children: result.explanation }), _jsx("div", { className: "score-bar", children: _jsx("div", { className: "score-fill", style: { width: `${result.score}%` } }) }), _jsxs("small", { children: [resultLanguage === "en" ? "Score" : "Βαθμός", ": ", result.score, "/100"] }), _jsxs("p", { children: [resultLanguage === "en" ? "Confidence" : "Εμπιστοσύνη", ": ", _jsx("strong", { children: result.confidence })] })] })), history.length > 0 && (_jsxs("div", { className: "history", children: [_jsxs("div", { className: "history-header", children: [_jsx("h2", { children: language === "en" ? "History" : "Ιστορικό" }), _jsxs("div", { className: "history-controls", children: [_jsx("button", { className: "export-btn", onClick: exportHistory, title: language === "en" ? "Export as JSON" : "Εξαγωγή ως JSON", children: language === "en" ? "↓ Export" : "↓ Εξαγωγή" }), _jsx("button", { className: "delete-history-btn", onClick: () => {
                                            if (window.confirm(language === "en" ? "Clear all history?" : "Διαγραφή όλου του ιστορικού;")) {
                                                clearHistory();
                                                setHistory([]);
                                            }
                                        }, children: language === "en" ? "Delete History" : "Διαγραφή Ιστορικού" })] })] }), _jsxs("div", { className: "history-filters", children: [_jsx("input", { type: "text", placeholder: language === "en" ? "Search decisions..." : "Αναζήτηση αποφάσεων...", value: searchTerm, onChange: e => setSearchTerm(e.target.value), className: "search-input" }), _jsxs("select", { value: filterCategory, onChange: e => setFilterCategory(e.target.value), className: "filter-select", children: [_jsx("option", { value: "all", children: language === "en" ? "All Categories" : "Όλες οι κατηγορίες" }), _jsx("option", { value: "social", children: language === "en" ? "Social" : "Κοινωνική" }), _jsx("option", { value: "career", children: language === "en" ? "Career" : "Καριέρα" }), _jsx("option", { value: "personal", children: language === "en" ? "Personal" : "Προσωπική" })] }), _jsx("span", { className: "results-count", children: language === "en" ? `${filteredHistory.length} result${filteredHistory.length !== 1 ? "s" : ""}` :
                                    `${filteredHistory.length} αποτέλεσμα${filteredHistory.length !== 1 ? "τα" : ""}` })] }), filteredHistory.length > 0 ? (filteredHistory.map((h, i) => (_jsxs("div", { className: "history-item fade-in", children: [_jsx("strong", { children: new Date(h.date).toLocaleString() }), _jsx("div", { className: "history-meta", children: (() => {
                                    const categoryLabel = language === "en"
                                        ? { social: "Social", career: "Career", personal: "Personal" }
                                        : { social: "Κοινωνική", career: "Καριέρα", personal: "Προσωπική" };
                                    const riskLabel = language === "en"
                                        ? { low: "Low", medium: "Medium", high: "High" }
                                        : { low: "Χαμηλό", medium: "Μέτριο", high: "Υψηλό" };
                                    return (_jsxs(_Fragment, { children: [_jsxs("span", { children: [language === "en" ? "Category" : "Κατηγορία", ": "] }), _jsx("span", { style: { marginRight: "1.5em" }, children: categoryLabel[h.input.category] }), _jsxs("span", { children: [language === "en" ? "Risk" : "Κίνδυνος", ": "] }), _jsx("span", { children: riskLabel[h.input.risk] })] }));
                                })() }), _jsx("p", { children: h.input.text }), _jsxs("small", { children: [_jsxs("strong", { children: [h.language === "en" ? "Recommendation" : "Σύσταση", ":"] }), " ", h.result.recommendation] }), _jsx("p", { style: { fontSize: "0.9em", marginTop: "0.5rem", color: "#666" }, children: h.result.explanation }), _jsxs("small", { children: [h.language === "en" ? "Score" : "Βαθμός", ": ", h.result.score, "/100 | ", h.language === "en" ? "Confidence" : "Εμπιστοσύνη", ": ", h.result.confidence] })] }, i)))) : (_jsx("div", { style: { textAlign: "center", padding: "2rem", color: "var(--gray-500)" }, children: language === "en" ? "No decisions found" : "Δεν βρέθηκαν αποφάσεις" }))] }))] }));
}
export default Home;
