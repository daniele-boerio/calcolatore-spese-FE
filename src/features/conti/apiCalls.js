import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const getCurrentMonthExpenses = createAsyncThunk(
  "conti/getCurrentMonthExpenses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/conti/currentMonthExpenses`);
      return response.data;
    } catch (error) {
      // Gestisce l'errore restituendo il messaggio dal server o uno generico
      console.log("Errore durante la ricezione delle spese mensili: ", error);
      return rejectWithValue(
        error.response?.data ||
          "Errore durante la ricezione delle spese mensili",
      );
    }
  },
);

export const updateBudget = createAsyncThunk(
  "conti/monthlyBudget",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.put(`/budget/monthlyBudget`, {
        totalBudget: payload.totalBudget,
      });
      return response.data;
    } catch (error) {
      // Gestisce l'errore restituendo il messaggio dal server o uno generico
      console.log("Errore durante la modifica del Monthly Budget: ", error);
      return rejectWithValue(
        error.response?.data || "Errore durante la modifica del Monthly Budget",
      );
    }
  },
);

export const getCurrentMonthExpensesByCategory = createAsyncThunk(
  "conti/getExpensesByCategory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/conti/expensesByCategory`);
      return response.data;
    } catch (error) {
      // Gestisce l'errore restituendo il messaggio dal server o uno generico
      console.log(
        "Errore durante la ricezione delle spese per categoria del mese corrente: ",
        error,
      );
      return rejectWithValue(
        error.response?.data ||
          "Errore durante la ricezione delle spese per categoria del mese corrente",
      );
    }
  },
);

export const getConti = createAsyncThunk(
  "conti/conti",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/conti`);
      return response.data;
    } catch (error) {
      // Gestisce l'errore restituendo il messaggio dal server o uno generico
      console.log("Errore durante la ricezione dei conti: ", error);
      return rejectWithValue(
        error.response?.data || "Errore durante la ricezione dei conti",
      );
    }
  },
);
