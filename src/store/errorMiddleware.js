// store/errorMiddleware.js
import { showError } from "../features/error/errorSlice";

export const errorMiddleware = (store) => (next) => (action) => {
  // Verifichiamo se l'azione è una 'rejected' di un createAsyncThunk
  if (action.type.endsWith("/rejected")) {
    const message =
      action.payload?.detail ||
      action.payload ||
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
