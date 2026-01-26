import { createSlice } from "@reduxjs/toolkit";
import { login, register } from "./apiCalls";

const handlePending = (state) => {
  state.loading = true;
};

const handleRejected = (state) => {
  state.loading = false;
};

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    loading: false,
    token: localStorage.getItem("token") || null,
    username: localStorage.getItem("username") || null,
    isAuthenticated: !!localStorage.getItem("token"),
  },
  reducers: {
    setLogout: (state) => {
      state.token = null;
      state.username = null;
      state.monthlyBudget = {
        totalBudget: null,
        expenses: null,
        percentage: null,
      };
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      //login
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.username = action.payload.username;
        state.isAuthenticated = true;

        localStorage.setItem("token", action.payload.access_token);
        localStorage.setItem("username", action.payload.username);
      })

      //register
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.username = action.payload.username;
        state.isAuthenticated = true;

        localStorage.setItem("token", action.payload.access_token);
        localStorage.setItem("username", action.payload.username);
      })

      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") && action.type.includes("profile"),
        handlePending,
      )
      // Gestisci TUTTI i REJECTED di questo slice
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") && action.type.includes("profile"),
        handleRejected,
      );
  },
});

//export const {} = profileSlice.actions;
export default profileSlice.reducer;
