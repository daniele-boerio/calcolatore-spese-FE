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
    sort_by: "data",
    sort_order: "desc",
  },
};

// --- HELPERS ---

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
          state.transactions = action.payload;
        },
      )

      // GET TransactionsPaginated
      .addCase(
        getTransactionsPaginated.fulfilled,
        (state, action: PayloadAction<PaginatedResponse>) => {
          state.transactions = action.payload.data;
          state.pagination.total = action.payload.total;
          state.pagination.page = action.payload.page;
          state.pagination.size = action.payload.size;
          state.pagination.total_incomes = action.payload.total_entrata;
          state.pagination.total_expenses = action.payload.total_uscita;
        },
      )

      .addCase(
        createTransaction.fulfilled,
        (state, action: PayloadAction<Transaction>) => {
          state.pagination.total = (state.pagination.total || 0) + 1;
          const updatedList = [...state.transactions, action.payload];
          updatedList.sort(
            (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
          );
          const pageSize = state.pagination.size || 10;

          if (updatedList.length > pageSize) {
            state.transactions = updatedList.slice(0, pageSize);
          } else {
            state.transactions = updatedList;
          }
        },
      )

      .addCase(
        updateTransaction.fulfilled,
        (state, action: PayloadAction<Transaction>) => {
          const index = state.transactions.findIndex(
            (tran) => tran.id === action.payload.id,
          );

          if (index !== -1) {
            state.transactions[index] = action.payload;
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
            (tran) => tran.id !== action.payload,
          );
          state.pagination.total = state.pagination.total
            ? state.pagination.total - 1
            : 0;
        },
      )

      // Matchers per caricamento ed errori del modulo transazioni
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
