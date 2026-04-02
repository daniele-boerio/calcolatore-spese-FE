export interface YearDetailsStatRow {
  month: number; // 1 = Gennaio, 2 = Febbraio...
  [key: string]: number; // Chiavi dinamiche per categorie (es. "Stipendio": 1500, "Spesa": -400)
}

export interface FetchYearStatisticsParams {
  year: number;
  categoria_id?: string | null;
}

export interface MonthlyDetailResponse {
  data: MonthlyDetailCategory[];
  totale_entrata: number;
  totale_uscita: number;
}

export interface MonthlyDetailCategory {
  categoria: string;
  totale: number;
  tipo: "USCITA" | "ENTRATA" | "OTHER";
  sottocategorie: SubcategoryData[];
}

export interface SubcategoryData {
  sottocategoria: string;
  totale: number;
}

export interface FetchMonthStatisticsParams {
  year: number;
  month: number;
  categoria_id?: string | null;
}
