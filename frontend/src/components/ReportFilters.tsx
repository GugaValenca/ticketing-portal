import { useRef } from "react";
import { formatUsDateInput, isoToUsDate, usToIsoDate } from "../lib/dates";
import type { ReportDateField } from "../types";

function openPicker(ref: React.RefObject<HTMLInputElement | null>) {
  const picker = ref.current;
  if (!picker) return;
  if (typeof picker.showPicker === "function") {
    picker.showPicker();
  } else {
    picker.focus();
  }
}

export function ReportFilters({
  dateField,
  startDate,
  endDate,
  error,
  onDateFieldChange,
  onStartDateChange,
  onEndDateChange,
  onApply,
}: {
  dateField: ReportDateField;
  startDate: string;
  endDate: string;
  error: string | null;
  onDateFieldChange: (value: ReportDateField) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onApply: () => void;
}) {
  const startPickerRef = useRef<HTMLInputElement | null>(null);
  const endPickerRef = useRef<HTMLInputElement | null>(null);

  return (
    <section
      id="report-section"
      className="scroll-mt-20 rounded-xl border border-indigo-100 bg-white/95 p-4 shadow-sm"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Report</h2>
      <p className="mt-1 text-xs text-slate-600">
        Select a date field, define a period, and apply the filter.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,200px)_minmax(0,220px)_minmax(0,220px)_auto]">
        <div className="grid gap-1">
          <label htmlFor="report-date-field" className="text-xs font-semibold text-slate-600">
            Date field
          </label>
          <select
            id="report-date-field"
            value={dateField}
            onChange={(e) => onDateFieldChange(e.target.value as ReportDateField)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
          >
            <option value="created_at">Created date</option>
            <option value="updated_at">Last updated date</option>
          </select>
        </div>

        <div className="grid gap-1">
          <label htmlFor="report-start-date" className="text-xs font-semibold text-slate-600">
            Start date (MM/DD/YYYY)
          </label>
          <div className="relative flex h-10 items-center rounded-lg border border-slate-300 bg-white px-2 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-200">
            <input
              id="report-start-date"
              type="text"
              inputMode="numeric"
              placeholder="MM/DD/YYYY"
              maxLength={10}
              value={startDate}
              onChange={(e) => onStartDateChange(formatUsDateInput(e.target.value))}
              className="h-full flex-1 bg-transparent px-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              className="rounded-md p-1 text-slate-600 hover:bg-slate-100"
              onClick={() => openPicker(startPickerRef)}
              aria-label="Open start date picker"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2Zm13 8H4v10h16V10Z" />
              </svg>
            </button>
            <input
              ref={startPickerRef}
              type="date"
              lang="en-US"
              value={usToIsoDate(startDate)}
              onChange={(e) => onStartDateChange(isoToUsDate(e.target.value))}
              className="absolute h-0 w-0 opacity-0 pointer-events-none"
              tabIndex={-1}
              aria-hidden
            />
          </div>
        </div>

        <div className="grid gap-1">
          <label htmlFor="report-end-date" className="text-xs font-semibold text-slate-600">
            End date (MM/DD/YYYY)
          </label>
          <div className="relative flex h-10 items-center rounded-lg border border-slate-300 bg-white px-2 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-200">
            <input
              id="report-end-date"
              type="text"
              inputMode="numeric"
              placeholder="MM/DD/YYYY"
              maxLength={10}
              value={endDate}
              onChange={(e) => onEndDateChange(formatUsDateInput(e.target.value))}
              className="h-full flex-1 bg-transparent px-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              className="rounded-md p-1 text-slate-600 hover:bg-slate-100"
              onClick={() => openPicker(endPickerRef)}
              aria-label="Open end date picker"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2Zm13 8H4v10h16V10Z" />
              </svg>
            </button>
            <input
              ref={endPickerRef}
              type="date"
              lang="en-US"
              value={usToIsoDate(endDate)}
              onChange={(e) => onEndDateChange(isoToUsDate(e.target.value))}
              className="absolute h-0 w-0 opacity-0 pointer-events-none"
              tabIndex={-1}
              aria-hidden
            />
          </div>
        </div>

        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <button
            type="button"
            onClick={onApply}
            className="h-10 w-full rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500 lg:w-auto"
          >
            Apply
          </button>
        </div>
      </div>
      {error ? (
        <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          {error}
        </div>
      ) : null}
    </section>
  );
}
