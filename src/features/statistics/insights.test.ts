import { describe, it, expect } from "vitest";
import { buildInsights } from "./insights";
import { MonthlyDetailCategory } from "./interfaces";

const cat = (categoria: string, totale: number): MonthlyDetailCategory => ({
  categoria,
  totale,
  tipo: totale < 0 ? "USCITA" : "ENTRATA",
  sottocategorie: [],
});

const base = {
  categories: [cat("Spesa", -400), cat("Svago", -150), cat("Casa", -100)],
  averages: {} as Record<string, number>,
  savings: 500,
  income: 2000,
};

describe("buildInsights", () => {
  it("segnala la categoria più sopra la sua media", () => {
    const [first] = buildInsights({
      ...base,
      averages: { Spesa: 380, Svago: 90 },
    });

    // Svago è +67%, Spesa solo +5%: vince lo scostamento più grosso, non
    // l'importo più grosso.
    expect(first).toMatchObject({
      kind: "above_average",
      tone: "negative",
      category: "Svago",
      percent: 67,
    });
  });

  it("tace sugli scostamenti piccoli", () => {
    const insights = buildInsights({
      ...base,
      averages: { Spesa: 380, Svago: 140, Casa: 95 },
    });

    expect(insights.some((i) => i.kind === "above_average")).toBe(false);
  });

  it("non confronta con una media che non esiste", () => {
    // Primo mese di una categoria: media 0, nessuna percentuale sensata.
    const insights = buildInsights({ ...base, averages: { Svago: 0 } });

    expect(insights.some((i) => i.kind === "above_average")).toBe(false);
  });

  it("dice quando il mese chiude in rosso", () => {
    const insights = buildInsights({ ...base, savings: -120 });

    expect(insights[0]).toMatchObject({ kind: "overspent", tone: "negative" });
  });

  it("festeggia una quota di risparmio alta", () => {
    const insights = buildInsights({ ...base, savings: 600, income: 2000 });

    expect(insights[0]).toMatchObject({
      kind: "saved_share",
      tone: "positive",
      percent: 30,
    });
  });

  it("non festeggia un risparmio marginale", () => {
    const insights = buildInsights({ ...base, savings: 100, income: 2000 });

    expect(insights.some((i) => i.kind === "saved_share")).toBe(false);
  });

  it("segnala la concentrazione solo se resta spazio", () => {
    // Spesa è 400 su 650 di uscite e non c'è nient'altro da dire.
    const insights = buildInsights({ ...base, savings: 100 });

    expect(insights).toEqual([
      { kind: "concentration", tone: "negative", category: "Spesa", percent: 62 },
    ]);
  });

  it("non scrive mai più di due frasi", () => {
    const insights = buildInsights({
      ...base,
      averages: { Svago: 50 },
      savings: 800,
      income: 2000,
    });

    expect(insights).toHaveLength(2);
  });

  it("regge un mese senza movimenti", () => {
    expect(
      buildInsights({ categories: [], averages: {}, savings: 0, income: 0 }),
    ).toEqual([]);
  });
});
