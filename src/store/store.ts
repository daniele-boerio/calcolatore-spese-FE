import { configureStore } from "@reduxjs/toolkit";
import trasactionReducer from "../features/transactions/transactionSlice";
import profileReducer from "../features/profile/profileSlice";
import contoReducer from "../features/conti/contoSlice";
import categoriaReducer from "../features/categorie/categoriaSlice";
import tagReducer from "../features/tags/tagSlice";
import errorReducer from "../features/error/errorSlice";
import { useDispatch, useSelector } from "react-redux";
import { errorMiddleware } from "./errorMiddleware";

export const store = configureStore({
  reducer: {
    transaction: trasactionReducer,
    profile: profileReducer,
    conto: contoReducer,
    categoria: categoriaReducer,
    tag: tagReducer,
    error: errorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(errorMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
