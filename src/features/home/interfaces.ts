/** Una ricorrenza attesa nei prossimi giorni, per la card "In arrivo". */
export interface UpcomingRecurrence {
  id: string;
  nome: string;
  importo: number;
  prossima_esecuzione: string;
  conto_id: string;
}

export interface HomeState {
  loading: boolean;
  /** Spesa per giorno della settimana corrente, lunedì → domenica. */
  weekSpending: number[];
  /** Lunedì della settimana coperta da `weekSpending`, come "YYYY-MM-DD". */
  weekStart: string | null;
  upcoming: UpcomingRecurrence[];
  /** Giorni di orizzonte della card "In arrivo". */
  upcomingDays: number;
  /** Uscite del mese precedente: il riferimento del delta sull'hero. */
  previousMonthExpenses: number | null;
  /** Media mensile per categoria sui mesi precedenti, per nome categoria. */
  categoryAverages: Record<string, number>;
}

export interface GetUpcomingParams {
  /** Orizzonte in giorni; il design ne mostra 10. */
  days: number;
}

export interface GetCategoryAveragesParams {
  /** Quanti mesi precedenti mediare; il design ne usa 3. */
  months: number;
}
