import { createSlice, PayloadAction, Action } from "@reduxjs/toolkit";
import { getLastTransactions, getTransactionsPaginated } from "./apiCalls";
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
      .addCase(
        getLastTransactions.fulfilled,
        (state, action: PayloadAction<Transaction[]>) => {
          state.loading = false;
          state.transactions = action.payload;
        },
      )

      // GET TransactionsPaginated
      .addCase(
        getTransactionsPaginated.fulfilled,
        (state, action: PayloadAction<PaginatedResponse>) => {
          state.loading = false;
          state.transactions = action.payload.data;
          state.pagination.total = action.payload.total;
          state.pagination.page = action.payload.page;
          state.pagination.size = action.payload.size;
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

export default transactionsSlice.reducer;
