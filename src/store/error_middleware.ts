import { Middleware } from "@reduxjs/toolkit";
import { showError } from "../features/error/error_slice";
import { setLogout } from "../features/profile/profile_slice";

export const errorMiddleware: Middleware =
  (store) => (next) => (action: any) => {
    if (action.type?.endsWith("/rejected")) {
      const status =
        action.payload?.status ||
        (action.error?.message?.includes("401") ? 401 : null);

      if (status === 401) {
        store.dispatch(setLogout());
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
          title: status ? `Errore ${status}` : "Attenzione",
          message: formattedMessage,
        }),
      );
    }

    return next(action);
  };
