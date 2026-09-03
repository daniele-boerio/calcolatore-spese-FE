import { describe, it, expect } from "vitest";
import { Transaction } from "../transactions/interfaces";
import {
  effectiveAmount,
  endOfWeek,
  monthlyAverage,
  percentDelta,
  spendingByWeekday,
  startOfWeek,
  toIsoDate,
} from "./derive";

const tx = (data: string, importo: number, netto?: number | null) =>
  ({
    id: "1",
    data,
    importo,
    importo_netto: netto ?? null,
    tipo: "USCITA",
  }) as unknown as Transaction;

describe("effectiveAmount", () => {
  it("usa l'importo netto quando c'è", () => {
    expect(effectiveAmount(tx("2026-09-03", 100, 80))).toBe(80);
  });

  it("ricade sull'importo per le transazioni senza netto", () => {
    // Le più vecchie hanno importo_netto a NULL: sommare la colonna nuda le
    // scarterebbe, come sul BE.
    expect(effectiveAmount(tx("2026-09-03", 100, null))).toBe(100);
  });

  it("converte i Decimal che arrivano come stringhe", () => {
    expect(
      effectiveAmount(tx("2026-09-03", "42.30" as unknown as number)),
    ).toBe(42.3);
  });
});

describe("startOfWeek / endOfWeek", () => {
  it("parte dal lunedì", () => {
    // 2026-09-03 è un giovedì.
    expect(toIsoDate(startOfWeek(new Date(2026, 8, 3)))).toBe("2026-08-31");
    expect(toIsoDate(endOfWeek(new Date(2026, 8, 3)))).toBe("2026-09-06");
  });

  it("tiene la domenica nella settimana che finisce, non in quella che inizia", () => {
    // 2026-09-06 è una domenica.
    expect(toIsoDate(startOfWeek(new Date(2026, 8, 6)))).toBe("2026-08-31");
  });

  it("il lunedì è già l'inizio della sua settimana", () => {
    expect(toIsoDate(startOfWeek(new Date(2026, 7, 31)))).toBe("2026-08-31");
  });
});

describe("spendingByWeekday", () => {
  const weekStart = new Date(2026, 7, 31); // lunedì

  it("mette ogni spesa nel suo giorno, con sette celle sempre", () => {
    const totals = spendingByWeekday(
      [
        tx("2026-08-31", 10),
        tx("2026-08-31", 5),
        tx("2026-09-03", 40),
        tx("2026-09-06", 7),
      ],
      weekStart,
    );

    expect(totals).toEqual([15, 0, 0, 40, 0, 0, 7]);
  });

  it("ignora quello che cade fuori dalla settimana", () => {
    const totals = spendingByWeekday(
      [tx("2026-08-30", 99), tx("2026-09-07", 99), tx("2026-09-01", 3)],
      weekStart,
    );

    expect(totals).toEqual([0, 3, 0, 0, 0, 0, 0]);
  });

  it("legge il giorno anche da una data con orario", () => {
    const totals = spendingByWeekday([tx("2026-09-01T22:30:00Z", 12)], weekStart);

    expect(totals[1]).toBe(12);
  });

  it("somma sull'importo netto, come gli aggregati del BE", () => {
    const totals = spendingByWeekday([tx("2026-08-31", 100, 30)], weekStart);

    expect(totals[0]).toBe(30);
  });
});

describe("percentDelta", () => {
  it("calcola il calo rispetto al mese prima", () => {
    expect(percentDelta(920, 1000)).toBe(-8);
  });

  it("calcola l'aumento", () => {
    expect(percentDelta(1100, 1000)).toBe(10);
  });

  it("non produce un delta senza un riferimento sensato", () => {
    // "+∞% vs agosto" non vuol dire niente: meglio non mostrare il badge.
    expect(percentDelta(500, 0)).toBeNull();
    expect(percentDelta(500, null)).toBeNull();
  });
});

describe("monthlyAverage", () => {
  it("divide il totale per i mesi", () => {
    expect(monthlyAverage(900, 3)).toBe(300);
  });

  it("non divide per zero", () => {
    expect(monthlyAverage(900, 0)).toBe(0);
  });
});
