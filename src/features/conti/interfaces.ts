// --- INTERFACCE ---

export interface Conto {
  id: string;
  nome: string;
  saldo: number;
  // aggiungi altri campi se presenti nel tuo oggetto Conto
}

export interface ExpenseByCategory {
  categoria: string;
  totale: number;
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
