import { createSlice, PayloadAction, Action } from "@reduxjs/toolkit";
import {
  createRecurring,
  deleteRecurring,
  getRecurrings,
  updateRecurring,
} from "./api_calls";
import { Recurring, RecurringsState } from "./interfaces";
import { RootState } from "../../store/store";

const initialState: RecurringsState = {
  loading: false,
  recurrings: [],
  selectedRecurring: null,
  filters: {
    sort_by: "prossima_esecuzione",
    sort_order: "asc",
  },
};

// --- HELPERS ---

const handlePending = (state: RecurringsState) => {
  state.loading = true;
};

const handleRejected = (state: RecurringsState) => {
  state.loading = false;
};

const recurringsSlice = createSlice({
  name: "recurrings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      //get Recurring Transactions
      .addCase(
        getRecurrings.fulfilled,
        (state, action: PayloadAction<Recurring[]>) => {
          state.recurrings = action.payload;
        },
      )
      // Create Recurring Transaction
      .addCase(
        createRecurring.fulfilled,
        (state, action: PayloadAction<Recurring>) => {
          state.recurrings.push(action.payload);
        },
      )

      .addCase(
        updateRecurring.fulfilled,
        (state, action: PayloadAction<Recurring>) => {
          const index = state.recurrings.findIndex(
            (rec) => rec.id === action.payload.id,
          );
          if (index !== -1) {
            state.recurrings[index] = action.payload;
          }
        },
      )

      .addCase(
        deleteRecurring.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.recurrings = state.recurrings.filter(
            (rec) => rec.id !== action.payload,
          );
        },
      )

      // Matchers per caricamento ed errori del modulo transazioni
      .addMatcher(
        (action: Action) =>
          action.type.endsWith("/pending") &&
          action.type.startsWith("recurring/"),
        handlePending,
      )
      .addMatcher(
        (action: Action) =>
          (action.type.endsWith("/rejected") ||
            action.type.endsWith("/fulfilled")) &&
          action.type.startsWith("recurring/"),
        handleRejected,
      );
  },
});

export const selectRecurringLoading = (state: RootState) =>
  state.recurring.loading;
export const selectRecurringRecurrings = (state: RootState) =>
  state.recurring.recurrings;
export const selectRecurringSelectedRecurring = (state: RootState) =>
  state.recurring.selectedRecurring;
export const selectRecurringFilters = (state: RootState) =>
  state.recurring.filters;

export default recurringsSlice.reducer;
