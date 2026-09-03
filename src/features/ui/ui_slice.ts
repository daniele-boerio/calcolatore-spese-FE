import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../store/store";
import { ActiveSheet, UiState } from "./interfaces";
import {
  forgetToastAction,
  registerToastAction,
  runToastAction,
  ToastItem,
  ToastVariant,
} from "./toast";
import { persistTheme, readStoredTheme, ThemePreference } from "./theme";

const HIDE_AMOUNTS_STORAGE_KEY = "hideAmounts";

// L'undo di un'eliminazione resta a disposizione cinque secondi.
const DEFAULT_TOAST_DURATION = 5000;

const initialState: UiState = {
  theme: readStoredTheme(),
  hideAmounts: localStorage.getItem(HIDE_AMOUNTS_STORAGE_KEY) === "true",
  sheet: null,
  toasts: [],
};

// Preferenze locali, navigazione modale e feedback: stato di sola interfaccia,
// senza controparte sul BE. La persistenza sta nel reducer come già fa
// profile_slice con token e username.
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
    pushToast: (state, action: PayloadAction<ToastItem>) => {
      state.toasts.push(action.payload);
    },
    dismissToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload,
      );
    },
  },
});

export const {
  setTheme,
  setHideAmounts,
  toggleHideAmounts,
  openSheet,
  closeSheet,
  pushToast,
  dismissToast,
} = uiSlice.actions;

export interface ShowToastOptions {
  variant: ToastVariant;
  title: string;
  meta?: string;
  /** Etichetta e callback dell'azione ("Annulla", "Riprova"). */
  action?: { label: string; onPress: () => void };
  duration?: number;
}

/**
 * Mostra un toast. La callback dell'azione non entra nello store — non è
 * serializzabile: viene registrata a parte e ritrovata per id.
 */
export const showToast =
  (options: ShowToastOptions) =>
  (dispatch: AppDispatch): string => {
    const id = nanoid();

    if (options.action) registerToastAction(id, options.action.onPress);

    dispatch(
      pushToast({
        id,
        variant: options.variant,
        title: options.title,
        meta: options.meta,
        actionLabel: options.action?.label,
        duration: options.duration ?? DEFAULT_TOAST_DURATION,
      }),
    );

    return id;
  };

/** Esegue l'azione del toast e lo chiude. */
export const triggerToastAction =
  (id: string) =>
  (dispatch: AppDispatch): void => {
    runToastAction(id);
    dispatch(dismissToast(id));
  };

/** Chiude un toast senza eseguirne l'azione (scadenza o tap sulla X). */
export const closeToast =
  (id: string) =>
  (dispatch: AppDispatch): void => {
    forgetToastAction(id);
    dispatch(dismissToast(id));
  };

export const selectTheme = (state: RootState) => state.ui.theme;

export const selectHideAmounts = (state: RootState) => state.ui.hideAmounts;

export const selectActiveSheet = (state: RootState) => state.ui.sheet;

export const selectToasts = (state: RootState) => state.ui.toasts;

export default uiSlice.reducer;
