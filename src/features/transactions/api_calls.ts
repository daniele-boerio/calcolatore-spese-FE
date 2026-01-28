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
  TransactionByTagParams,
} from "./interfaces";

// Parametri per la paginazione

export const getLastTransactions = createAsyncThunk<Transaction[], number>(
  "transazioni/getLastTransactions",
  async (n, { rejectWithValue }) => {
    try {
      const response = await api.get<Transaction[]>("/transazioni", {
        params: { n },
      });
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
  async ({ page, size }, { rejectWithValue }) => {
    try {
      const response = await api.get<PaginatedResponse>(
        `/transazioni/paginated`,
        {
          params: { page, size },
        },
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

    const response = await api.post<Transaction>(`/transazioni/${id}`, body);
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
    await api.delete<string>(`/transazioni/${params.id}`);
    return params.id;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(
      err.response?.data || "Errore eliminazione transazione",
    );
  }
});

export const getTransactionsByTag = createAsyncThunk<
  Transaction[],
  TransactionByTagParams
>("transazioni/getTransactionsByTag", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get<Transaction[]>(
      `/transazioni/tag/${params.tagId}`,
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(
      err.response?.data ||
        `Errore ricezione transazioni per tag ${params.tagId}`,
    );
  }
});
