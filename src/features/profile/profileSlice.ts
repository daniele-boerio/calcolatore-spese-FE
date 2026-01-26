import { createSlice, PayloadAction, Action } from "@reduxjs/toolkit";
import { login, register } from "./apiCalls";
import { AuthResponse, ProfileState } from "./interfaces";

// --- STATO INIZIALE ---

const initialState: ProfileState = {
  loading: false,
  token: localStorage.getItem("token") || null,
  username: localStorage.getItem("username") || null,
  isAuthenticated: !!localStorage.getItem("token"),
};

// --- HELPERS ---

const handlePending = (state: ProfileState) => {
  state.loading = true;
};

const handleRejected = (state: ProfileState) => {
  state.loading = false;
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setLogout: (state) => {
      state.token = null;
      state.username = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("username");
    },
  },
  extraReducers: (builder) => {
    builder
      // Fulfilled: Login & Register hanno lo stesso comportamento
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.token = action.payload.access_token;
          state.username = action.payload.username;
          state.isAuthenticated = true;

          localStorage.setItem("token", action.payload.access_token);
          localStorage.setItem("username", action.payload.username);
        },
      )
      .addCase(
        register.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.token = action.payload.access_token;
          state.username = action.payload.username;
          state.isAuthenticated = true;

          localStorage.setItem("token", action.payload.access_token);
          localStorage.setItem("username", action.payload.username);
        },
      )

      // Matchers per caricamento ed errori del modulo profile
      .addMatcher(
        (action: Action) =>
          action.type.endsWith("/pending") &&
          action.type.startsWith("profile/"),
        handlePending,
      )
      .addMatcher(
        (action: Action) =>
          (action.type.endsWith("/rejected") ||
            action.type.endsWith("/fulfilled")) &&
          action.type.startsWith("profile/"),
        handleRejected,
      );
  },
});

export const { setLogout } = profileSlice.actions;
export default profileSlice.reducer;
