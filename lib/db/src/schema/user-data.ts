import { pgTable, text, jsonb, timestamp, unique } from "drizzle-orm/pg-core";

export const userDataTable = pgTable(
  "user_data",
  {
    userId: text("user_id").notNull(),
    key: text("key").notNull(),
    data: jsonb("data"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [unique("user_data_uid_key_uniq").on(t.userId, t.key)],
);

export type UserDataRow = typeof userDataTable.$inferSelect;
