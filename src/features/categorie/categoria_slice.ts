import { createSlice, PayloadAction, Action } from "@reduxjs/toolkit";
import {
  createCategoria,
  createSottoCategorie,
  deleteCategoria,
  deleteSottoCategoria,
  getCategorie,
  updateCategoria,
  updateSottoCategoria,
} from "./api_calls";
import {
  Categoria,
  CategorieState,
  DeleteSottoCategoriaResponse,
  SottoCategoria,
} from "./interfaces";
import { RootState } from "../../store/store";

const initialState: CategorieState = {
  loading: false,
  categorie: [],
  selectedCategoria: null,
  selectedSottoCategoria: null,
};

// Helper per i matcher
const handlePending = (state: CategorieState) => {
  state.loading = true;
};

const handleRejected = (state: CategorieState) => {
  state.loading = false;
};

const categorieSlice = createSlice({
  name: "categorie",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getCategorie
      .addCase(
        getCategorie.fulfilled,
        (state, action: PayloadAction<Categoria[]>) => {
          state.categorie = action.payload;
        },
      )

      // createCategoria
      .addCase(
        createCategoria.fulfilled,
        (state, action: PayloadAction<Categoria>) => {
          const newCat = {
            ...action.payload,
            sottocategorie: action.payload.sottocategorie || [],
          };
          state.categorie.push(newCat);
        },
      )

      // updateCategoria
      .addCase(
        updateCategoria.fulfilled,
        (state, action: PayloadAction<Categoria>) => {
          const index = state.categorie.findIndex(
            (cat) => cat.id === action.payload.id,
          );
          if (index !== -1) {
            state.categorie[index] = {
              ...state.categorie[index],
              ...action.payload,
            };
          }
        },
      )

      // deleteCategoria
      .addCase(
        deleteCategoria.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.categorie = state.categorie.filter(
            (cat) => cat.id !== action.payload,
          );
        },
      )

      // createSottoCategorie
      .addCase(
        createSottoCategorie.fulfilled,
        (state, action: PayloadAction<SottoCategoria[]>) => {
          const newSub = action.payload;
          const categoria = state.categorie.find(
            (cat) => cat.id === newSub[0].categoria_id,
          );
          if (categoria) {
            if (!categoria.sottocategorie) categoria.sottocategorie = [];
            categoria.sottocategorie.push(...newSub);
          }
        },
      )

      // updateSottoCategoria
      .addCase(
        updateSottoCategoria.fulfilled,
        (state, action: PayloadAction<SottoCategoria>) => {
          const updatedSub = action.payload;
          const categoria = state.categorie.find(
            (cat) => cat.id === updatedSub.categoria_id,
          );
          if (categoria && categoria.sottocategorie) {
            const subIndex = categoria.sottocategorie.findIndex(
              (sub) => sub.id === updatedSub.id,
            );
            if (subIndex !== -1) {
              categoria.sottocategorie[subIndex] = updatedSub;
            }
          }
        },
      )

      // deleteSottoCategoria
      .addCase(
        deleteSottoCategoria.fulfilled,
        (state, action: PayloadAction<DeleteSottoCategoriaResponse>) => {
          const { catId, subId } = action.payload;
          const categoria = state.categorie.find((cat) => cat.id === catId);
          if (categoria && categoria.sottocategorie) {
            categoria.sottocategorie = categoria.sottocategorie.filter(
              (sub) => sub.id !== subId,
            );
          }
        },
      )

      // Matchers per caricamento ed errori
      .addMatcher(
        (action: Action) =>
          action.type.endsWith("/pending") &&
          action.type.startsWith("categorie/"),
        handlePending,
      )
      .addMatcher(
        (action: Action) =>
          (action.type.endsWith("/rejected") ||
            action.type.endsWith("/fulfilled")) &&
          action.type.startsWith("categorie/"),
        handleRejected,
      );
  },
});

export const selectCategoriaLoading = (state: RootState) =>
  state.categoria.loading;
export const selectCategoriaCategorie = (state: RootState) =>
  state.categoria.categorie;
export const selectCategoriaSelectedCategoria = (state: RootState) =>
  state.categoria.selectedCategoria;
export const selectCategoriaSelectedSottoCategoria = (state: RootState) =>
  state.categoria.selectedSottoCategoria;
export const selectCategoriaSottocategorie = (state: RootState) =>
  state.categoria.categorie.flatMap((cat) => cat.sottocategorie);

export default categorieSlice.reducer;
