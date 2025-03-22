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
  (table) => ({
    firstNameIndex: index("owner_first_name_idx").on(table.firstName),
    lastNameIndex: index("owner_last_name_idx").on(table.lastName),
  }),
);

export const property = createTable(
  "property",
  {
    id,
    name: varchar("name", { length: 64 }).notNull(),
    // address: varchar("address", { length: 64 }).notNull(),
    bankAccountNo: varchar("bank_account_no", { length: 32 }).notNull(),
    createdAt,

    ownerId: varchar("owner_id", { length: 32 }).references(
      () => propertyOwner.id,
    ),
  },
  (table) => ({
    nameIndex: index("property_name_idx").on(table.name),
  }),
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

    unitId: uuid("unit_id").references(() => property.id),
  },
  (table) => ({
    firstNameIndex: index("tenant_first_name_idx").on(table.firstName),
    lastNameIndex: index("tenant_last_name_idx").on(table.lastName),
  }),
);

export const unitTypeEnum = pgEnum("unit_type", [
  "single_room",
  "bedsitter",
  "one_bedroom",
  "two_bedroom",
  "three_bedroom",
]);

export const unit = createTable("unit", {
  id,
  unitName: varchar("unit_name", { length: 16 }).notNull(),
  unitType: unitTypeEnum("unit_type").notNull(),
  rentPerMonth: integer("rent_per_month").notNull(),
  occupied: boolean("occupied").default(false).notNull(),

  propertyId: uuid("property_id").references(() => property.id),
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

  unitId: uuid("unit_id").references(() => unit.id),
  tenantId: uuid("tenant_id").references(() => tenant.id),
});
