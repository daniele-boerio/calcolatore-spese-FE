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
import { Categoria, CategorieState, SottoCategoria } from "./interfaces";

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
          state.loading = false;
          state.categorie = action.payload;
        },
      )

      // createCategoria
      .addCase(
        createCategoria.fulfilled,
        (state, action: PayloadAction<Categoria>) => {
          state.loading = false;
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
          state.loading = false;
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
          state.loading = false;
          state.categorie = state.categorie.filter(
            (cat) => cat.id !== action.payload,
          );
        },
      )

      // createSottoCategorie
      .addCase(
        createSottoCategorie.fulfilled,
        (state, action: PayloadAction<SottoCategoria[]>) => {
          state.loading = false;
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
          state.loading = false;
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
        (state, action: PayloadAction<{ catId: string; subId: string }>) => {
          state.loading = false;
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

export default categorieSlice.reducer;
