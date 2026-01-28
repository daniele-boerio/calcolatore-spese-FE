import { createSlice, PayloadAction, Action } from "@reduxjs/toolkit";
import {
  createTransaction,
  deleteTransaction,
  getLastTransactions,
  getTransactionsByTag,
  getTransactionsPaginated,
  updateTransaction,
} from "./apiCalls";
import {
  PaginatedResponse,
  Transaction,
  TransactionsState,
} from "./interfaces";

const initialState: TransactionsState = {
  loading: false,
  transactions: [],
  selectedTransaction: null,
  pagination: {
    total: null,
    page: null,
    size: null,
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
      .addCase(getLastTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })

      // GET TransactionsPaginated
      .addCase(getTransactionsPaginated.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.data;
        state.pagination.total = action.payload.total;
        state.pagination.page = action.payload.page;
        state.pagination.size = action.payload.size;
      })

      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.push(action.payload);
      })

      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transactions.findIndex(
          (tran) => tran.id === action.payload.id,
        );
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })

      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.filter(
          (tran) => tran.id !== action.payload,
        );
      })

      .addCase(getTransactionsByTag.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })

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

export default transactionsSlice.reducer;
