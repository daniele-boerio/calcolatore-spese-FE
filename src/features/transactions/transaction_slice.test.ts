import { describe, it, expect } from "vitest";
import { mapTransaction } from "./transaction_slice";
import type { Transaction } from "./interfaces";

// Il BE serializza gli importi Decimal come stringhe: `mapTransaction` è il
// confine dove diventano Number per la UI (vedi FE/CLAUDE.md). Questi test
// bloccano quel contratto: importi sempre `number`, e null preservato.

const baseRaw = {
  id: "1",
  data: "2026-07-14",
  descrizione: "Spesa",
  tipo: "USCITA",
  conto_id: "10",
  categoria_id: "5",
  sottocategoria_id: "7",
  tag_id: "3",
  parent_transaction_id: "",
  creationDate: "2026-07-14T00:00:00Z",
  lastUpdate: "2026-07-14T00:00:00Z",
};

// Costruisce una transazione "grezza" come arriva dal BE (importi = stringhe).
const rawTx = (importo: unknown, importo_netto: unknown = null) =>
  ({ ...baseRaw, importo, importo_netto }) as unknown as Transaction;

describe("mapTransaction (money boundary)", () => {
  it("converte importo da stringa Decimal a Number", () => {
    expect(mapTransaction(rawTx("1234.56")).importo).toBe(1234.56);
  });

  it("gestisce zero e negativi", () => {
    expect(mapTransaction(rawTx("0.00")).importo).toBe(0);
    expect(mapTransaction(rawTx("-50.00")).importo).toBe(-50);
  });

  it("restituisce sempre un number per importo (mai una stringa)", () => {
    expect(typeof mapTransaction(rawTx("99.99")).importo).toBe("number");
  });

  it("mantiene importo_netto null quando è null", () => {
    expect(mapTransaction(rawTx("10.00", null)).importo_netto).toBeNull();
  });

  it("converte importo_netto quando presente", () => {
    expect(mapTransaction(rawTx("10.00", "8.20")).importo_netto).toBe(8.2);
  });

  it("non altera gli altri campi della transazione", () => {
    const result = mapTransaction(rawTx("5.00"));
    expect(result.id).toBe("1");
    expect(result.tipo).toBe("USCITA");
    expect(result.descrizione).toBe("Spesa");
    expect(result.conto_id).toBe("10");
  });
});
