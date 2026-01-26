// store/errorSlice.js
import { createSlice } from "@reduxjs/toolkit";

const errorSlice = createSlice({
  name: "error",
  initialState: { isOpen: false, message: "", title: "" },
  reducers: {
    showError: (state, action) => {
      state.isOpen = true;
      state.message =
        action.payload.message || "Si è verificato un errore imprevisto.";
      state.title = action.payload.title || "Errore";
    },
    hideError: (state) => {
      state.isOpen = false;
      state.message = "";
    },
  },
});

export const { showError, hideError } = errorSlice.actions;
export default errorSlice.reducer;
