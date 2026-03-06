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
    total_budget: null,
    expenses: null,
    percentage: null,
  },
  monthlyExpensesByCategory: [],
  filters: {
    sort_by: ["saldo:desc"],
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
      // currentMonthExpenses & updateBudget
      .addCase(
        getCurrentMonthExpenses.fulfilled,
        (state, action: PayloadAction<MonthlyBudgetResponse>) => {
          const { monthly_budget } = action.payload;
          // Cast a Number perché arrivano come stringhe dal backend
          state.monthlyBudget.total_budget = Number(
            monthly_budget.total_budget,
          );
          state.monthlyBudget.expenses = Number(monthly_budget.expenses);
          state.monthlyBudget.percentage = monthly_budget.percentage ?? 0;
        },
      )
      .addCase(
        updateBudget.fulfilled,
        (state, action: PayloadAction<MonthlyBudgetResponse>) => {
          const { monthly_budget } = action.payload;
          state.monthlyBudget.total_budget = Number(
            monthly_budget.total_budget,
          );
          state.monthlyBudget.expenses = Number(monthly_budget.expenses);
          state.monthlyBudget.percentage = monthly_budget.percentage ?? 0;
        },
      )

      // getConti
      .addCase(getConti.fulfilled, (state, action: PayloadAction<Conto[]>) => {
        // Mappiamo i conti per assicurarci che i campi numerici siano effettivamente numeri nello stato
        state.conti = action.payload.map((c) => ({
          ...c,
          saldo: Number(c.saldo),
          budget_obiettivo: c.budget_obiettivo ? Number(c.budget_obiettivo) : 0,
          soglia_minima: c.soglia_minima ? Number(c.soglia_minima) : 0,
        }));
      })

      // getCurrentMonthExpensesByCategory
      .addCase(
        getCurrentMonthExpensesByCategory.fulfilled,
        (state, action: PayloadAction<ExpenseByCategory[]>) => {
          // Cast del valore per ogni categoria
          state.monthlyExpensesByCategory = action.payload.map((item) => ({
            ...item,
            value: Number(item.value),
          }));
        },
      )

      // createConto
      .addCase(createConto.fulfilled, (state, action: PayloadAction<Conto>) => {
        state.conti.push({
          ...action.payload,
          saldo: Number(action.payload.saldo),
        });
      })

      // updateConto
      .addCase(updateConto.fulfilled, (state, action: PayloadAction<Conto>) => {
        const index = state.conti.findIndex(
          (conto) => conto.id === action.payload.id,
        );
        if (index !== -1) {
          state.conti[index] = {
            ...action.payload,
            saldo: Number(action.payload.saldo),
          };
        }
      })

      .addCase(
        deleteConto.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.conti = state.conti.filter(
            (conto) => String(conto.id) !== String(action.payload),
          );
        },
      )

      .addCase(
        createTransaction.fulfilled,
        (state, action: PayloadAction<Transaction>) => {
          const newTx = action.payload;
          const txImporto = Number(newTx.importo); // Fondamentale: cast dell'importo stringa

          const isThisMonth =
            new Date(newTx.data).getMonth() === new Date().getMonth() &&
            new Date(newTx.data).getFullYear() === new Date().getFullYear();

          // 1. Aggiorna il saldo del conto coinvolto
          const contoIndex = state.conti.findIndex(
            (c) => String(c.id) === String(newTx.conto_id),
          );
          if (contoIndex !== -1) {
            const mod = newTx.tipo === "USCITA" ? -1 : 1;
            // Calcolo sicuro tra numeri
            state.conti[contoIndex].saldo += txImporto * mod;
          }

          // 2. Se la transazione appartiene al mese corrente, aggiorna statistiche budget
          if (
            isThisMonth &&
            (newTx.tipo === "USCITA" || newTx.tipo === "RIMBORSO")
          ) {
            const txMod = newTx.tipo === "USCITA" ? 1 : -1;
            const importoNetto = txImporto * txMod;

            // Aggiorna Monthly Budget
            if (state.monthlyBudget.expenses !== null) {
              state.monthlyBudget.expenses += importoNetto;

              // Ricalcola la percentuale
              if (
                state.monthlyBudget.total_budget &&
                state.monthlyBudget.total_budget > 0
              ) {
                state.monthlyBudget.percentage = Number(
                  (
                    (state.monthlyBudget.expenses /
                      state.monthlyBudget.total_budget) *
                    100
                  ).toFixed(1),
                );
              }
            }

            // Aggiorna Expenses By Category
            const categoryName =
              (newTx as any).categoria?.nome || "Uncategorized";

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

            // Filtro pulizia categorie
            state.monthlyExpensesByCategory =
              state.monthlyExpensesByCategory.filter((c) => c.value > 0);
          }
        },
      )

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

// Selectors (Invariati)
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
