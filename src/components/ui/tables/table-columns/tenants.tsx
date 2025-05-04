"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "../data-table-column-header";

type Tenant = {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  moveInDate: string; // ISO date string
  moveOutDate: string | null; // ISO date string or null
  cumulativeRentPaid: number;
  unitName: string;
};

export const tenantTableColumns: ColumnDef<Tenant>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableHiding: false,
  },
  {
    accessorKey: "unitName",
    header: "Unit",
    enableHiding: false,
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email: string = row.getValue("email");
      return (
        <Button asChild variant="link" className="p-0">
          <Link href={`mailto:${email}`}>{email}</Link>
        </Button>
      );
    },
  },
  {
    accessorKey: "moveInDate",
    header: ({ column }) => (
      <DataTableColumnHeader title="Move In Date" column={column} />
    ),
    cell: ({ row }) => {
      const moveInDate = new Date(row.getValue("moveInDate"));
      const formatted = moveInDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
      return <span>{formatted}</span>;
    },
  },
  {
    accessorKey: "moveOutDate",
    header: "Move Out Date",
    cell: ({ row }) => {
      const moveOutDate: Date | null = row.getValue("moveOutDate");
      if (!moveOutDate) return <span>N/A</span>;
      const formatted = new Date(moveOutDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
      return <span>{formatted}</span>;
    },
  },
  {
    accessorKey: "cumulativeRentPaid",
    header: "Cumulative Rent Paid",
    cell: ({ row }) => {
      const cumulativeRentPaid = parseFloat(row.getValue("cumulativeRentPaid"));
      const currencyFormatter = new Intl.NumberFormat("en-UK", {
        style: "currency",
        currency: "KES",
      });
      const formatted = currencyFormatter.format(cumulativeRentPaid);
      return <span>{formatted}</span>;
    },
    enableHiding: false,
  },
  {
    id: "actions",
    cell: () => {
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
              <DropdownMenuItem>Edit tenant info</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                Remove tenant
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableHiding: false,
  },
];
