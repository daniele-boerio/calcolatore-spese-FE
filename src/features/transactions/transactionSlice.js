import { createSlice } from "@reduxjs/toolkit";
import { getLastTransactions, getTransactionsPaginated } from "./apiCalls";

const handlePending = (state) => {
  state.loading = true;
};

const handleRejected = (state) => {
  state.loading = false;
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState: {
    loading: false,
    transactions: [],
    selectedTransaction: null,
    pagination: {
      total: null,
      page: null,
      size: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      //GET LastTransactions
      .addCase(getLastTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })

      //GET TransactionsPaginated
      .addCase(getTransactionsPaginated.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.data;
        state.pagination.total = action.payload.total;
        state.pagination.page = action.payload.page;
        state.pagination.size = action.payload.size;
      })

      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") &&
          action.type.includes("transazioni"),
        handlePending,
      )
      // Gestisci TUTTI i REJECTED di questo slice
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") &&
          action.type.includes("transazioni"),
        handleRejected,
      );
  },
});

export default transactionsSlice.reducer;
