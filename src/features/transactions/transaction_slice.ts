import { createSlice, PayloadAction, Action } from "@reduxjs/toolkit";
import {
  createTransaction,
  deleteTransaction,
  getLastTransactions,
  getTransactionsPaginated,
  updateTransaction,
} from "./api_calls";
import {
  PaginatedResponse,
  Transaction,
  TransactionsState,
} from "./interfaces";
import { RootState } from "../../store/store";

const initialState: TransactionsState = {
  loading: false,
  transactions: [],
  selectedTransaction: null,
  pagination: {
    total: null,
    page: null,
    size: null,
  },
  filters: {
    sort_by: ["data:desc", "lastUpdate:desc"],
  },
};

// --- HELPERS ---

// Converte i campi Decimal (stringhe) in Number per il frontend
const mapTransaction = (tx: Transaction): Transaction => ({
  ...tx,
  importo: Number(tx.importo),
  importo_netto: tx.importo_netto !== null ? Number(tx.importo_netto) : null,
});

const handlePending = (state: TransactionsState) => {
  state.loading = true;
};

const handleRejected = (state: TransactionsState) => {
  state.loading = false;
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {},
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
      .addCase(
        getTransactionsPaginated.fulfilled,
        (state, action: PayloadAction<PaginatedResponse>) => {
          state.transactions = action.payload.data.map(mapTransaction);
          state.pagination.total = action.payload.total;
          state.pagination.page = action.payload.page;
          state.pagination.size = action.payload.size;

          // Cast obbligatorio per i totali aggregati che arrivano come stringhe
          state.pagination.total_incomes = Number(
            action.payload.total_entrata || 0,
          );
          state.pagination.total_expenses = Number(
            action.payload.total_uscita || 0,
          );
          state.pagination.total_compensation = Number(
            action.payload.total_rimborsi || 0,
          );
        },
      )

      .addCase(
        createTransaction.fulfilled,
        (state, action: PayloadAction<Transaction>) => {
          const newTx = mapTransaction(action.payload);
          state.pagination.total = (state.pagination.total || 0) + 1;

          const updatedList = [...state.transactions, newTx];
          updatedList.sort(
            (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
          );

          const pageSize = state.pagination.size || 10;
          state.transactions =
            updatedList.length > pageSize
              ? updatedList.slice(0, pageSize)
              : updatedList;
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
            state.transactions.sort(
              (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
            );
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

export default transactionsSlice.reducer;
