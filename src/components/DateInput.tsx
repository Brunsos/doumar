"use client";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function daysInMonth(monthIndex: number, year: number): number {
  if (monthIndex < 0 || monthIndex > 11) return 31;
  if (!year) return 31;
  return new Date(year, monthIndex + 1, 0).getDate();
}

function parseValue(value: string): { year: string; month: string; day: string } {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { year: "", month: "", day: "" };
  }
  const [y, m, d] = value.split("-");
  return { year: y, month: String(Number(m)), day: String(Number(d)) };
}

function buildValue(year: string, month: string, day: string): string {
  if (!year || !month || !day) return "";
  const mm = month.padStart(2, "0");
  const dd = day.padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export default function DateInput({
  value,
  onChange,
  onBlur,
  error,
  minYear = 1910,
  maxYear,
  yearOrder = "desc",
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  minYear?: number;
  maxYear?: number;
  yearOrder?: "asc" | "desc";
}) {
  const currentYear = new Date().getFullYear();
  const effectiveMax = maxYear ?? currentYear;

  const { year, month, day } = parseValue(value);

  const monthIndex = month ? Number(month) - 1 : -1;
  const maxDay = daysInMonth(monthIndex, Number(year));
  const clampedDay =
    day && Number(day) > maxDay ? String(maxDay) : day;

  function emit(nextYear: string, nextMonth: string, nextDay: string) {
    onChange(buildValue(nextYear, nextMonth, nextDay));
  }

  const years: number[] = [];
  for (let y = effectiveMax; y >= minYear; y--) years.push(y);
  if (yearOrder === "asc") years.reverse();

  const dayOptions: number[] = [];
  for (let d = 1; d <= maxDay; d++) dayOptions.push(d);

  const cls = `border-2 rounded p-3 text-base focus:outline-none focus:border-navy transition-colors bg-white ${
    error ? "border-red-500" : "border-gray-300"
  }`;

  return (
    <div className="grid grid-cols-3 gap-2">
      <select
        value={month}
        onChange={(e) => emit(year, e.target.value, clampedDay)}
        onBlur={onBlur}
        className={cls}
        aria-label="Month"
      >
        <option value="">Month</option>
        {MONTHS.map((name, i) => (
          <option key={name} value={String(i + 1)}>
            {name}
          </option>
        ))}
      </select>

      <select
        value={clampedDay}
        onChange={(e) => emit(year, month, e.target.value)}
        onBlur={onBlur}
        className={cls}
        aria-label="Day"
      >
        <option value="">Day</option>
        {dayOptions.map((d) => (
          <option key={d} value={String(d)}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => emit(e.target.value, month, clampedDay)}
        onBlur={onBlur}
        className={cls}
        aria-label="Year"
      >
        <option value="">Year</option>
        {years.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
