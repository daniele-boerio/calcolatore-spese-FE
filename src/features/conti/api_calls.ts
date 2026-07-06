import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { AxiosError } from "axios";
import {
  Conto,
  MonthlyBudgetResponse,
  ExpenseByCategory,
  UpdateBudgetParams,
  CreateContoParams,
  UpdateContoParams,
  DeleteContoParams,
  ImportStatementParams,
  ImportStatementResponse,
  ContoFilters,
  GetMonthExpensesParams,
  Institution,
  StartBankAuthParams,
  BankAuthLink,
  ConfirmBankSessionParams,
  BankSessionResult,
  DisconnectBankParams,
} from "./interfaces";
import { RootState } from "../../store/store";

export const getCurrentMonthExpenses = createAsyncThunk<
  MonthlyBudgetResponse,
  GetMonthExpensesParams | undefined
>("conti/getCurrentMonthExpenses", async (params = {}, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.include_future_recurring !== undefined) {
      queryParams.append(
        "include_future_recurring",
        params.include_future_recurring.toString(),
      );
    }

    const response = await api.get<MonthlyBudgetResponse>(
      `/conti/currentMonthExpenses${queryParams.toString() ? "?" + queryParams.toString() : ""}`,
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(
      err.response?.data || "Errore ricezione spese mensili",
    );
  }
});

export const updateBudget = createAsyncThunk<
  MonthlyBudgetResponse,
  UpdateBudgetParams
>("conti/monthlyBudget", async (params, { rejectWithValue }) => {
  try {
    const response = await api.put<MonthlyBudgetResponse>(`/monthlyBudget`, {
      total_budget: params.total_budget,
    });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(err.response?.data || "Errore modifica budget");
  }
});

export const getCurrentMonthExpensesByCategory = createAsyncThunk<
  ExpenseByCategory[],
  void
>("conti/getExpensesByCategory", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<ExpenseByCategory[]>(
      `/conti/expensesByCategory`,
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(
      err.response?.data || "Errore ricezione spese per categoria",
    );
  }
});

export const getConti = createAsyncThunk<Conto[], undefined>(
  "conti/getConti", // Nome più descrittivo
  async (_, { getState, rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      const state = getState() as RootState;
      const filters = state.conto.filters;

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            // Gestione corretta delle LISTE per FastAPI
            value.forEach((v) => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await api.get<Conto[]>(`/conti?${params.toString()}`);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data || "Errore ricezione conti");
    }
  },
);

export const createConto = createAsyncThunk<Conto, CreateContoParams>(
  "conti/createConto",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.post<Conto>(`/conti`, params);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || "Errore creazione conto");
    }
  },
);

export const updateConto = createAsyncThunk<Conto, UpdateContoParams>(
  "conti/updateConto",
  async (params, { rejectWithValue }) => {
    try {
      const { id, ...body } = params;
      const response = await api.put<Conto>(`/conti/${id}`, body);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(
        err.response?.data || "Errore aggiornamento conto",
      );
    }
  },
);

// --- Open Banking: collegamento del conto a una banca tramite Enable Banking ---

// Step 1: elenco delle banche (ASPSP) selezionabili (per mostrare loghi/nomi).
export const getInstitutions = createAsyncThunk<Institution[], string | undefined>(
  "openBanking/getInstitutions",
  async (country = "IT", { rejectWithValue }) => {
    try {
      const response = await api.get<Institution[]>(
        `/open-banking/institutions?country=${country}`,
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(
        err.response?.data || "Errore ricezione lista banche",
      );
    }
  },
);

// Step 2: avvia l'autorizzazione e restituisce l'URL verso la banca.
export const startBankAuth = createAsyncThunk<BankAuthLink, StartBankAuthParams>(
  "openBanking/startAuth",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.post<BankAuthLink>(`/open-banking/auth`, {
        conto_id: Number(params.conto_id),
        aspsp_name: params.aspsp_name,
        aspsp_country: params.aspsp_country,
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(
        err.response?.data || "Errore avvio collegamento bancario",
      );
    }
  },
);

// Step 5/6: la stretta di mano finale (scambia code + state per una sessione).
export const confirmBankSession = createAsyncThunk<
  BankSessionResult,
  ConfirmBankSessionParams
>("openBanking/confirmSession", async (params, { rejectWithValue }) => {
  try {
    const response = await api.post<BankSessionResult>(
      `/open-banking/sessions`,
      { state: params.state, code: params.code },
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(
      err.response?.data || "Errore conferma collegamento bancario",
    );
  }
});

// Scollega il conto dalla banca; ritorna il conto aggiornato (senza connettore).
export const disconnectBank = createAsyncThunk<Conto, DisconnectBankParams>(
  "openBanking/disconnect",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.delete<Conto>(
        `/open-banking/link/${params.conto_id}`,
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(
        err.response?.data || "Errore scollegamento bancario",
      );
    }
  },
);

export const deleteConto = createAsyncThunk<string, DeleteContoParams>(
  "conti/deleteConto",
  async (params, { rejectWithValue }) => {
    try {
      await api.delete<void>(`/conti/${params.id}`);
      return params.id;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || "Errore eliminazione conto");
    }
  },
);

// Importa un estratto conto (PDF, Excel o CSV): il BE ne estrae i movimenti e
// crea proposte PENDING, come una sincronizzazione bancaria. Ritorna gli esiti.
export const importStatement = createAsyncThunk<
  ImportStatementResponse,
  ImportStatementParams
>("conti/importStatement", async (params, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("file", params.file);
    if (params.data_da) formData.append("data_da", params.data_da);
    if (params.data_a) formData.append("data_a", params.data_a);
    if (params.balance_column) formData.append("balance_column", "true");

    const response = await api.post<ImportStatementResponse>(
      `/conti/${params.conto_id}/bank-connector/import-statement`,
      formData,
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(
      err.response?.data || "Errore import estratto conto",
    );
  }
});
