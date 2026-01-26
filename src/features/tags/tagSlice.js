import { createSlice } from "@reduxjs/toolkit";

const handlePending = (state) => {
  state.loading = true;
};

const handleRejected = (state) => {
  state.loading = false;
};

const tagSlice = createSlice({
  name: "tag",
  initialState: {
    loading: false,
    tags: [],
    selectedTag: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") && action.type.includes("tag"),
        handlePending,
      )
      // Gestisci TUTTI i REJECTED di questo slice
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") && action.type.includes("tag"),
        handleRejected,
      );
  },
});

export default tagSlice.reducer;
