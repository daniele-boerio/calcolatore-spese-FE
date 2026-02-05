import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { AxiosError } from "axios";
import {
  AuthResponse,
  LoginParams,
  ProfileResponse,
  RegisterParams,
} from "./interfaces";

export const login = createAsyncThunk<AuthResponse, LoginParams>(
  "profile/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await api.post<AuthResponse>(`/login`, formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Errore sconosciuto");
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
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Errore sconosciuto");
    }
  },
);

export const getProfile = createAsyncThunk<ProfileResponse, void>(
  "profile/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ProfileResponse>("/me");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Errore sconosciuto");
    }
  },
);
