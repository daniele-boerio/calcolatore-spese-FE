// Helper di calendario condivisi.
//
// Stanno qui e non dentro un dominio perché li usano più feature (la settimana
// della Home, i periodi dei Movimenti, gli intervalli dell'Analisi): duplicarli
// significherebbe farli divergere.

/** Giorni in una settimana, con lunedì in prima posizione. */
export const WEEK_LENGTH = 7;

const MS_PER_DAY = 86_400_000;

/** Le date viaggiano come "YYYY-MM-DD": la formattiamo senza passare da UTC. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Mezzanotte locale del giorno di `date`, senza orario. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const shifted = startOfDay(date);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}

/** Lunedì della settimana che contiene `date`. */
export function startOfWeek(date: Date): Date {
  const start = startOfDay(date);
  // getDay(): 0 = domenica. Con la settimana che parte di lunedì, la domenica
  // è il settimo giorno, non il primo.
  const offset = (start.getDay() + 6) % WEEK_LENGTH;
  start.setDate(start.getDate() - offset);
  return start;
}

export function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), WEEK_LENGTH - 1);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  // Giorno 0 del mese successivo: l'ultimo del mese corrente, bisestili inclusi.
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/** Primo giorno del mese spostato di `months`. */
export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

export function endOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31);
}

/**
 * Giorni fra due date in formato "YYYY-MM-DD". Il confronto passa da UTC così
 * l'ora legale non fa mai valere una giornata 23 o 25 ore; `-1` se una delle
 * due non è una data valida.
 */
export function daysBetweenIso(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);

  if (Number.isNaN(from) || Number.isNaN(to)) return -1;

  return Math.round((to - from) / MS_PER_DAY);
}

/** Il giorno di una data che può arrivare con o senza orario. */
export function dayKey(value: string): string {
  return value.slice(0, 10);
}
