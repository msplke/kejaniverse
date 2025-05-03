"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "../data-table-column-header";

type UnitTableColumns = {
  id: string;
  name: string;
  unitType: string;
  occupied: boolean;
  rentPrice: number;
};

export const unitTableColumns: ColumnDef<UnitTableColumns>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader title="Unit Name" column={column} />
    ),
  },
  {
    accessorKey: "unitType",
    header: "Unit Type",
  },
  {
    accessorKey: "occupied",
    header: "Is Occupied",
    cell: ({ row }) => {
      const occupied = row.getValue("occupied");
      return <span>{occupied ? "Yes" : "No"}</span>;
    },
  },
  {
    accessorKey: "id",
    header: "Unit ID",
  },
  {
    accessorKey: "rentPrice",
    header: ({ column }) => (
      <DataTableColumnHeader title="Rent price" column={column} />
    ),
    cell: ({ row }) => {
      const rentPrice = parseFloat(row.getValue("rentPrice"));
      const currencyFormatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "KES",
      });
      const formatted = currencyFormatter.format(rentPrice);
      return <span>{formatted}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const unit = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-2">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(unit.id);
                  toast.info("Unit ID copied to clipboard");
                }}
              >
                Copy unit ID
              </DropdownMenuItem>
              <DropdownMenuItem>Edit unit info</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                Remove unit
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
