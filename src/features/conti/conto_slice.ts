import { createSlice, PayloadAction, Action } from "@reduxjs/toolkit";
import {
  createConto,
  deleteConto,
  getConti,
  getCurrentMonthExpenses,
  getCurrentMonthExpensesByCategory,
  updateBudget,
  updateConto,
} from "./api_calls";
import {
  Conto,
  ContoState,
  ExpenseByCategory,
  MonthlyBudgetResponse,
} from "./interfaces";

const initialState: ContoState = {
  loading: false,
  conti: [],
  selectedConto: null,
  monthlyBudget: {
    totalBudget: null,
    expenses: null,
    percentage: null,
  },
  monthlyExpensesByCategory: [],
};

// --- HELPERS ---

const handlePending = (state: ContoState) => {
  state.loading = true;
};

const handleRejected = (state: ContoState) => {
  state.loading = false;
};

const contoSlice = createSlice({
  name: "conto",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // currentMonthExpenses & updateBudget (usano la stessa struttura di risposta)
      .addCase(
        getCurrentMonthExpenses.fulfilled,
        (state, action: PayloadAction<MonthlyBudgetResponse>) => {
          const { monthly_budget } = action.payload;
          state.monthlyBudget.totalBudget = monthly_budget.totalBudget;
          state.monthlyBudget.expenses = monthly_budget.expenses;
          state.monthlyBudget.percentage = monthly_budget.percentage ?? 0;
        },
      )
      .addCase(
        updateBudget.fulfilled,
        (state, action: PayloadAction<MonthlyBudgetResponse>) => {
          const { monthly_budget } = action.payload;
          state.monthlyBudget.totalBudget = monthly_budget.totalBudget;
          state.monthlyBudget.expenses = monthly_budget.expenses;
          state.monthlyBudget.percentage = monthly_budget.percentage ?? 0;
        },
      )

      // getConti
      .addCase(getConti.fulfilled, (state, action: PayloadAction<Conto[]>) => {
        state.conti = action.payload;
      })

      // getCurrentMonthExpensesByCategory
      .addCase(
        getCurrentMonthExpensesByCategory.fulfilled,
        (state, action: PayloadAction<ExpenseByCategory[]>) => {
          state.monthlyExpensesByCategory = action.payload;
        },
      )

      // createConto
      .addCase(createConto.fulfilled, (state, action: PayloadAction<Conto>) => {
        state.conti.push(action.payload);
      })

      // updateConto
      .addCase(updateConto.fulfilled, (state, action: PayloadAction<Conto>) => {
        const index = state.conti.findIndex(
          (conto) => conto.id === action.payload.id,
        );
        if (index !== -1) {
          state.conti[index] = action.payload;
        }
      })

      .addCase(
        deleteConto.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.conti = state.conti.filter(
            (conto) => conto.id !== action.payload,
          );
        },
      )

      // Matchers per caricamento ed errori del modulo conti
      .addMatcher(
        (action: Action) =>
          action.type.endsWith("/pending") && action.type.startsWith("conti/"),
        handlePending,
      )
      .addMatcher(
        (action: Action) =>
          (action.type.endsWith("/rejected") ||
            action.type.endsWith("/fulfilled")) &&
          action.type.startsWith("conti/"),
        handleRejected,
      );
  },
});

export default contoSlice.reducer;
