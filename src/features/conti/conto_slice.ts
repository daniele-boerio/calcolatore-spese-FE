import { createSlice, PayloadAction, Action } from "@reduxjs/toolkit";
import {
  confirmBankSession,
  createConto,
  deleteConto,
  disconnectBank,
  getConti,
  getCurrentMonthExpenses,
  getCurrentMonthExpensesByCategory,
  updateBudget,
  updateConto,
} from "./api_calls";
import {
  BankSessionResult,
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
  include_future_recurring: false,
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
  reducers: {
    setIncludeFutureRecurring: (state, action: PayloadAction<boolean>) => {
      state.include_future_recurring = action.payload;
    },
  },
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
          state.monthlyBudget.expenses =
            monthly_budget.expenses !== null &&
            monthly_budget.expenses !== undefined
              ? Number(monthly_budget.expenses)
              : null;
          const remainingValue =
            monthly_budget.remaining ?? action.payload.remaining;
          state.monthlyBudget.remaining =
            remainingValue !== null && remainingValue !== undefined
              ? Number(remainingValue)
              : null;
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
          state.monthlyBudget.expenses =
            monthly_budget.expenses !== null &&
            monthly_budget.expenses !== undefined
              ? Number(monthly_budget.expenses)
              : null;
          const remainingValue =
            monthly_budget.remaining ?? action.payload.remaining;
          state.monthlyBudget.remaining =
            remainingValue !== null && remainingValue !== undefined
              ? Number(remainingValue)
              : null;
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
        // Stessa logica: se il nuovo conto nasce come default,
        // spegniamo il flag a tutti gli altri prima di inserirlo.
        if (action.payload.default) {
          state.conti.forEach((conto) => {
            conto.default = false;
          });
        }

        // Inseriamo il nuovo conto (che avrà is_default: true dal payload)
        state.conti.push({
          ...action.payload,
          saldo: Number(action.payload.saldo),
        });
      })

      // updateConto
      .addCase(updateConto.fulfilled, (state, action: PayloadAction<Conto>) => {
        // Se il conto che stiamo salvando è contrassegnato come default,
        // prima togliamo il flag "default" a tutti i conti esistenti nello state.
        if (action.payload.default) {
          state.conti.forEach((conto) => {
            conto.default = false;
          });
        }

        // Poi aggiorniamo (o inseriamo) il conto con i nuovi dati
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

      // disconnectBank: il conto torna senza connettore bancario
      .addCase(
        disconnectBank.fulfilled,
        (state, action: PayloadAction<Conto>) => {
          const index = state.conti.findIndex(
            (c) => String(c.id) === String(action.payload.id),
          );
          if (index !== -1) {
            state.conti[index] = {
              ...action.payload,
              saldo: Number(action.payload.saldo),
            };
          }
        },
      )

      // confirmBankSession: feedback immediato del collegamento riuscito
      .addCase(
        confirmBankSession.fulfilled,
        (state, action: PayloadAction<BankSessionResult>) => {
          const { conto_id, account_id } = action.payload;
          const conto = state.conti.find(
            (c) => String(c.id) === String(conto_id),
          );
          if (conto) {
            conto.bank_connector_account_id = account_id;
            conto.bank_connector_last_error = null;
          }
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
          if (newTx.tipo === "RICARICA" || newTx.tipo === "ACCANTONAMENTO") {
            // Giroconto/accantonamento: esce dalla sorgente; per l'accantonamento
            // la destinazione (salvadanaio) è opzionale.
            const srcIndex = state.conti.findIndex(
              (c) => String(c.id) === String(newTx.conto_id),
            );
            if (srcIndex !== -1) {
              state.conti[srcIndex].saldo -= txImporto;
            }
            const dstIndex = state.conti.findIndex(
              (c) => String(c.id) === String(newTx.conto_destinazione_id),
            );
            if (dstIndex !== -1) {
              state.conti[dstIndex].saldo += txImporto;
            }
          } else {
            const contoIndex = state.conti.findIndex(
              (c) => String(c.id) === String(newTx.conto_id),
            );
            if (contoIndex !== -1) {
              const mod = newTx.tipo === "USCITA" ? -1 : 1;
              // Calcolo sicuro tra numeri
              state.conti[contoIndex].saldo += txImporto * mod;
            }
          }

          // 2. Se la transazione appartiene al mese corrente, aggiorna statistiche budget
          if (isThisMonth) {
            const isExpense = newTx.tipo === "USCITA";

            // Gli accantonamenti non sono spese ma riducono il risparmio del mese
            if (
              newTx.tipo === "ACCANTONAMENTO" &&
              state.monthlyBudget.remaining !== null
            ) {
              state.monthlyBudget.remaining -= txImporto;
              if (
                state.monthlyBudget.total_budget !== null &&
                state.monthlyBudget.total_budget > 0
              ) {
                state.monthlyBudget.percentage = Number(
                  (
                    (state.monthlyBudget.remaining /
                      state.monthlyBudget.total_budget) *
                    100
                  ).toFixed(1),
                );
              }
            }

            // Aggiorna Monthly Budget solo per le spese
            if (isExpense && state.monthlyBudget.expenses !== null) {
              state.monthlyBudget.expenses += txImporto;

              if (
                state.monthlyBudget.total_budget !== null &&
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

              if (state.monthlyBudget.total_budget !== null) {
                state.monthlyBudget.remaining =
                  state.monthlyBudget.total_budget -
                  state.monthlyBudget.expenses;
              }
            }

            // Aggiorna Expenses By Category
            if (isExpense) {
              const categoryName =
                (newTx as any).categoria?.nome || "Uncategorized";

              const catIndex = state.monthlyExpensesByCategory.findIndex(
                (item) => item.label === categoryName,
              );

              if (catIndex !== -1) {
                state.monthlyExpensesByCategory[catIndex].value += txImporto;
              } else {
                state.monthlyExpensesByCategory.push({
                  label: categoryName,
                  value: txImporto,
                });
              }
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
export const selectIncludeFutureRecurring = (state: RootState) =>
  state.conto.include_future_recurring;

export default contoSlice.reducer;
export const { setIncludeFutureRecurring } = contoSlice.actions;
