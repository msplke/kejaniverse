import { type Row } from "@tanstack/react-table";

export function dateRangeFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: Date[] | undefined,
): boolean {
  // filterValue should be [startDate, endDate]
  if (!filterValue || !Array.isArray(filterValue)) return true;

  const [start, end] = filterValue;
  const cellDate: Date = row.getValue(columnId);

  // No dates provided, don't filter
  if (!start && !end) return true;

  // Both dates provided, check range
  if (start && end) {
    return cellDate >= start && cellDate <= end;
  }

  // Only start date provided
  if (start) return cellDate >= start;

  // Only end date provided
  if (end) return cellDate <= end;

  return true;
}
