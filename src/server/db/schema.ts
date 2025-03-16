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

export const prpoertyOwner = createTable(
  "property_owner",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    firstName: varchar("first_name", { length: 256 }).notNull(),
    lastName: varchar("last_name", { length: 256 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 256 }).notNull(),
    email: varchar("name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    firstNameIndex: index("owner_first_name_idx").on(table.firstName),
  }),
);

export const property = createTable(
  "property",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    name: varchar("name", { length: 256 }).notNull(),
    ownerId: uuid("owner_id").references(() => prpoertyOwner.id),
    bankAccountNo: varchar("bank_account_no", { length: 256 }).notNull(),
    // address: varchar("name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    nameIndex: index("property_name_idx").on(table.name),
  }),
);

export const tenant = createTable("tenant", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v7()`),
  unit_id: uuid("unit_id").references(() => property.id),
  firstName: varchar("first_name", { length: 256 }).notNull(),
  lastName: varchar("last_name", { length: 256 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  moveInDate: date("move_in_date").notNull(),
  moveOutDate: date("move_out_date"),
  cumulativeRentPaid: integer("cumulative_amount").notNull(),
});

export const unitTypeEnum = pgEnum("unit_type", [
  "single_room",
  "bedsitter",
  "one_bedroom",
  "two_bedroom",
  "three_bedroom",
]);

export const unit = createTable("unit", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v7()`),
  propertyId: uuid("property_id").references(() => property.id),
  unitType: unitTypeEnum("unit_type").notNull(),
  unitName: varchar("unit_name", { length: 256 }).notNull(),
  rentPerMonth: integer("rent_per_month").notNull(),
  occupied: boolean("occupied").default(false),
});

export const paymentMethodEnum = pgEnum("payment_method", [
  "mpesa",
  "bank_transfer",
]);

export const payment = createTable("payment", {
  referenceNumber: varchar("reference_no").primaryKey(),
  unitId: uuid("unit_id").references(() => unit.id),
  tenantId: uuid("tenant_id").references(() => tenant.id),
  amount: integer("amount").notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentReference: varchar("payment_reference", { length: 256 }).notNull(),
});
