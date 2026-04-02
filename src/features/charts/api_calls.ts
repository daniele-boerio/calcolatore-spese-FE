import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { AxiosError } from "axios";
import {
  CategoryTrendOut,
  ExpenseCompositionOut,
  GetCategoryTrendParams,
  GetExpenseCompositionParams,
  GetIncomeExpenseParams,
  GetSavingsParams,
  MonthlyIncomeExpenseOut,
  MonthlySavingsOut,
} from "./interfaces";

// --- API CALLS ---

export const getIncomeExpenseChart = createAsyncThunk<
  MonthlyIncomeExpenseOut[],
  GetIncomeExpenseParams
>("charts/getIncomeExpenseChart", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get<MonthlyIncomeExpenseOut[]>(
      "/charts/income-expense",
      {
        params: {
          data_inizio: params.data_inizio,
          data_fine: params.data_fine,
        },
      },
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(err.response?.data || "Errore dati entrate/uscite");
  }
});

export const getSavingsChart = createAsyncThunk<
  MonthlySavingsOut[],
  GetSavingsParams
>("charts/getSavingsChart", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get<MonthlySavingsOut[]>("/charts/savings", {
      params: {
        data_inizio: params.data_inizio,
        data_fine: params.data_fine,
      },
    });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(err.response?.data || "Errore dati risparmi");
  }
});

export const getExpenseCompositionChart = createAsyncThunk<
  ExpenseCompositionOut[],
  GetExpenseCompositionParams
>("charts/getExpenseCompositionChart", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get<ExpenseCompositionOut[]>(
      "/charts/expense-composition",
      {
        params: {
          data_inizio: params.data_inizio,
          data_fine: params.data_fine,
        },
      },
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(err.response?.data || "Errore composizione spese");
  }
});

export const getCategoryTrendChart = createAsyncThunk<
  CategoryTrendOut[],
  GetCategoryTrendParams
>("charts/getCategoryTrendChart", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get<CategoryTrendOut[]>(
      "/charts/category-trend",
      {
        params: {
          categoria_id: params.categoria_id,
          data_inizio: params.data_inizio,
          data_fine: params.data_fine,
        },
      },
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(err.response?.data || "Errore trend categoria");
  }
});
