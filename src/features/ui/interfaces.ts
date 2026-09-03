import type { ThemePreference } from "./theme";

/**
 * Navigazione modale: quale sheet è aperto e con quale payload. Unione
 * discriminata invece di un booleano per dialog — cresce con un caso per ogni
 * sheet del design.
 */
export type ActiveSheet = { name: "newTransaction" };

export interface UiState {
  /** Preferenza di tema dell'utente, persistita in localStorage. */
  theme: ThemePreference;
  /** Nasconde ogni cifra dietro a "••••" mantenendo la larghezza. */
  hideAmounts: boolean;
  /** Sheet attualmente aperto, `null` se nessuno. */
  sheet: ActiveSheet | null;
}
