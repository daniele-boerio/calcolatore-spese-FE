import { Action, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
import { MonthlyDetailCategory, YearDetailsStatRow } from "./interfaces";
import {
  getMonthlyDetailsStatistics,
  getYearDetailsStatistics,
} from "./api_calls";

interface StatisticsState {
  yearlyData: YearDetailsStatRow[];
  monthlyData: MonthlyDetailCategory[];
  totals: {
    incomes: number;
    expenses: number;
  };
  loading: boolean;
}

const initialState: StatisticsState = {
  yearlyData: [],
  monthlyData: [],
  totals: {
    incomes: 0,
    expenses: 0,
  },
  loading: false,
};

const handlePending = (state: StatisticsState) => {
  state.loading = true;
};

const handleRejected = (state: StatisticsState) => {
  state.loading = false;
};

const statisticsSlice = createSlice({
  name: "statistics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        getYearDetailsStatistics.fulfilled,
        (state, action: PayloadAction<YearDetailsStatRow[]>) => {
          state.loading = false;
          state.yearlyData = action.payload;
        },
      )

      .addCase(
        getMonthlyDetailsStatistics.fulfilled,
        (state, action: PayloadAction<MonthlyDetailResponse>) => {
          state.loading = false;
          state.monthlyData = action.payload.data;
          state.totals.incomes = action.payload.totale_entrata;
          state.totals.expenses = action.payload.totale_uscita;
        },
      )

      // Matchers (rimangono invariati)
      .addMatcher(
        (action: Action) =>
          action.type.endsWith("/pending") &&
          action.type.startsWith("statistics/"),
        handlePending,
      )
      .addMatcher(
        (action: Action) =>
          (action.type.endsWith("/rejected") ||
            action.type.endsWith("/fulfilled")) &&
          action.type.startsWith("statistics/"),
        handleRejected,
      );
  },
});

// Selectors
export const selectYearlyStatisticsData = (state: RootState) =>
  state.statistics.yearlyData;
export const selectMonthlyStatisticsData = (state: RootState) =>
  state.statistics.monthlyData;
export const selectMonthlyTotals = (state: RootState) =>
  state.statistics.totals;
export const selectStatisticsLoading = (state: RootState) =>
  state.statistics.loading;

export default statisticsSlice.reducer;
