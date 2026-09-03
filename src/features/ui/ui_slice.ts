import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
import { ActiveSheet, UiState } from "./interfaces";
import { persistTheme, readStoredTheme, ThemePreference } from "./theme";

const HIDE_AMOUNTS_STORAGE_KEY = "hideAmounts";

const initialState: UiState = {
  theme: readStoredTheme(),
  hideAmounts: localStorage.getItem(HIDE_AMOUNTS_STORAGE_KEY) === "true",
  sheet: null,
};

// Preferenze locali e navigazione modale, senza controparte sul BE: la
// persistenza sta nel reducer come già fa profile_slice con token e username.
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemePreference>) => {
      state.theme = action.payload;
      persistTheme(action.payload);
    },
    setHideAmounts: (state, action: PayloadAction<boolean>) => {
      state.hideAmounts = action.payload;
      localStorage.setItem(HIDE_AMOUNTS_STORAGE_KEY, String(action.payload));
    },
    toggleHideAmounts: (state) => {
      state.hideAmounts = !state.hideAmounts;
      localStorage.setItem(HIDE_AMOUNTS_STORAGE_KEY, String(state.hideAmounts));
    },
    openSheet: (state, action: PayloadAction<ActiveSheet>) => {
      state.sheet = action.payload;
    },
    closeSheet: (state) => {
      state.sheet = null;
    },
  },
});

export const {
  setTheme,
  setHideAmounts,
  toggleHideAmounts,
  openSheet,
  closeSheet,
} = uiSlice.actions;

export const selectTheme = (state: RootState) => state.ui.theme;

export const selectHideAmounts = (state: RootState) => state.ui.hideAmounts;

export const selectActiveSheet = (state: RootState) => state.ui.sheet;

export default uiSlice.reducer;
