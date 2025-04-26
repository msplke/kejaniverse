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
  firstName: varchar("first_name", { length: 16 }).notNull(),
  lastName: varchar("last_name", { length: 16 }).notNull(),
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
    name: varchar("name", { length: 64 }).notNull(),
    // address: varchar("address", { length: 64 }).notNull(),
    bankCode: varchar("bank_code", { length: 3 }).notNull(),
    bankAccountNumber: varchar("bank_account_number", { length: 32 }).notNull(),
    subaccountCode: varchar("subaccount_code", { length: 32 }).notNull(),
    createdAt,
    ownerId: varchar("owner_id", { length: 32 })
      .references(() => propertyOwner.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    {
      nameIndex: index("property_name_idx").on(table.name),
      subaccountIndex: index("property_subaccount_idx").on(
        table.subaccountCode,
      ),
    },
  ],
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
    unitId: varchar("unit_id", { length: 6 })
      .references(() => unit.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    {
      firstNameIndex: index("tenant_first_name_idx").on(table.firstName),
      lastNameIndex: index("tenant_last_name_idx").on(table.lastName),
      unitIdIndex: index("tenant_unit_id_idx").on(table.unitId),
    },
  ],
);

export const unitTypeEnumValues = [
  "Single-room",
  "Bedsitter",
  "One-bedroom",
  "Two-bedroom",
  "Three-bedroom",
] as const;
const unitTypeEnum = pgEnum("unit_type_enum", unitTypeEnumValues);

export const unitType = createTable("unit_type", {
  id,
  unitType: unitTypeEnum("unit_type").notNull(),
  rentPrice: integer("rent_price").notNull(),
  propertyId: uuid("property_id")
    .references(() => property.id, { onDelete: "cascade" })
    .notNull(),
});

export const unit = createTable(
  "unit",
  {
    id: varchar("id", { length: 6 }).primaryKey(),
    unitName: varchar("unit_name", { length: 16 }).notNull(),
    occupied: boolean("occupied").default(false).notNull(),

    unitTypeId: uuid("unit_type_id")
      .references(() => unitType.id)
      .notNull(),
    propertyId: uuid("property_id")
      .references(() => property.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    {
      unitNameIndex: index("unit_name_idx").on(table.unitName),
      propertyIdIndex: index("unit_property_id_idx").on(table.propertyId),
    },
  ],
);

export const paymentMethodEnum = pgEnum("payment_method", [
  "mpesa",
  "bank_transfer",
]);

export const payment = createTable(
  "payment",
  {
    referenceNumber: varchar("reference_no").primaryKey(),
    amount: integer("amount").notNull(),
    paidAt: timestamp("paid_at").notNull(),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    paymentReference: varchar("payment_reference", { length: 256 }).notNull(),

    unitId: varchar("unit_id", { length: 6 })
      .references(() => unit.id, { onDelete: "cascade" })
      .notNull(),
    tenantId: uuid("tenant_id").references(() => tenant.id, {
      onDelete: "cascade",
    }),
  },
  (table) => [
    {
      unitIdIndex: index("payment_unit_id_idx").on(table.unitId),
      tenantIdIndex: index("payment_tenant_id_idx").on(table.tenantId),
    },
  ],
);
