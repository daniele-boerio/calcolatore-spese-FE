import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { AxiosError } from "axios";
import { FetchStatisticsParams, MonthlyStatRow } from "./interfaces";

// --- API CALLS ---

export const getMonthlyStatistics = createAsyncThunk<
  MonthlyStatRow[],
  FetchStatisticsParams
>("statistics/getMonthly", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get<MonthlyStatRow[]>("/statistics/monthly", {
      params: {
        year: params.year,
        categoria_id: params.categoria_id || undefined,
      },
    });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(
      err.response?.data || "Errore nel caricamento statistiche",
    );
  }
});
