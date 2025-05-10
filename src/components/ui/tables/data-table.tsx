"use client";

import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import {
  FilterPopover,
  type FilterPopoverOptions,
} from "~/components/filter/filter-component";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { dateRangeFilterFn } from "~/components/ui/tables/custom-filters";
import { DataTableFilterInput } from "~/components/ui/tables/data-table-filter-input";
import { DataTablePagination } from "~/components/ui/tables/data-table-pagination";
import { camelCaseToSentenceCase } from "~/lib/utils";

type FilterOptions<TData> = {
  keywordFilterKey: keyof TData & string;
  popoverFilterOptions?: FilterPopoverOptions<TData>;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  // Optional filter option to show a filter input for a specific column
  // If not provided, no filter input will be shown
  showPagination?: boolean;
  filterOptions?: FilterOptions<TData>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterOptions,
  showPagination = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      dateRange: dateRangeFilterFn,
    },
    state: {
      sorting,
      columnFilters,
    },
  });

  const hideableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanHide());

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 py-4">
        {filterOptions?.keywordFilterKey && (
          <DataTableFilterInput
            table={table}
            columnKey={filterOptions.keywordFilterKey}
          />
        )}

        <div className="flex items-center space-x-2 justify-self-end">
          {filterOptions?.popoverFilterOptions && (
            <FilterPopover
              table={table}
              options={filterOptions.popoverFilterOptions}
            />
          )}
          {hideableColumns.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {hideableColumns.map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {camelCaseToSentenceCase(column.id)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <div className="my-4">
          <DataTablePagination table={table} />
        </div>
      )}
    </div>
  );
}
