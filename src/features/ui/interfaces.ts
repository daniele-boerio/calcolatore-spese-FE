import type { ThemePreference } from "./theme";

export interface UiState {
  /** Preferenza di tema dell'utente, persistita in localStorage. */
  theme: ThemePreference;
  /** Nasconde ogni cifra dietro a "••••" mantenendo la larghezza. */
  hideAmounts: boolean;
}
