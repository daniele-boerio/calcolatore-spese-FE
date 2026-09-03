import { createSlice, PayloadAction, Action } from "@reduxjs/toolkit";
import {
  createTransaction,
  deleteTransaction,
  getLastTransactions,
  getTransactionsPaginated,
  updateTransaction,
  splitTransaction,
} from "./api_calls";
import {
  PaginatedResponse,
  Transaction,
  TransactionsState,
} from "./interfaces";
import { RootState } from "../../store/store";
import { PeriodPreset, periodRange } from "./period";
import { DEFAULT_PERIOD } from "./filters_url";

const DEFAULT_SORT = ["data:desc", "lastUpdate:desc"];

const initialState: TransactionsState = {
  loading: false,
  transactions: [],
  selectedTransaction: null,
  period: DEFAULT_PERIOD,
  pagination: {
    total: null,
    page: null,
    size: null,
  },
  filters: {
    sort_by: DEFAULT_SORT,
    ...periodRange(DEFAULT_PERIOD),
  },
};

// --- HELPERS ---

// Converte i campi Decimal (stringhe) in Number per il frontend
export const mapTransaction = (tx: Transaction): Transaction => ({
  ...tx,
  importo: Number(tx.importo),
  importo_netto: tx.importo_netto !== null ? Number(tx.importo_netto) : null,
});

const sortTransactions = (a: Transaction, b: Transaction) => {
  const dateA = new Date(a.data).getTime();
  const dateB = new Date(b.data).getTime();
  if (dateA !== dateB) return dateB - dateA;

  const lastUpdateA = new Date(a.lastUpdate).getTime();
  const lastUpdateB = new Date(b.lastUpdate).getTime();
  if (lastUpdateA !== lastUpdateB) return lastUpdateB - lastUpdateA;

  const creationA = new Date(a.creationDate).getTime();
  const creationB = new Date(b.creationDate).getTime();
  if (creationA !== creationB) return creationB - creationA;

  return String(b.id).localeCompare(String(a.id));
};

const handlePending = (state: TransactionsState) => {
  state.loading = true;
};

const handleRejected = (state: TransactionsState) => {
  state.loading = false;
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    updateFilters: (
      state,
      action: PayloadAction<Partial<TransactionsState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    /**
     * Sostituisce il blocco di filtri per intero. La usa il ripristino
     * dall'URL: una fusione lascerebbe in piedi i filtri della visita
     * precedente, che nell'indirizzo non ci sono più.
     */
    applyFilters: (
      state,
      action: PayloadAction<{
        period: PeriodPreset;
        filters: TransactionsState["filters"];
      }>,
    ) => {
      state.period = action.payload.period;
      state.filters = { sort_by: DEFAULT_SORT, ...action.payload.filters };
    },

    /**
     * Cambia periodo e ricalcola le date. "custom" non tocca `data_inizio` e
     * `data_fine`: le ha scelte l'utente.
     */
    setPeriod: (state, action: PayloadAction<PeriodPreset>) => {
      state.period = action.payload;

      if (action.payload === "custom") return;

      const range = periodRange(action.payload);
      state.filters.data_inizio = range.data_inizio;
      state.filters.data_fine = range.data_fine;
    },

    resetFilters: (state) => {
      state.period = DEFAULT_PERIOD;
      state.filters = {
        sort_by: DEFAULT_SORT,
        ...periodRange(DEFAULT_PERIOD),
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // GET LastTransactions
      .addCase(
        getLastTransactions.fulfilled,
        (state, action: PayloadAction<Transaction[]>) => {
          state.transactions = action.payload.map(mapTransaction);
        },
      )

      // GET TransactionsPaginated
      .addCase(getTransactionsPaginated.fulfilled, (state, action) => {
        // Le pagine oltre la prima si accodano: la lista dei Movimenti cresce
        // verso il basso invece di ripartire da capo.
        const loaded = action.payload.data.map(mapTransaction);
        const merged = action.meta.arg.append
          ? [...state.transactions, ...loaded]
          : loaded;

        state.transactions = merged.sort(sortTransactions);
        state.pagination.total = action.payload.total;
        state.pagination.page = action.payload.page;
        state.pagination.size = action.payload.size;

        // Cast obbligatorio per i totali aggregati che arrivano come stringhe
        state.pagination.total_incomes = Number(action.payload.total_entrata || 0);
        state.pagination.total_expenses = Number(action.payload.total_uscita || 0);
        state.pagination.total_compensation = Number(
          action.payload.total_rimborsi || 0,
        );
      })

      .addCase(
        createTransaction.fulfilled,
        (state, action: PayloadAction<Transaction>) => {
          const newTx = mapTransaction(action.payload);
          state.pagination.total = (state.pagination.total || 0) + 1;

          const updatedList = [...state.transactions, newTx];
          updatedList.sort(sortTransactions);

          const pageSize = state.pagination.size || 10;
          state.transactions =
            updatedList.length > pageSize
              ? updatedList.slice(0, pageSize)
              : updatedList;
        },
      )

      .addCase(
        splitTransaction.fulfilled,
        (
          state,
          action: PayloadAction<{ sourceId: string; parts: Transaction[] }>,
        ) => {
          const { sourceId, parts } = action.payload;

          // Remove original transaction if present
          state.transactions = state.transactions.filter(
            (t) => String(t.id) !== String(sourceId),
          );

          // Map and insert new parts
          const mapped = parts.map(mapTransaction);
          const updatedList = [...state.transactions, ...mapped];
          updatedList.sort(sortTransactions);

          const pageSize = state.pagination.size || 10;
          state.transactions =
            updatedList.length > pageSize
              ? updatedList.slice(0, pageSize)
              : updatedList;

          // Adjust total (remove original, add parts)
          if (
            state.pagination.total !== null &&
            state.pagination.total !== undefined
          ) {
            state.pagination.total =
              state.pagination.total - 1 + (parts ? parts.length : 0);
          }
        },
      )

      .addCase(
        updateTransaction.fulfilled,
        (state, action: PayloadAction<Transaction>) => {
          const updatedTx = mapTransaction(action.payload);
          const index = state.transactions.findIndex(
            (tran) => tran.id === updatedTx.id,
          );

          if (index !== -1) {
            state.transactions[index] = updatedTx;
            state.transactions.sort(sortTransactions);
          }
        },
      )

      .addCase(
        deleteTransaction.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.transactions = state.transactions.filter(
            (tran) => String(tran.id) !== String(action.payload),
          );
          state.pagination.total = state.pagination.total
            ? state.pagination.total - 1
            : 0;
        },
      )

      // Matchers (invariati)
      .addMatcher(
        (action: Action) =>
          action.type.endsWith("/pending") &&
          action.type.startsWith("transazioni/"),
        handlePending,
      )
      .addMatcher(
        (action: Action) =>
          (action.type.endsWith("/rejected") ||
            action.type.endsWith("/fulfilled")) &&
          action.type.startsWith("transazioni/"),
        handleRejected,
      );
  },
});

export const selectTransactionLoading = (state: RootState) =>
  state.transaction.loading;

export const selectTransactionTransactions = (state: RootState) =>
  state.transaction.transactions;

export const selectTransactionSelectedTransaction = (state: RootState) =>
  state.transaction.selectedTransaction;

export const selectTransactionPagination = (state: RootState) =>
  state.transaction.pagination;

export const selectTransactionFilters = (state: RootState) =>
  state.transaction.filters;

export const selectTransactionPeriod = (state: RootState) =>
  state.transaction.period;

export const { updateFilters, applyFilters, setPeriod, resetFilters } =
  transactionsSlice.actions;

export default transactionsSlice.reducer;
