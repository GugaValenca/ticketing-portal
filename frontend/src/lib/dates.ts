// US-format (MM/DD/YYYY) date helpers for the report date-range filter.

/** Formats raw digit input as the user types into MM/DD/YYYY. */
export function formatUsDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Converts an ISO date (YYYY-MM-DD, as produced by <input type="date">) to MM/DD/YYYY. */
export function isoToUsDate(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "";
  return `${month}/${day}/${year}`;
}

/** Converts a complete MM/DD/YYYY string to ISO (YYYY-MM-DD), or "" if malformed. */
export function usToIsoDate(value: string) {
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return "";
  const [, mm, dd, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Converts a MM/DD/YYYY string to a Date at the start or end of that day,
 * for use as an inclusive range boundary. Returns null if the string isn't
 * a complete, valid date.
 */
export function usDateToBoundary(value: string, boundary: "start" | "end") {
  const iso = usToIsoDate(value);
  if (!iso) return null;
  const time = boundary === "start" ? "T00:00:00.000" : "T23:59:59.999";
  const parsed = new Date(`${iso}${time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
