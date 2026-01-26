import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// categorie
export const getCategorie = createAsyncThunk(
  "categorie/getCategoria",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/categorie`);
      return response.data;
    } catch (error) {
      // Gestisce l'errore restituendo il messaggio dal server o uno generico
      console.log("Errore durante la ricezione delle categorie: ", error);
      return rejectWithValue(
        error.response?.data || "Errore durante la ricezione delle categorie",
      );
    }
  },
);

export const createCategoria = createAsyncThunk(
  "categorie/createCategoria",
  async ({ nome, sottocategorie }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/categorie`, {
        nome: nome,
        sottocategorie: sottocategorie,
      });
      return response.data;
    } catch (error) {
      // Gestisce l'errore restituendo il messaggio dal server o uno generico
      console.log("Errore durante la creazione della categoria: ", error);
      return rejectWithValue(
        error.response?.data || "Errore durante la creazione della categoria",
      );
    }
  },
);

export const updateCategoria = createAsyncThunk(
  "categorie/updateCategoria",
  async ({ id, nome, sottocategorie }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/categorie/${id}`, {
        nome: nome,
        sottocategorie: sottocategorie,
      });
      return response.data;
    } catch (error) {
      // Gestisce l'errore restituendo il messaggio dal server o uno generico
      console.log("Errore durante la modifica della categoria: ", error);
      return rejectWithValue(
        error.response?.data || "Errore durante la modifica della categoria",
      );
    }
  },
);

export const deleteCategoria = createAsyncThunk(
  "categorie/deleteCategoria",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categorie/${id}`);
      return id;
    } catch (error) {
      // Gestisce l'errore restituendo il messaggio dal server o uno generico
      console.log("Errore durante l'eliminazione della categoria: ", error);
      return rejectWithValue(
        error.response?.data || "Errore durante l'eliminazione della categoria",
      );
    }
  },
);

//sottocategorie

export const createSottoCategoria = createAsyncThunk(
  "categorie/createSottoCategoria",
  async ({ id, nomeList }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/categorie/${id}/sottocategorie`,
        nomeList,
      );
      return response.data;
    } catch (error) {
      // Gestisce l'errore restituendo il messaggio dal server o uno generico
      console.log("Errore durante la creazione della sottocategoria: ", error);
      return rejectWithValue(
        error.response?.data ||
          "Errore durante la creazione della sottocategoria",
      );
    }
  },
);

export const updateSottoCategoria = createAsyncThunk(
  "categorie/updateSottoCategoria",
  async ({ id, nome }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/sottocategorie/${id}`, {
        nome: nome,
      });
      return response.data;
    } catch (error) {
      // Gestisce l'errore restituendo il messaggio dal server o uno generico
      console.log("Errore durante la modifica della sottocategoria: ", error);
      return rejectWithValue(
        error.response?.data ||
          "Errore durante la modifica della sottocategoria",
      );
    }
  },
);

export const deleteSottoCategoria = createAsyncThunk(
  "categorie/deleteSottoCategoria",
  async ({ catId, subId }, { rejectWithValue }) => {
    try {
      await api.delete(`/sottocategorie/${subId}`);
      return { catId, subId };
    } catch (error) {
      // Gestisce l'errore restituendo il messaggio dal server o uno generico
      console.log(
        "Errore durante l'eliminazione della sottocategoria: ",
        error,
      );
      return rejectWithValue(
        error.response?.data ||
          "Errore durante l'eliminazione della sottocategoria",
      );
    }
  },
);
