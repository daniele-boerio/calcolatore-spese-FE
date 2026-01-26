import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const getLastTransactions = createAsyncThunk(
  "transazioni/getLastTransactions",
  async (n, { rejectWithValue }) => {
    try {
      // Non serve passare gli headers, lo fa l'interceptor!
      const response = await api.get("/transazioni", { params: { n } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getTransactionsPaginated = createAsyncThunk(
  "transazioni/getTransactionsPaginated",
  async ({ page, size }, { rejectWithValue }) => {
    try {
      // Non serve passare gli headers, lo fa l'interceptor!
      const response = await api.get(`/transazioni/paginated`, {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);
