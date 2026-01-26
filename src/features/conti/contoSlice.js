import { createSlice } from "@reduxjs/toolkit";
import {
  getConti,
  getCurrentMonthExpenses,
  getCurrentMonthExpensesByCategory,
  updateBudget,
} from "./apiCalls";

const handlePending = (state) => {
  state.loading = true;
};

const handleRejected = (state) => {
  state.loading = false;
};

const contoSlice = createSlice({
  name: "conto",
  initialState: {
    loading: false,
    conti: [],
    selectedConto: null,
    monthlyBudget: {
      totalBudget: null,
      expenses: null,
      percentage: null,
    },
    monthlyExpensesByCategory: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      //currentMonthExpenses
      .addCase(getCurrentMonthExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyBudget.totalBudget =
          action.payload.monthly_budget.totalBudget;
        state.monthlyBudget.expenses = action.payload.monthly_budget.expenses;
        state.monthlyBudget.percentage =
          action.payload.monthly_budget.percentage ?? 0;
      })

      //updateBudget
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyBudget.totalBudget =
          action.payload.monthly_budget.totalBudget;
        state.monthlyBudget.expenses = action.payload.monthly_budget.expenses;
        state.monthlyBudget.percentage =
          action.payload.monthly_budget.percentage ?? 0;
      })

      //conti
      .addCase(getConti.fulfilled, (state, action) => {
        state.loading = false;
        state.conti = action.payload;
      })

      //getCurrentMonthExpensesByCategory
      .addCase(getCurrentMonthExpensesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyExpensesByCategory = action.payload;
      })

      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") && action.type.includes("conti"),
        handlePending,
      )
      // Gestisci TUTTI i REJECTED di questo slice
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") && action.type.includes("conti"),
        handleRejected,
      );
  },
});

//export const {} = profileSlice.actions;
export default contoSlice.reducer;
