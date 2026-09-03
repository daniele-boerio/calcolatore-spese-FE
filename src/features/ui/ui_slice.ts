import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
import { UiState } from "./interfaces";
import { persistTheme, readStoredTheme, ThemePreference } from "./theme";

const HIDE_AMOUNTS_STORAGE_KEY = "hideAmounts";

const initialState: UiState = {
  theme: readStoredTheme(),
  hideAmounts: localStorage.getItem(HIDE_AMOUNTS_STORAGE_KEY) === "true",
};

// Preferenze locali, senza controparte sul BE: la persistenza sta nel reducer
// come già fa profile_slice con token e username.
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
  },
});

export const { setTheme, setHideAmounts, toggleHideAmounts } = uiSlice.actions;

export const selectTheme = (state: RootState) => state.ui.theme;

export const selectHideAmounts = (state: RootState) => state.ui.hideAmounts;

export default uiSlice.reducer;
