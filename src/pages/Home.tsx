import { useState, useEffect } from "react";
import { runDecision, runDecisionAI, saveDecision, loadHistory, clearHistory } from "../decision-engine/engine";
import type { DecisionInput, DecisionResult, StoredDecision } from "../decision-engine/types";
import "../index.css";

function Home() {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<DecisionInput["category"]>("social");
  const [risk, setRisk] = useState<DecisionInput["risk"]>("low");
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [resultLanguage, setResultLanguage] = useState<"en" | "el">("en");
  const [history, setHistory] = useState<StoredDecision[]>([]);
  const [dark, setDark] = useState(false);
  const [language, setLanguage] = useState<"en" | "el">("en");
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | DecisionInput["category"]>("all");

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
    if (!text.trim()) return;
    const input: DecisionInput = { text, category, risk };
    setLoading(true);
    let output: DecisionResult;

    try {
      output = useAI ? await runDecisionAI(input, language) : runDecision(input, language);
    } catch {
      output = runDecision(input, language);
    }

    setResult(output);
    setResultLanguage(language);

    const entry: StoredDecision = { input, result: output, date: new Date().toISOString(), language };
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

  return (
    <div className="container">
      <div className="header" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <h1 className="app-title">
          <span style={{fontSize: "2.2rem", verticalAlign: "middle", marginRight: "0.5rem"}}>🧠</span>
          <span className="app-title-text">
            {language === "en" ? "Decision " : "Εφαρμογή "}
            <span className="sparkle-emoji" style={{display: "inline-block", animation: "sparkle 1.5s infinite alternate"}}>✨</span>
            {language === "en" ? "App" : "Αποφάσεων"}
          </span>
        </h1>
        <button onClick={toggleTheme}>{dark ? (language==="en"?"Light":"Φωτεινό"):(language==="en"?"Dark":"Σκοτεινό")}</button>
      </div>

      <div className="selects">
        <div>
          <label>{language==="en"?"Language":"Γλώσσα"}: </label>
          <select value={language} onChange={e=>setLanguage(e.target.value as "en"|"el")}>
            <option value="en">English</option>
            <option value="el">Ελληνικά</option>
          </select>
        </div>
        <div className="toggle-container">
          <label>{language==="en"?"Use AI":"Χρήση AI"}: </label>
          <button className="toggle-switch" onClick={() => setUseAI(!useAI)} data-active={useAI}>
            <span className="toggle-slider"></span>
          </button>
        </div>
      </div>

      <textarea placeholder={language==="en"?"Describe your decision...":"Περιέγραψε την απόφασή σου..."} value={text} onChange={e=>setText(e.target.value)} />

      <div className="selects">
        <div>
          <label>{language==="en"?"Category":"Κατηγορία"}: </label>
          <select value={category} onChange={e=>setCategory(e.target.value as DecisionInput["category"])}>
            <option value="social">{language==="en"?"Social":"Κοινωνικό"}</option>
            <option value="career">{language==="en"?"Career":"Καριέρα"}</option>
            <option value="personal">{language==="en"?"Personal":"Προσωπικό"}</option>
          </select>
        </div>
        <div>
          <label>{language==="en"?"Risk":"Κίνδυνος"}: </label>
          <select value={risk} onChange={e=>setRisk(e.target.value as DecisionInput["risk"])}>
            <option value="low">{language==="en"?"Low":"Χαμηλό"}</option>
            <option value="medium">{language==="en"?"Medium":"Μέτριο"}</option>
            <option value="high">{language==="en"?"High":"Υψηλό"}</option>
          </select>
        </div>
      </div>

      <div className="buttons">
  <button onClick={handleDecision} disabled={!text.trim() || loading}>
    {loading ? (
      <span className="spinner">{language==="en"?"Thinking...":"Σκέψη..."}</span>
    ) : (
      language==="en"?"Decide":"Απόφαση"
    )}
  </button>
</div>

{loading && (
  <div className="spinner-container">
    <div className="spinner"></div>
  </div>
)}

      {result && (
        <div className="result-card fade-in">
          <h3>{result.recommendation}</h3>
          <p>{result.explanation}</p>
          <div className="score-bar"><div className="score-fill" style={{width:`${result.score}%`}} /></div>
          <small>{resultLanguage==="en"?"Score":"Βαθμός"}: {result.score}/100</small>
          <p>{resultLanguage==="en"?"Confidence":"Εμπιστοσύνη"}: <strong>{result.confidence}</strong></p>
        </div>
      )}

      {history.length>0 && (
        <div className="history">
          <div className="history-header">
            <h2>{language==="en"?"History":"Ιστορικό"}</h2>
            <div className="history-controls">
              <button className="export-btn" onClick={exportHistory} title={language==="en"?"Export as JSON":"Εξαγωγή ως JSON"}>
                {language==="en"?"↓ Export":"↓ Εξαγωγή"}
              </button>
              <button className="delete-history-btn" onClick={() => {
                if (window.confirm(language==="en"?"Clear all history?":"Διαγραφή όλου του ιστορικού;")) {
                  clearHistory();
                  setHistory([]);
                }
              }}>
                {language==="en"?"Delete History":"Διαγραφή Ιστορικού"}
              </button>
            </div>
          </div>

          <div className="history-filters">
            <input 
              type="text" 
              placeholder={language==="en"?"Search decisions...":"Αναζήτηση αποφάσεων..."}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select 
              value={filterCategory} 
              onChange={e => setFilterCategory(e.target.value as "all" | DecisionInput["category"])}
              className="filter-select"
            >
              <option value="all">{language==="en"?"All Categories":"Όλες οι κατηγορίες"}</option>
              <option value="social">{language==="en"?"Social":"Κοινωνική"}</option>
              <option value="career">{language==="en"?"Career":"Καριέρα"}</option>
              <option value="personal">{language==="en"?"Personal":"Προσωπική"}</option>
            </select>
            <span className="results-count">
              {language==="en"?`${filteredHistory.length} result${filteredHistory.length!==1?"s":""}`:
                `${filteredHistory.length} αποτέλεσμα${filteredHistory.length!==1?"τα":""}`}
            </span>
          </div>
          {filteredHistory.length > 0 ? (
            filteredHistory.map((h,i)=>(
                <div key={i} className="history-item fade-in">
                  <strong>{new Date(h.date).toLocaleString()}</strong>
                  <div className="history-meta">
                    {(() => {
                      const categoryLabel = language === "en"
                        ? { social: "Social", career: "Career", personal: "Personal" }
                        : { social: "Κοινωνική", career: "Καριέρα", personal: "Προσωπική" };
                      const riskLabel = language === "en"
                        ? { low: "Low", medium: "Medium", high: "High" }
                        : { low: "Χαμηλό", medium: "Μέτριο", high: "Υψηλό" };
                      return (
                        <>
                          <span>{language === "en" ? "Category" : "Κατηγορία"}: </span>
                          <span style={{marginRight: "1.5em"}}>{categoryLabel[h.input.category]}</span>
                          <span>{language === "en" ? "Risk" : "Κίνδυνος"}: </span>
                          <span>{riskLabel[h.input.risk]}</span>
                        </>
                      );
                    })()}
                  </div>
                  <p>{h.input.text}</p>
                  <small><strong>{h.language==="en"?"Recommendation":"Σύσταση"}:</strong> {h.result.recommendation}</small>
                  <p style={{fontSize: "0.9em", marginTop: "0.5rem", color: "#666"}}>{h.result.explanation}</p>
                  <small>{h.language==="en"?"Score":"Βαθμός"}: {h.result.score}/100 | {h.language==="en"?"Confidence":"Εμπιστοσύνη"}: {h.result.confidence}</small>
                </div>
            ))
          ) : (
            <div style={{textAlign: "center", padding: "2rem", color: "var(--gray-500)"}}>
              {language==="en"?"No decisions found":"Δεν βρέθηκαν αποφάσεις"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
