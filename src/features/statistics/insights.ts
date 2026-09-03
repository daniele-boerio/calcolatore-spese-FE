import { MonthlyDetailCategory } from "./interfaces";

/**
 * Le frasi del blocco "Da notare": non commentano tutto, dicono la cosa che
 * merita di essere letta. Il modulo produce solo il *fatto* (che tipo, quale
 * categoria, quale percentuale); la frase la compone la schermata, che ha
 * l'i18n.
 */
export type InsightKind =
  /** Una categoria è sopra la sua media dei mesi precedenti. */
  | "above_average"
  /** Una sola categoria si prende gran parte delle uscite. */
  | "concentration"
  /** Il mese chiude in rosso. */
  | "overspent"
  /** Quota di entrate rimasta in tasca. */
  | "saved_share";

export interface Insight {
  kind: InsightKind;
  tone: "positive" | "negative";
  category?: string;
  /** Percentuale già arrotondata, sempre positiva. */
  percent?: number;
}

export interface InsightsInput {
  /** Categorie del mese come le manda `monthDetails` (uscite col segno meno). */
  categories: MonthlyDetailCategory[];
  /** Media mensile per categoria dei mesi precedenti, positiva. */
  averages: Record<string, number>;
  /** Netto del mese: entrate − uscite − accantonamenti. */
  savings: number;
  income: number;
}

// Sotto questi scarti non c'è niente da segnalare: è rumore di un mese.
const ABOVE_AVERAGE_MIN = 15;
const CONCENTRATION_MIN = 35;
const SAVED_SHARE_MIN = 20;

// Due frasi bastano: la terza non la legge nessuno.
const MAX_INSIGHTS = 2;

const expensesOf = (categories: MonthlyDetailCategory[]) =>
  categories
    .filter((category) => category.totale < 0)
    .map((category) => ({
      categoria: category.categoria,
      totale: Math.abs(category.totale),
    }))
    .sort((a, b) => b.totale - a.totale);

export function buildInsights({
  categories,
  averages,
  savings,
  income,
}: InsightsInput): Insight[] {
  const expenses = expensesOf(categories);
  const total = expenses.reduce((sum, entry) => sum + entry.totale, 0);

  const insights: Insight[] = [];

  // 1. Lo scostamento più grosso sopra la media: è il motivo per cui un mese
  //    costa più del solito, e vale più di qualunque totale.
  const worst = expenses
    .map((entry) => {
      const average = averages[entry.categoria] ?? 0;
      if (average <= 0) return null;

      const percent = Math.round(((entry.totale - average) / average) * 100);
      return percent >= ABOVE_AVERAGE_MIN
        ? { categoria: entry.categoria, percent }
        : null;
    })
    .filter((entry) => entry !== null)
    .sort((a, b) => b.percent - a.percent)[0];

  if (worst) {
    insights.push({
      kind: "above_average",
      tone: "negative",
      category: worst.categoria,
      percent: worst.percent,
    });
  }

  // 2. Il mese in rosso batte qualunque altra osservazione.
  if (savings < 0) {
    insights.push({ kind: "overspent", tone: "negative" });
  } else if (income > 0) {
    const share = Math.round((savings / income) * 100);

    if (share >= SAVED_SHARE_MIN) {
      insights.push({ kind: "saved_share", tone: "positive", percent: share });
    }
  }

  // 3. Se resta posto: quanto pesa la categoria più grossa.
  if (insights.length < MAX_INSIGHTS && total > 0 && expenses.length > 1) {
    const share = Math.round((expenses[0].totale / total) * 100);

    if (share >= CONCENTRATION_MIN) {
      insights.push({
        kind: "concentration",
        tone: "negative",
        category: expenses[0].categoria,
        percent: share,
      });
    }
  }

  return insights.slice(0, MAX_INSIGHTS);
}
