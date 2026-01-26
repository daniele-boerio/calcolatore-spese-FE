import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const login = createAsyncThunk(
  "profile/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await api.post(`/login`, formData);
      return response.data;
    } catch (error) {
      // Gestisce l'errore restituendo il messaggio dal server o uno generico
      console.log("Errore durante il login: ", error);
      return rejectWithValue(error.response?.data || "Errore durante il login");
    }
  },
);

export const register = createAsyncThunk(
  "profile/register",
  async ({ email, username, password }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/register`, {
        email,
        username,
        password,
      });
      return response.data;
    } catch (error) {
      // Gestisce l'errore restituendo il messaggio dal server o uno generico
      console.log("Errore durante la registrazione: ", error);
      return rejectWithValue(
        error.response?.data || "Errore durante la registrazione",
      );
    }
  },
);
