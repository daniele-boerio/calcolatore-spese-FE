import { createSlice, PayloadAction, Action } from "@reduxjs/toolkit";
import { Tag, TagState } from "./interfaces";

const initialState: TagState = {
  loading: false,
  tags: [],
  selectedTag: null,
};

// 3. Helper per i matcher tipizzati
const handlePending = (state: TagState) => {
  state.loading = true;
};

const handleRejected = (state: TagState) => {
  state.loading = false;
};

const tagSlice = createSlice({
  name: "tag",
  initialState,
  reducers: {
    // Se avessi bisogno di reducer sincroni (es. per pulire il tag selezionato)
    setSelectedTag: (state, action: PayloadAction<Tag | null>) => {
      state.selectedTag = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Qui aggiungerai i .addCase per getTags, createTag, etc.
      // Esempio: .addCase(getTags.fulfilled, (state, action) => { state.tags = action.payload; })

      .addMatcher(
        (action: Action) =>
          action.type.endsWith("/pending") && action.type.startsWith("tag/"),
        handlePending,
      )
      .addMatcher(
        (action: Action) =>
          (action.type.endsWith("/rejected") ||
            action.type.endsWith("/fulfilled")) &&
          action.type.startsWith("tag/"),
        handleRejected,
      );
  },
});

export const { setSelectedTag } = tagSlice.actions;
export default tagSlice.reducer;
