import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ErrorPayload, ErrorState } from "./interfaces";

const initialState: ErrorState = {
  isOpen: false,
  message: "",
  title: "",
};

const errorSlice = createSlice({
  name: "error",
  initialState,
  reducers: {
    // Utilizziamo PayloadAction per tipizzare l'azione in ingresso
    showError: (state, action: PayloadAction<ErrorPayload>) => {
      state.isOpen = true;
      state.message =
        action.payload.message || "Si è verificato un errore imprevisto.";
      state.title = action.payload.title || "Errore";
    },
    hideError: (state) => {
      state.isOpen = false;
      state.message = "";
      state.title = ""; // Reset del titolo per pulizia
    },
  },
});

export const { showError, hideError } = errorSlice.actions;
export default errorSlice.reducer;
