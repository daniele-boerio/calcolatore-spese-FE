import { createSlice } from "@reduxjs/toolkit";
import {
  createCategoria,
  createSottoCategoria,
  deleteCategoria,
  deleteSottoCategoria,
  getCategorie,
  updateCategoria,
  updateSottoCategoria,
} from "./apiCalls";

const handlePending = (state) => {
  state.loading = true;
};

const handleRejected = (state) => {
  state.loading = false;
};

const categorieSlice = createSlice({
  name: "categorie",
  initialState: {
    loading: false,
    categorie: [],
    selectedCategoria: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getCategorie
      .addCase(getCategorie.fulfilled, (state, action) => {
        state.loading = false;
        state.categorie = action.payload;
      })

      // createCategoria
      .addCase(createCategoria.fulfilled, (state, action) => {
        state.loading = false;
        // Inizializziamo sempre le sottocategorie come array vuoto se mancano
        const newCat = { ...action.payload, sottocategorie: [] };
        state.categorie.push(newCat);
      })

      // updateCategoria
      .addCase(updateCategoria.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categorie.findIndex(
          (cat) => cat.id === action.payload.id,
        );
        if (index !== -1) {
          // Mantieni le sottocategorie esistenti se l'update non le include
          state.categorie[index] = {
            ...state.categorie[index],
            ...action.payload,
          };
        }
      })

      // deleteCategoria
      .addCase(deleteCategoria.fulfilled, (state, action) => {
        state.loading = false;
        state.categorie = state.categorie.filter(
          (cat) => cat.id !== action.payload,
        );
      })

      // createSottoCategoria
      .addCase(createSottoCategoria.fulfilled, (state, action) => {
        state.loading = false;
        const newSub = action.payload;
        const categoria = state.categorie.find(
          (cat) => cat.id === newSub.categoria_id,
        );
        if (categoria) {
          if (!categoria.sottocategorie) categoria.sottocategorie = [];
          categoria.sottocategorie.push(newSub);
        }
      })

      // updateSottoCategoria
      .addCase(updateSottoCategoria.fulfilled, (state, action) => {
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
      })

      // deleteSottoCategoria
      .addCase(deleteSottoCategoria.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload qui deve essere un oggetto { subId, catId } inviato dalla apiCall
        const { catId, subId } = action.payload;
        const categoria = state.categorie.find((cat) => cat.id === catId);
        if (categoria && categoria.sottocategorie) {
          categoria.sottocategorie = categoria.sottocategorie.filter(
            (sub) => sub.id !== subId,
          );
        }
      })

      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") && action.type.includes("categorie"),
        handlePending,
      )
      // Gestisci TUTTI i REJECTED di questo slice
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") &&
          action.type.includes("categorie"),
        handleRejected,
      );
  },
});

export default categorieSlice.reducer;
