import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// URL del tuo backend su OMV
const API_URL = import.meta.env.VITE_API_URL;

export const fetchTransaction = createAsyncThunk('transactions/fetchTransactions', async (_, { rejectWithValue }) => {
  try {
    // Non serve passare gli headers, lo fa l'interceptor!
    const response = await api.get('/transazioni'); 
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {
    addTransactionLocale: (state, action) => {
      state.items.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransaction.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTransaction.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTransaction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { addTransactionLocale } = transactionsSlice.actions;
export default transactionsSlice.reducer;