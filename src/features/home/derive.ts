import { Transaction } from "../transactions/interfaces";

/** Numero di giorni in una settimana, con lunedì in prima posizione. */
export const WEEK_LENGTH = 7;

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

/** Le date viaggiano come "YYYY-MM-DD": la formattiamo senza passare da Date. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Lunedì della settimana che contiene `date`. */
export function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // getDay(): 0 = domenica. Con la settimana che parte di lunedì, la domenica
  // è il settimo giorno, non il primo.
  const offset = (start.getDay() + 6) % WEEK_LENGTH;
  start.setDate(start.getDate() - offset);
  return start;
}

export function endOfWeek(date: Date): Date {
  const end = startOfWeek(date);
  end.setDate(end.getDate() + WEEK_LENGTH - 1);
  return end;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
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
    // La data arriva come "YYYY-MM-DD" (o ISO con orario): il giorno è nei
    // primi dieci caratteri, e confrontarli come stringhe evita il fuso.
    const dayKey = transaction.data.slice(0, 10);
    const index = daysBetween(startKey, dayKey);

    if (index >= 0 && index < WEEK_LENGTH) {
      totals[index] += effectiveAmount(transaction);
    }
  }

  return totals;
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);

  if (Number.isNaN(from) || Number.isNaN(to)) return -1;

  return Math.round((to - from) / 86_400_000);
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
