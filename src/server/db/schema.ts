// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTableCreator,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `kejaniverse_${name}`);

const id = uuid("id")
  .primaryKey()
  .default(sql`uuid_generate_v7()`);

const personalDetails = {
  firstName: varchar("first_name", { length: 32 }).notNull(),
  lastName: varchar("last_name", { length: 32 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 16 }),
  email: varchar("email", { length: 64 }).notNull(),
};

const createdAt = timestamp("created_at", { withTimezone: true })
  .default(sql`CURRENT_TIMESTAMP`)
  .notNull();

export const propertyOwner = createTable(
  "property_owner",
  {
    id: varchar({ length: 32 }).primaryKey(),
    ...personalDetails,
    createdAt,
  },
  (table) => [
    {
      firstNameIndex: index("owner_first_name_idx").on(table.firstName),
      lastNameIndex: index("owner_last_name_idx").on(table.lastName),
    },
  ],
);

export const property = createTable(
  "property",
  {
    id,
    uniqueIdentifier: varchar("unique_identifier", { length: 6 })
      .notNull()
      .unique(),
    name: varchar("name", { length: 64 }).notNull(),
    // address: varchar("address", { length: 64 }).notNull(),
    bankCode: varchar("bank_code", { length: 3 }).notNull(),
    bankAccountNumber: varchar("bank_account_number", { length: 32 }).notNull(),
    subaccountCode: varchar("subaccount_code", { length: 32 }),
    createdAt,
    ownerId: varchar("owner_id", { length: 32 }).references(
      () => propertyOwner.id,
      { onDelete: "cascade" },
    ),
  },
  (table) => [{ nameIndex: index("property_name_idx").on(table.name) }],
);

export const tenant = createTable(
  "tenant",
  {
    id,
    ...personalDetails,
    moveInDate: date("move_in_date")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    moveOutDate: date("move_out_date"),
    cumulativeRentPaid: integer("cumulative_rent_paid").default(0).notNull(),
    unitId: uuid("unit_id").references(() => unit.id, { onDelete: "cascade" }),
  },
  (table) => [
    {
      firstNameIndex: index("tenant_first_name_idx").on(table.firstName),
      lastNameIndex: index("tenant_last_name_idx").on(table.lastName),
    },
  ],
);

export const unitTypeEnum = pgEnum("unit_type_enum", [
  "Single-room",
  "Bedsitter",
  "One-bedroom",
  "Two-bedroom",
  "Three-bedroom",
]);

export const unitType = createTable("unit_type", {
  id,
  unitType: unitTypeEnum("unit_type").notNull(),
  rentPrice: integer("rent_price").notNull(),
  propertyId: uuid("property_id").references(() => property.id, {
    onDelete: "cascade",
  }),
});

export const unit = createTable("unit", {
  id,
  unitTypeId: uuid("unit_type_id").references(() => unitType.id),
  unitName: varchar("unit_name", { length: 16 }).notNull(),
  occupied: boolean("occupied").default(false).notNull(),
  propertyId: uuid("property_id").references(() => property.id, {
    onDelete: "cascade",
  }),
});

export const paymentMethodEnum = pgEnum("payment_method", [
  "mpesa",
  "bank_transfer",
]);

export const payment = createTable("payment", {
  referenceNumber: varchar("reference_no").primaryKey(),
  amount: integer("amount").notNull(),
  paidAt: timestamp("paid_at").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentReference: varchar("payment_reference", { length: 256 }).notNull(),

  unitId: uuid("unit_id").references(() => unit.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id").references(() => tenant.id, {
    onDelete: "cascade",
  }),
});
