export interface MonthlyIncomeExpenseOut {
  label: string;
  entrate: number;
  uscite: number;
}

export interface MonthlySavingsOut {
  label: string;
  risparmio: number;
}

export interface ExpenseCompositionOut {
  categoria: string;
  totale: number;
  color?: string | null;
}

export interface CategoryTrendOut {
  label: string;
  spesa: number;
}

// Params Interfaces
export interface GetIncomeExpenseParams {
  data_inizio?: string | null;
  data_fine?: string | null;
}

export interface GetSavingsParams {
  data_inizio?: string | null;
  data_fine?: string | null;
}

export interface GetExpenseCompositionParams {
  data_inizio?: string | null;
  data_fine?: string | null;
}

export interface GetCategoryTrendParams {
  categoria_id: string;
  data_inizio?: string | null;
  data_fine?: string | null;
}

// State Interface
export interface ChartsState {
  incomeExpense: MonthlyIncomeExpenseOut[];
  savings: MonthlySavingsOut[];
  expenseComposition: ExpenseCompositionOut[];
  categoryTrend: CategoryTrendOut[];
  loading: boolean;
  error: string | null;
}
