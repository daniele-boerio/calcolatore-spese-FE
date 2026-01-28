import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { AxiosError } from "axios";
import {
  Categoria,
  CreateCategoriaParams,
  CreateSottoCategoriaParams,
  DeleteCategoriaParams,
  DeleteSottoCategoriaParams,
  SottoCategoria,
  UpdateCategoriaParams,
  UpdateSottoCategoriaParams,
} from "./interfaces";

// --- API CALLS ---

// Recupero Categorie
export const getCategorie = createAsyncThunk<Categoria[], void>(
  "categorie/getCategoria",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Categoria[]>(`/categorie`);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(
        err.response?.data || "Errore durante la ricezione delle categorie",
      );
    }
  },
);

// Creazione Categoria
export const createCategoria = createAsyncThunk<
  Categoria,
  CreateCategoriaParams
>(
  "categorie/createCategoria",
  async ({ nome, sottocategorie }, { rejectWithValue }) => {
    try {
      const response = await api.post<Categoria>(`/categorie`, {
        nome,
        sottocategorie,
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(
        err.response?.data || "Errore durante la creazione",
      );
    }
  },
);

// Aggiornamento Categoria
export const updateCategoria = createAsyncThunk<
  Categoria,
  UpdateCategoriaParams
>("categorie/updateCategoria", async ({ id, nome }, { rejectWithValue }) => {
  try {
    const response = await api.put<Categoria>(`/categorie/${id}`, {
      nome,
    });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(err.response?.data || "Errore durante la modifica");
  }
});

// Eliminazione Categoria
export const deleteCategoria = createAsyncThunk<string, DeleteCategoriaParams>(
  "categorie/deleteCategoria",
  async ({ id }, { rejectWithValue }) => {
    try {
      await api.delete(`/categorie/${id}`);
      return id; // Restituisce l'ID (stringa) eliminato
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(
        err.response?.data || "Errore durante l'eliminazione",
      );
    }
  },
);

// Creazione SottoCategorie
export const createSottoCategorie = createAsyncThunk<
  SottoCategoria[],
  CreateSottoCategoriaParams
>(
  "categorie/createSottoCategoria",
  async ({ id, nomeList }, { rejectWithValue }) => {
    try {
      const response = await api.post<SottoCategoria[]>(
        `/categorie/${id}/sottocategorie`,
        nomeList,
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(
        err.response?.data || "Errore creazione sottocategoria",
      );
    }
  },
);

// Aggiornamento SottoCategoria
export const updateSottoCategoria = createAsyncThunk<
  SottoCategoria,
  UpdateSottoCategoriaParams
>(
  "categorie/updateSottoCategoria",
  async ({ id, nome }, { rejectWithValue }) => {
    try {
      const response = await api.put<SottoCategoria>(`/sottocategorie/${id}`, {
        nome,
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(
        err.response?.data || "Errore modifica sottocategoria",
      );
    }
  },
);

// Eliminazione SottoCategoria
export const deleteSottoCategoria = createAsyncThunk<
  { catId: string; subId: string },
  DeleteSottoCategoriaParams
>(
  "categorie/deleteSottoCategoria",
  async ({ catId, subId }, { rejectWithValue }) => {
    try {
      await api.delete(`/sottocategorie/${subId}`);
      return { catId, subId };
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(
        err.response?.data || "Errore eliminazione sottocategoria",
      );
    }
  },
);
