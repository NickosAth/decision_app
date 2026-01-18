export type RiskLevel = "low" | "medium" | "high";
export type Category = "social" | "career" | "personal";

export interface DecisionInput {
  text: string;
  category: Category;
  risk: RiskLevel;
}

export interface DecisionResult {
  recommendation: string;
  explanation: string;
  score: number;
  confidence: string; // "low" | "medium" | "high"
}

export interface StoredDecision {
  input: DecisionInput;
  result: DecisionResult;
  date: string;
  language: "en" | "el";
}

