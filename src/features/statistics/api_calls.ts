import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { AxiosError } from "axios";
import {
  FetchYearStatisticsParams,
  FetchMonthStatisticsParams,
  YearDetailsStatRow,
  MonthlyDetailResponse,
} from "./interfaces";

// --- API CALLS ---

export const getYearDetailsStatistics = createAsyncThunk<
  YearDetailsStatRow[],
  FetchYearStatisticsParams
>("statistics/yearDetails", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get<{ data: YearDetailsStatRow[] }>(
      "/statistics/yearDetails",
      {
        params: {
          year: params.year,
          categoria_id: params.categoria_id || undefined,
          tag_id: params.tag_id || undefined,
        },
      },
    );
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(
      err.response?.data || "Errore nel caricamento statistiche",
    );
  }
});

export const getMonthlyDetailsStatistics = createAsyncThunk<
  MonthlyDetailResponse,
  FetchMonthStatisticsParams
>("statistics/monthDetails", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get<MonthlyDetailResponse>(
      "/statistics/monthDetails",
      {
        params: {
          month: params.month,
          year: params.year,
          categoria_id: params.categoria_id || undefined,
          tag_id: params.tag_id || undefined,
        },
      },
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(
      err.response?.data || "Errore nel caricamento statistiche",
    );
  }
});
