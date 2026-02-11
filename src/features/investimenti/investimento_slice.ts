import { createSlice, PayloadAction, Action } from "@reduxjs/toolkit";
import {
  DeleteOperazioneOutput,
  Investimento,
  InvestimentoState,
  Operazione,
} from "./interfaces";
import {
  createInvestimento,
  createOperazione,
  deleteInvestimento,
  deleteOperazione,
  getInvestimenti,
  updateInvestimento,
  updateOperazione,
} from "./api_calls";
import { RootState } from "../../store/store";

const initialState: InvestimentoState = {
  loading: false,
  investimenti: [],
  selectedInvestimento: null,
};

// --- HELPERS ---

const handlePending = (state: InvestimentoState) => {
  state.loading = true;
};

const handleRejected = (state: InvestimentoState) => {
  state.loading = false;
};

const investimentoSlice = createSlice({
  name: "investimento",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getInvestimenti
      .addCase(
        getInvestimenti.fulfilled,
        (state, action: PayloadAction<Investimento[]>) => {
          state.investimenti = action.payload;
        },
      )

      // createInvestimento
      .addCase(
        createInvestimento.fulfilled,
        (state, action: PayloadAction<Investimento>) => {
          state.investimenti.push(action.payload);
        },
      )

      // updateInvestimento
      .addCase(
        updateInvestimento.fulfilled,
        (state, action: PayloadAction<Investimento>) => {
          const index = state.investimenti.findIndex(
            (inv) => inv.id === action.payload.id,
          );
          if (index !== -1) {
            state.investimenti[index] = action.payload;
          }
        },
      )

      // deleteInvestimento
      .addCase(
        deleteInvestimento.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.investimenti = state.investimenti.filter(
            (inv) => inv.id !== action.payload,
          );
        },
      )

      // createOperazione
      .addCase(
        createOperazione.fulfilled,
        (state, action: PayloadAction<Operazione>) => {
          const newOp = action.payload;
          const investimento = state.investimenti.find(
            (inv) => inv.id === newOp.investimento_id,
          );
          if (investimento) {
            if (!investimento.storico) investimento.storico = [];
            investimento.storico.push(newOp);
          }
        },
      )

      // updateOperazione
      .addCase(
        updateOperazione.fulfilled,
        (state, action: PayloadAction<Operazione>) => {
          const updatedOp = action.payload;
          const investimento = state.investimenti.find(
            (inv) => inv.id === updatedOp.investimento_id,
          );
          if (investimento && investimento.storico) {
            const subIndex = investimento.storico.findIndex(
              (sub) => sub.id === updatedOp.id,
            );
            if (subIndex !== -1) {
              investimento.storico[subIndex] = updatedOp;
            }
          }
        },
      )

      // deleteOperazione
      .addCase(
        deleteOperazione.fulfilled,
        (state, action: PayloadAction<DeleteOperazioneOutput>) => {
          const { op_id, inv_id } = action.payload;
          const investimento = state.investimenti.find(
            (inv) => inv.id === inv_id,
          );
          if (investimento && investimento.storico) {
            investimento.storico = investimento.storico.filter(
              (op) => op.id !== op_id,
            );
          }
        },
      )

      // Matchers per caricamento ed errori del modulo conti
      .addMatcher(
        (action: Action) =>
          action.type.endsWith("/pending") &&
          action.type.startsWith("investimenti/"),
        handlePending,
      )
      .addMatcher(
        (action: Action) =>
          (action.type.endsWith("/rejected") ||
            action.type.endsWith("/fulfilled")) &&
          action.type.startsWith("investimenti/"),
        handleRejected,
      );
  },
});

export const selectInvestimentoLoading = (state: RootState) =>
  state.investimento.loading;
export const selectInvestimentoInvestimenti = (state: RootState) =>
  state.investimento.investimenti;
export const selectInvestimentoSelectedInvestimento = (state: RootState) =>
  state.investimento.selectedInvestimento;

export default investimentoSlice.reducer;
