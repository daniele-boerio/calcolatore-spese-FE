import { Middleware } from "@reduxjs/toolkit";
import { showError } from "../features/error/error_slice";

export const errorMiddleware: Middleware =
  (store) => (next) => (action: any) => {
    // Verifichiamo se l'azione è una 'rejected' di un createAsyncThunk
    if (action.type?.endsWith("/rejected")) {
      // Evitiamo di mostrare errori per azioni specifiche se necessario
      // (es. se l'errore è già gestito localmente nel componente)
      const message =
        action.payload?.detail ||
        (typeof action.payload === "string" ? action.payload : null) ||
        action.error?.message ||
        "Errore di connessione al server";

      store.dispatch(
        showError({
          title: "Attenzione",
          message: message,
        }),
      );
    }

    return next(action);
  };
