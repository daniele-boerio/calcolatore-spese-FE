// --- INTERFACCE ---

export interface Conto {
  id: string;
  nome: string;
  saldo: number;
  ricarica_automatica: boolean;
  budget_obiettivo?: number;
  soglia_minima?: number;
  conto_sorgente_id?: string;
  frequenza_controllo?: string;
  prossimo_controllo?: string;
  creationDate: string;
  lastUpdate: string;
  color: string;
}

export interface ExpenseByCategory {
  label: string;
  value: number;
}

export interface MonthlyBudget {
  totalBudget: number | null;
  expenses: number | null;
  percentage: number | null;
}

export interface BudgetUpdateData {
  totalBudget: number | null;
}

// Struttura specifica della risposta API per il budget
export interface MonthlyBudgetResponse {
  monthly_budget: {
    totalBudget: number | null;
    expenses: number | null;
    percentage: number | null;
  };
}

export interface ContoState {
  loading: boolean;
  conti: Conto[];
  selectedConto: Conto | null;
  monthlyBudget: MonthlyBudget;
  monthlyExpensesByCategory: ExpenseByCategory[];
}

// Interfaccia per il payload di aggiornamento budget
export interface UpdateBudgetParams {
  totalBudget: number | null;
}

export interface CreateContoParams {
  nome: string;
  saldo: number;
  ricarica_automatica: boolean;
  budget_obiettivo?: number;
  soglia_minima?: number;
  conto_sorgente_id?: string;
  frequenza_controllo?: string;
  prossimo_controllo?: string;
}

export interface UpdateContoParams {
  id: string;
  nome?: string;
  saldo?: number;
  ricarica_automatica?: boolean;
  budget_obiettivo?: number;
  soglia_minima?: number;
  conto_sorgente_id?: string;
  frequenza_controllo?: string;
  prossimo_controllo?: string;
}

export interface DeleteContoParams {
  id: string;
}
