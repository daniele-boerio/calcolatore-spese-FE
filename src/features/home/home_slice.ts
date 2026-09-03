import { Action, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
import { HomeState, UpcomingRecurrence } from "./interfaces";
import { ExpenseCompositionOut } from "../charts/interfaces";
import { PaginatedResponse } from "../transactions/interfaces";
import { monthlyAverage, spendingByWeekday, WEEK_LENGTH } from "./derive";
import {
  getCategoryAverages,
  getPreviousMonthExpenses,
  getUpcomingRecurrences,
  getWeekSpending,
} from "./api_calls";

const initialState: HomeState = {
  loading: false,
  weekSpending: new Array<number>(WEEK_LENGTH).fill(0),
  weekStart: null,
  upcoming: [],
  upcomingDays: 0,
  previousMonthExpenses: null,
  categoryAverages: {},
};

// Dati che il BE non espone come tali: la Home li ricompone da endpoint
// esistenti. L'aggregazione sta qui, non nel componente.
const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        getWeekSpending.fulfilled,
        (
          state,
          action: PayloadAction<{
            transactions: PaginatedResponse["data"];
            weekStart: string;
          }>,
        ) => {
          const { transactions, weekStart } = action.payload;

          state.weekStart = weekStart;
          state.weekSpending = spendingByWeekday(
            transactions,
            new Date(`${weekStart}T00:00:00`),
          );
        },
      )

      .addCase(
        getUpcomingRecurrences.fulfilled,
        (
          state,
          action: PayloadAction<{ items: UpcomingRecurrence[]; days: number }>,
        ) => {
          state.upcoming = action.payload.items;
          state.upcomingDays = action.payload.days;
        },
      )

      .addCase(
        getPreviousMonthExpenses.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.previousMonthExpenses = action.payload;
        },
      )

      .addCase(
        getCategoryAverages.fulfilled,
        (
          state,
          action: PayloadAction<{
            composition: ExpenseCompositionOut[];
            months: number;
          }>,
        ) => {
          const { composition, months } = action.payload;

          state.categoryAverages = Object.fromEntries(
            composition.map((entry) => [
              entry.categoria,
              monthlyAverage(Number(entry.totale), months),
            ]),
          );
        },
      )

      .addMatcher(
        (action: Action) =>
          action.type.startsWith("home/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
        },
      )
      .addMatcher(
        (action: Action) =>
          action.type.startsWith("home/") &&
          (action.type.endsWith("/fulfilled") ||
            action.type.endsWith("/rejected")),
        (state) => {
          state.loading = false;
        },
      );
  },
});

export const selectHomeLoading = (state: RootState) => state.home.loading;

export const selectHomeWeekSpending = (state: RootState) =>
  state.home.weekSpending;

export const selectHomeUpcoming = (state: RootState) => state.home.upcoming;

export const selectHomeUpcomingDays = (state: RootState) =>
  state.home.upcomingDays;

export const selectHomePreviousMonthExpenses = (state: RootState) =>
  state.home.previousMonthExpenses;

export const selectHomeCategoryAverages = (state: RootState) =>
  state.home.categoryAverages;

export default homeSlice.reducer;
