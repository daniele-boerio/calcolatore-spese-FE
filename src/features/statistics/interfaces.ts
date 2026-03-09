export interface MonthlyStatRow {
  month: number; // 1 = Gennaio, 2 = Febbraio...
  [key: string]: number; // Chiavi dinamiche per categorie (es. "Stipendio": 1500, "Spesa": -400)
}

export interface FetchStatisticsParams {
  year: number;
  categoria_id?: string | null;
}
