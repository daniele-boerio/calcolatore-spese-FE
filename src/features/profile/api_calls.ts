import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { AxiosError } from "axios";
import { AuthResponse, LoginParams, RegisterParams } from "./interfaces";

export const login = createAsyncThunk<AuthResponse, LoginParams>(
  "profile/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      // Specifichiamo che la risposta è di tipo AuthResponse
      const response = await api.post<AuthResponse>(`/login`, formData);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      console.log("Errore durante il login: ", err);
      return rejectWithValue(err.response?.data || "Errore durante il login");
    }
  },
);

export const register = createAsyncThunk<AuthResponse, RegisterParams>(
  "profile/register",
  async ({ email, username, password }, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>(`/register`, {
        email,
        username,
        password,
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      console.log("Errore durante la registrazione: ", err);
      return rejectWithValue(
        err.response?.data || "Errore durante la registrazione",
      );
    }
  },
);
