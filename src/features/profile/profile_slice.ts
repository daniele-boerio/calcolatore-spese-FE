import { createSlice, PayloadAction, Action } from "@reduxjs/toolkit";
import { getProfile, login, register } from "./api_calls";
import { AuthResponse, ProfileResponse, ProfileState } from "./interfaces";

// --- STATO INIZIALE ---

const savedToken = localStorage.getItem("token");
const savedUsername = localStorage.getItem("username");

const initialState: ProfileState = {
  loading: false,
  token: localStorage.getItem("token") || null,
  username: savedUsername ? ({ username: savedUsername } as any) : null,
  email: null,
  isAuthenticated: !!savedToken,
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
          state.token = action.payload.access_token;
          state.username = action.payload.username;
          state.isAuthenticated = true;

          localStorage.setItem("token", action.payload.access_token);
          localStorage.setItem("username", action.payload.username);
        },
      )

      .addCase(
        getProfile.fulfilled,
        (state, action: PayloadAction<ProfileResponse>) => {
          state.isAuthenticated = true;

          state.username = action.payload.username;
          state.email = action.payload.email;
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
