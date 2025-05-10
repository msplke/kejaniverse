"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  dateRangeFilterFn,
  tenantNameFilterFn,
} from "~/components/tables/table-columns/custom-filters";
import { formatCurrency } from "~/lib/formatters";
import { DataTableColumnHeader } from "../data-table-column-header";

type PaymentTableColumns = {
  unitName: string;
  unitType: string;
  unitStatus: string;
  unitId: string;
  rentAmount: number;
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  } | null;
  paidAt: Date;
  referenceNumber: string;
  amountPaid: number;
  paymentMethod: "mpesa" | "bank_transfer";
};

export const paymentTableColumns: ColumnDef<PaymentTableColumns>[] = [
  {
    accessorKey: "unitName",
    header: ({ column }) => (
      <DataTableColumnHeader title="Unit Name" column={column} />
    ),
    enableHiding: false,
  },
  {
    accessorKey: "unitType",
    header: ({ column }) => (
      <DataTableColumnHeader title="Unit Type" column={column} />
    ),
    enableHiding: true,
  },
  {
    accessorKey: "unitStatus",
    header: "Unit Status",
    enableHiding: true,
  },
  {
    accessorKey: "unitId",
    header: "Unit ID",
    enableHiding: true,
  },
  {
    accessorKey: "tenant",
    header: "Tenant",
    cell: ({ row }) => {
      const tenant: PaymentTableColumns["tenant"] = row.getValue("tenant");
      return tenant ? `${tenant.firstName} ${tenant.lastName}` : "N/A";
    },
    enableHiding: false,
    filterFn: tenantNameFilterFn,
  },
  {
    accessorKey: "amountPaid",
    header: ({ column }) => (
      <DataTableColumnHeader title="Amount Paid" column={column} />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amountPaid"));
      return formatCurrency(amount);
    },
    enableHiding: false,
  },
  {
    accessorKey: "rentAmount",
    header: ({ column }) => (
      <DataTableColumnHeader title="Rent Amount" column={column} />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("rentAmount"));
      return formatCurrency(amount);
    },
    enableHiding: true,
  },
  {
    accessorKey: "paidAt",
    header: ({ column }) => (
      <DataTableColumnHeader title="Payment Date" column={column} />
    ),
    cell: ({ row }) => {
      const date: Date = row.getValue("paidAt");
      return date.toLocaleDateString();
    },
    enableHiding: false,
    filterFn: dateRangeFilterFn,
  },
  {
    accessorKey: "referenceNumber",
    header: "Reference No.",
    enableHiding: true,
  },
  {
    accessorKey: "paymentMethod",
    header: "Method",
    cell: ({ row }) => {
      const method: string = row.getValue("paymentMethod");
      return method.toUpperCase();
    },
    enableHiding: false,
  },
];
