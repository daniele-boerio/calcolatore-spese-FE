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

export const createTransaction = createAsyncThunk<
  Transaction,
  CreateTransactionParams
>("transazioni/createTransazione", async (params, { rejectWithValue }) => {
  try {
    const response = await api.post<Transaction>(`/transazioni`, params);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(
      err.response?.data || "Errore creazione transazione",
    );
  }
});

export const updateTransaction = createAsyncThunk<
  Transaction,
  UpdateTransactionParams
>("transazioni/updateTransazione", async (params, { rejectWithValue }) => {
  try {
    // Estraiamo l'id e raccogliamo tutto il resto in 'body'
    const { id, ...body } = params;

    const response = await api.put<Transaction>(`/transazioni/${id}`, body);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(err.response?.data || "Errore update transazione");
  }
});

export const deleteTransaction = createAsyncThunk<
  string,
  DeleteTransactionParams
>("transazioni/deleteTransaction", async (params, { rejectWithValue }) => {
  try {
    await api.delete<void>(`/transazioni/${params.id}`);
    return params.id;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(
      err.response?.data || "Errore eliminazione transazione",
    );
  }
});
