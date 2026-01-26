import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { AxiosError } from "axios";
import { Transaction, PaginatedResponse, PaginationParams } from "./interfaces";

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
