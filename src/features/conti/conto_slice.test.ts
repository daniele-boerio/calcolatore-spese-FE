import { describe, it, expect } from "vitest";
import reducer from "./conto_slice";
import {
  getCurrentMonthExpenses,
  getCurrentMonthExpensesByCategory,
} from "./api_calls";
import { createTransaction } from "../transactions/api_calls";
import { Transaction } from "../transactions/interfaces";

const initial = reducer(undefined, { type: "@@INIT" });

const budgetFromServer = (remaining: number) =>
  getCurrentMonthExpenses.fulfilled(
    {
      monthly_budget: { total_budget: 1000, remaining, percentage: null },
    },
    "req",
    undefined,
  );

const pieFromServer = (value: number) =>
  getCurrentMonthExpensesByCategory.fulfilled(
    [{ label: "Casa", value }],
    "req",
    undefined,
  );

const transactionCreated = (tipo: string, importo: number) =>
  createTransaction.fulfilled(
    {
      id: "1",
      importo,
      tipo,
      data: new Date().toISOString(),
      conto_id: "1",
      categoria: { id: "1", nome: "Casa" },
    } as unknown as Transaction,
    "req",
    {} as never,
  );

/**
 * Il thunk createTransaction attende il refetch di budget e grafico PRIMA di
 * risolvere, quindi le loro `fulfilled` arrivano sempre prima della propria.
 * Questi test fissano quell'ordine: chi arriva dopo non deve riapplicare nulla.
 */
describe("conto_slice — totali del mese dopo una nuova transazione", () => {
  it("non raddoppia la spesa nel grafico per categoria", () => {
    let state = initial;
    state = reducer(state, pieFromServer(50)); // server: già include i 50
    state = reducer(state, transactionCreated("USCITA", 50));

    expect(state.monthlyExpensesByCategory).toEqual([
      { label: "Casa", value: 50 },
    ]);
  });

  it("non sottrae due volte l'accantonamento dal risparmio", () => {
    let state = initial;
    state = reducer(state, budgetFromServer(200)); // server: già al netto dei 50
    state = reducer(state, transactionCreated("ACCANTONAMENTO", 50));

    expect(state.monthlyBudget.remaining).toBe(200);
  });

  it("lascia al server il risparmio anche dopo una spesa", () => {
    let state = initial;
    state = reducer(state, budgetFromServer(150));
    state = reducer(state, transactionCreated("USCITA", 50));

    expect(state.monthlyBudget.remaining).toBe(150);
  });

  it("aggiorna comunque il saldo del conto (getConti non viene rifetchato)", () => {
    let state = reducer(initial, {
      type: "conti/getConti/fulfilled",
      // bastano i campi letti dal reducer
      payload: [{ id: "1", saldo: "1000" }],
    });
    state = reducer(state, transactionCreated("USCITA", 50));

    expect(state.conti[0].saldo).toBe(950);
  });

  it("converte a Number i Decimal che arrivano come stringhe", () => {
    const state = reducer(
      initial,
      getCurrentMonthExpenses.fulfilled(
        {
          monthly_budget: {
            total_budget: "1000.00" as unknown as number,
            remaining: "-42.50" as unknown as number,
            percentage: null,
          },
        },
        "req",
        undefined,
      ),
    );

    expect(state.monthlyBudget.total_budget).toBe(1000);
    expect(state.monthlyBudget.remaining).toBe(-42.5);
  });
});
