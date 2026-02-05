import { Middleware } from "@reduxjs/toolkit";
import { showError } from "../features/error/error_slice";

export const errorMiddleware: Middleware =
  (store) => (next) => (action: any) => {
    if (action.type?.endsWith("/rejected")) {
      if (
        action.payload?.status === 401 ||
        action.error?.message?.includes("401")
      ) {
        return next(action);
      }

      // 2. Estrazione del messaggio d'errore
      const message =
        action.payload?.detail ||
        (typeof action.payload === "string" ? action.payload : null) ||
        action.error?.message ||
        "Errore di connessione al server";

      const formattedMessage =
        typeof message === "string" ? message : JSON.stringify(message);

      // 3. Dispatch della Dialog di errore
      store.dispatch(
        showError({
          title: action.payload?.status
            ? `Errore ${action.payload.status}`
            : "Attenzione",
          message: formattedMessage,
        }),
      );
    }

    return next(action);
  };
