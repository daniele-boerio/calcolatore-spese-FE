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
} from "./interfaces";

export const getCurrentMonthExpenses = createAsyncThunk<
  MonthlyBudgetResponse,
  void
>("conti/getCurrentMonthExpenses", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<MonthlyBudgetResponse>(
      `/conti/currentMonthExpenses`,
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
      totalBudget: params.totalBudget,
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

export const getConti = createAsyncThunk<Conto[], void>(
  "conti/conti",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Conto[]>(`/conti`);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
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
