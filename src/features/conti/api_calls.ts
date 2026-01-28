import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { AxiosError } from "axios";
import {
  Conto,
  MonthlyBudgetResponse,
  ExpenseByCategory,
  UpdateBudgetParams,
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
>("conti/monthlyBudget", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.put<MonthlyBudgetResponse>(`/monthlyBudget`, {
      totalBudget: payload.totalBudget,
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
