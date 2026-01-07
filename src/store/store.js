import { configureStore } from '@reduxjs/toolkit';
import trasactionReducer from '../features/transaction/transactionSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    transaction: trasactionReducer,
    auth: authReducer,
  },
});