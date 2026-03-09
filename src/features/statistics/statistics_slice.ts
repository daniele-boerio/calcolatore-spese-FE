import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
import { MonthlyStatRow } from "./interfaces";
import { getMonthlyStatistics } from "./api_calls";

interface StatisticsState {
  monthlyData: MonthlyStatRow[];
  loading: boolean;
  error: string | null;
}

const initialState: StatisticsState = {
  monthlyData: [],
  loading: false,
  error: null,
};

const statisticsSlice = createSlice({
  name: "statistics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMonthlyStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getMonthlyStatistics.fulfilled,
        (state, action: PayloadAction<MonthlyStatRow[]>) => {
          state.loading = false;
          state.monthlyData = action.payload;
        },
      )
      .addCase(getMonthlyStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectStatisticsData = (state: RootState) =>
  state.statistics.monthlyData;
export const selectStatisticsLoading = (state: RootState) =>
  state.statistics.loading;

export default statisticsSlice.reducer;
