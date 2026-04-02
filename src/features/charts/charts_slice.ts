import { createSlice, PayloadAction, Action } from "@reduxjs/toolkit";
import {
  getIncomeExpenseChart,
  getSavingsChart,
  getExpenseCompositionChart,
  getCategoryTrendChart,
} from "./api_calls";
import { ChartsState } from "./interfaces";

const initialState: ChartsState = {
  incomeExpense: [],
  savings: [],
  expenseComposition: [],
  categoryTrend: [],
  loading: false,
  error: null,
};

const handlePending = (state: ChartsState) => {
  state.loading = true;
};

const handleRejected = (state: ChartsState, action: any) => {
  state.loading = false;
  state.error = (action.payload as string) || "Errore sconosciuto";
};

const chartsSlice = createSlice({
  name: "charts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getIncomeExpenseChart.fulfilled, (state, action) => {
        state.loading = false;
        state.incomeExpense = action.payload;
      })
      .addCase(getSavingsChart.fulfilled, (state, action) => {
        state.loading = false;
        state.savings = action.payload;
      })
      .addCase(getExpenseCompositionChart.fulfilled, (state, action) => {
        state.loading = false;
        state.expenseComposition = action.payload;
      })
      .addCase(getCategoryTrendChart.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryTrend = action.payload;
      })
      .addMatcher(
        (action: Action) =>
          action.type.endsWith("/pending") && action.type.startsWith("charts/"),
        handlePending,
      )
      .addMatcher(
        (action: Action) =>
          action.type.endsWith("/rejected") &&
          action.type.startsWith("charts/"),
        handleRejected,
      );
  },
});

export default chartsSlice.reducer;
