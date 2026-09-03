import { Transaction } from "../transactions/interfaces";
import {
  addMonths,
  dayKey,
  daysBetweenIso,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  toIsoDate,
  WEEK_LENGTH,
} from "../../services/dates";

// Il calendario sta in `services/dates`: qui restano i calcoli che servono solo
// alla Home. Ri-esportiamo quello che la Home usa, così i suoi import non
// devono conoscere due moduli.
export {
  addMonths,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  toIsoDate,
  WEEK_LENGTH,
};

/**
 * Importo che conta negli aggregati: al netto degli eventuali rimborsi.
 * Stessa regola di `importo_effettivo()` sul BE (`importo_netto` se c'è,
 * altrimenti `importo`) — se divergesse, la somma della settimana non
 * tornerebbe con i totali del mese.
 */
export function effectiveAmount(transaction: Transaction): number {
  const netto = transaction.importo_netto;
  return Number(netto ?? transaction.importo);
}

/**
 * Spesa per giorno della settimana corrente, lunedì → domenica.
 * Sette celle sempre: i giorni futuri valgono 0 e il grafico li disegna spenti.
 */
export function spendingByWeekday(
  transactions: Transaction[],
  weekStart: Date,
): number[] {
  const totals = new Array<number>(WEEK_LENGTH).fill(0);
  const startKey = toIsoDate(weekStart);

  for (const transaction of transactions) {
    const index = daysBetweenIso(startKey, dayKey(transaction.data));

    if (index >= 0 && index < WEEK_LENGTH) {
      totals[index] += effectiveAmount(transaction);
    }
  }

  return totals;
}

/**
 * Variazione percentuale rispetto a un riferimento. `null` quando il
 * riferimento è zero o assente: "+∞% vs agosto" non vuol dire niente.
 */
export function percentDelta(
  current: number,
  previous: number | null,
): number | null {
  if (previous === null || previous === 0) return null;

  return Math.round(((current - previous) / previous) * 100);
}

/** Media mensile a partire da un totale su più mesi. */
export function monthlyAverage(total: number, months: number): number {
  return months > 0 ? total / months : 0;
}
