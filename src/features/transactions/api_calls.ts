import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { AxiosError } from "axios";
import {
  Transaction,
  PaginatedResponse,
  PaginationParams,
  CreateTransactionParams,
  UpdateTransactionParams,
  DeleteTransactionParams,
  LastTransactionsParams,
} from "./interfaces";
import { RootState } from "../../store/store";
import {
  getCurrentMonthExpenses,
  getCurrentMonthExpensesByCategory,
  getConti,
} from "../conti/api_calls";

// Parametri per la paginazione

export const getLastTransactions = createAsyncThunk<
  Transaction[],
  LastTransactionsParams
>(
  "transazioni/getLastTransactions",
  async ({ n }, { getState, rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      // Aggiungiamo n ai parametri
      params.append("n", n.toString());

      const state = getState() as RootState;
      const filters = state.transaction.filters;

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      // Passiamo i parametri SOLO nell'URL tramite la stringa generata
      const response = await api.get<Transaction[]>(
        `/transazioni?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(
        err.response?.data || "Errore ricezione ultime transazioni",
      );
    }
  },
);

export const getTransactionsPaginated = createAsyncThunk<
  PaginatedResponse,
  PaginationParams
>(
  "transazioni/getTransactionsPaginated",
  async ({ page, size }, { getState, rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      // Aggiungiamo i parametri di paginazione
      params.append("page", page.toString());
      params.append("size", size.toString());

      const state = getState() as RootState;
      const filters = state.transaction.filters;

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await api.get<PaginatedResponse>(
        `/transazioni/paginated?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(
        err.response?.data || "Errore ricezione transazioni paginate",
      );
    }
  },
);

export const getTransactionsByCategory = createAsyncThunk<
  Transaction[],
  {
    categoria_id?: string | null;
    sottocategoria_id?: string | null;
    data_inizio?: string;
    data_fine?: string;
    tipo?: string;
  }
>(
  "transazioni/getTransactionsByCategory",
  async (
    { categoria_id, sottocategoria_id, data_inizio, data_fine, tipo },
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();
      if (categoria_id) params.append("categoria_id", categoria_id);
      if (sottocategoria_id)
        params.append("sottocategoria_id", sottocategoria_id);
      if (data_inizio) params.append("data_inizio", data_inizio);
      if (data_fine) params.append("data_fine", data_fine);
      if (tipo) params.append("tipo", tipo);

      const response = await api.get<Transaction[]>(
        `/transazioni/?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(
        err.response?.data || "Errore ricezione transazioni per categoria",
      );
    }
  },
);

export const createTransaction = createAsyncThunk<
  Transaction, // Tipo restituito dal thunk
  CreateTransactionParams, // Tipo dei parametri in ingresso
  { state: RootState } // Dichiariamo che vogliamo accedere al RootState
>(
  "transazioni/createTransazione",
  async (params, { getState, dispatch, rejectWithValue }) => {
    try {
      // 1. Facciamo la chiamata API standard
      const response = await api.post<Transaction>(`/transazioni`, params);
      const newTx = response.data;

      // 2. Accediamo allo stato globale dell'app tramite getState()
      const state = getState();

      // 3. Troviamo la categoria corrispondente nello slice delle categorie
      // Usiamo String() per sicurezza, nel caso ci siano discrepanze tra string e number
      const categoriaTrovata = state.categoria.categorie.find(
        (c) => String(c.id) === String(newTx.categoria_id),
      );

      const enrichedTx = {
        ...newTx,
        categoria: {
          id: newTx.categoria_id,
          nome: categoriaTrovata ? categoriaTrovata.nome : "Uncategorized",
        },
      } as Transaction;

      // Aggiorniamo i dati del budget e del grafico dopo la creazione
      await dispatch(getCurrentMonthExpenses());
      await dispatch(getCurrentMonthExpensesByCategory());

      return enrichedTx;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(
        err.response?.data || "Errore creazione transazione",
      );
    }
  },
);

export const updateTransaction = createAsyncThunk<
  Transaction,
  UpdateTransactionParams
>(
  "transazioni/updateTransazione",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      // Estraiamo l'id e raccogliamo tutto il resto in 'body'
      const { id, ...body } = params;

      const response = await api.put<Transaction>(`/transazioni/${id}`, body);

      await dispatch(getCurrentMonthExpenses());
      await dispatch(getCurrentMonthExpensesByCategory());

      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || "Errore update transazione");
    }
  },
);

export const deleteTransaction = createAsyncThunk<
  string,
  DeleteTransactionParams
>(
  "transazioni/deleteTransaction",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      await api.delete<void>(`/transazioni/${params.id}`);

      await dispatch(getCurrentMonthExpenses());
      await dispatch(getCurrentMonthExpensesByCategory());

      return params.id;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(
        err.response?.data || "Errore eliminazione transazione",
      );
    }
  },
);

export const splitTransaction = createAsyncThunk<
  { sourceId: string; parts: Transaction[] },
  {
    id: string;
    parts: Array<{
      importo: number | string;
      categoria_id?: string | null;
      sottocategoria_id?: string | null;
      tag_id?: string | null;
      descrizione?: string | null;
      debito_id?: number | null;
    }>;
  },
  { state: RootState }
>(
  "transazioni/splitTransazione",
  async ({ id, parts }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post<Transaction[]>(
        `/transazioni/${id}/split`,
        { parts },
      );

      // Refresh key data
      await dispatch(getConti());
      await dispatch(getCurrentMonthExpenses());
      await dispatch(getCurrentMonthExpensesByCategory());

      return { sourceId: id, parts: response.data };
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || "Errore split transazione");
    }
  },
);
