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
  default: boolean;
  // Open Banking: collegato quando bank_connector_account_id è valorizzato
  bank_connector_provider?: string | null;
  bank_connector_account_id?: string | null;
  bank_connector_institution_id?: string | null;
  bank_connector_last_sync?: string | null;
  bank_connector_last_error?: string | null;
}

export interface ExpenseByCategory {
  label: string;
  value: number;
}

export interface MonthlyBudget {
  total_budget: number | null;
  expenses: number | null;
  percentage: number | null;
  remaining?: number | null;
}

export interface BudgetUpdateData {
  total_budget: number | null;
}

// Struttura specifica della risposta API per il budget
export interface MonthlyBudgetResponse {
  monthly_budget: {
    total_budget: number | null;
    expenses?: number | null;
    percentage: number | null;
    remaining?: number | null;
  };
  remaining?: number | null;
}

export interface ContoState {
  loading: boolean;
  conti: Conto[];
  selectedConto: Conto | null;
  monthlyBudget: MonthlyBudget;
  monthlyExpensesByCategory: ExpenseByCategory[];
  filters: ContoFilters;
  include_future_recurring: boolean;
}

// Interfaccia per il payload di aggiornamento budget
export interface UpdateBudgetParams {
  total_budget: number | null;
}

export interface GetMonthExpensesParams {
  include_future_recurring?: boolean;
}

export interface CreateContoParams {
  nome: string;
  saldo: number;
  default: boolean;
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
  default?: boolean;
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

// --- Import estratto conto (PDF, Excel .xlsx o CSV) ---

export interface ImportStatementParams {
  conto_id: string;
  file: File;
  data_da?: string | null; // formato YYYY-MM-DD
  data_a?: string | null; // formato YYYY-MM-DD
  balance_column?: boolean; // rilevante solo per il PDF
}

export interface ImportStatementResponse {
  parsed: number; // movimenti riconosciuti (dopo il filtro date)
  new_proposals: number; // proposte PENDING create
  skipped: number; // scartati perché duplicati
}

export interface ContoFilters {
  sort_by?: string[];
  nome?: string;
  saldo_min?: number;
  saldo_max?: number;
  ricarica_automatica?: boolean;
}

// --- Open Banking (collegamento conto a banca via Enable Banking) ---

// Una banca (ASPSP): identificata da nome + paese, non da un singolo id.
export interface Institution {
  name: string;
  country: string;
  logo?: string;
}

export interface StartBankAuthParams {
  conto_id: string;
  aspsp_name: string;
  aspsp_country: string;
}

export interface BankAuthLink {
  url: string;
}

export interface ConfirmBankSessionParams {
  state: string;
  code: string;
}

export interface DisconnectBankParams {
  conto_id: string;
}

export interface BankSessionResult {
  conto_id: number;
  account_id: string;
  status: string;
}
