import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { AxiosError } from "axios";
import {
  Recurring,
  CreateRecurringParams,
  UpdateRecurringParams,
  DeleteRecurringParams,
} from "./interfaces";

export const getRecurrings = createAsyncThunk<Recurring[], void>(
  "recurring/getRecurrings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Recurring[]>(`/ricorrenze`);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(
        err.response?.data || "Errore ricezione ricorrenze",
      );
    }
  },
);

export const createRecurring = createAsyncThunk<
  Recurring,
  CreateRecurringParams
>("recurring/createRecurring", async (params, { rejectWithValue }) => {
  try {
    const response = await api.post<Recurring>(`/ricorrenze`, params);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(err.response?.data || "Errore creazione ricorrenze");
  }
});

export const updateRecurring = createAsyncThunk<
  Recurring,
  UpdateRecurringParams
>("recurring/updateRecurring", async (params, { rejectWithValue }) => {
  try {
    // Estraiamo l'id e raccogliamo tutto il resto in 'body'
    const { id, ...body } = params;

    const response = await api.post<Recurring>(`/ricorrenze/${id}`, body);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(err.response?.data || "Errore update ricorrenze");
  }
});

export const deleteRecurring = createAsyncThunk<string, DeleteRecurringParams>(
  "recurring/deleteRecurring",
  async (params, { rejectWithValue }) => {
    try {
      await api.delete<void>(`/ricorrenze/${params.id}`);
      return params.id;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(
        err.response?.data || "Errore eliminazione ricorrenze",
      );
    }
  },
);
