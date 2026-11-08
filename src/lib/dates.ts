export const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function validDate(s: unknown): s is string {
  if (typeof s !== "string" || !ISO.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function nightsBetween(ci: string, co: string): number {
  return Math.round((Date.parse(co + "T00:00:00Z") - Date.parse(ci + "T00:00:00Z")) / 86400000);
}

export function eachNight(ci: string, co: string): string[] {
  const out: string[] = [];
  let t = Date.parse(ci + "T00:00:00Z");
  const end = Date.parse(co + "T00:00:00Z");
  while (t < end) {
    out.push(new Date(t).toISOString().slice(0, 10));
    t += 86400000;
  }
  return out;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export const eur = (cents: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);
