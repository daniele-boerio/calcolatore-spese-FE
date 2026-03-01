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
import { RootState } from "../../store/store";
import { createTransaction } from "../transactions/api_calls";
import { Transaction } from "../transactions/interfaces";

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
  filters: {
    sort_by: "saldo",
    sort_order: "desc",
  },
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

      .addCase(
        createTransaction.fulfilled,
        (state, action: PayloadAction<Transaction>) => {
          const newTx = action.payload;
          const isThisMonth =
            new Date(newTx.data).getMonth() === new Date().getMonth() &&
            new Date(newTx.data).getFullYear() === new Date().getFullYear();

          // 1. Aggiorna il saldo del conto coinvolto
          const contoIndex = state.conti.findIndex(
            (c) => String(c.id) === String(newTx.conto_id),
          );
          if (contoIndex !== -1) {
            const mod = newTx.tipo === "USCITA" ? -1 : 1;
            state.conti[contoIndex].saldo += newTx.importo * mod;
          }

          // 2. Se la transazione appartiene al mese corrente, aggiorna statistiche budget
          if (
            isThisMonth &&
            (newTx.tipo === "USCITA" || newTx.tipo === "RIMBORSO")
          ) {
            const txMod = newTx.tipo === "USCITA" ? 1 : -1;
            const importoNetto = newTx.importo * txMod;

            // Aggiorna Monthly Budget
            if (state.monthlyBudget.expenses !== null) {
              state.monthlyBudget.expenses += importoNetto;

              // Ricalcola la percentuale se esiste un budget totale
              if (
                state.monthlyBudget.totalBudget &&
                state.monthlyBudget.totalBudget > 0
              ) {
                state.monthlyBudget.percentage = Number(
                  (
                    (state.monthlyBudget.expenses /
                      state.monthlyBudget.totalBudget) *
                    100
                  ).toFixed(1),
                );
              }
            }

            // Aggiorna Expenses By Category
            // Nota: assumiamo che l'oggetto categoria sia presente nella risposta della transazione
            const categoryName = newTx.categoria_id
              ? (newTx as any).categoria_nome || "Uncategorized"
              : "Uncategorized";

            const catIndex = state.monthlyExpensesByCategory.findIndex(
              (item) => item.label === categoryName,
            );

            if (catIndex !== -1) {
              state.monthlyExpensesByCategory[catIndex].value += importoNetto;
            } else {
              state.monthlyExpensesByCategory.push({
                label: categoryName,
                value: importoNetto,
              });
            }

            // Rimuove categorie con valore <= 0 (es. dopo un rimborso totale)
            state.monthlyExpensesByCategory =
              state.monthlyExpensesByCategory.filter((c) => c.value > 0);
          }
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

export const selectContiLoading = (state: RootState) => state.conto.loading;
export const selectContiConti = (state: RootState) => state.conto.conti;
export const selectContiSelectedConto = (state: RootState) =>
  state.conto.selectedConto;
export const selectContiMonthlyBudget = (state: RootState) =>
  state.conto.monthlyBudget;
export const selectContiMonthlyExpensesByCategory = (state: RootState) =>
  state.conto.monthlyExpensesByCategory;
export const selectContiFilters = (state: RootState) => state.conto.filters;

export default contoSlice.reducer;
