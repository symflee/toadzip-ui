import {
  bigint,
  check,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { desc, sql } from "drizzle-orm";

export const showcaseDesigns = pgTable(
  "showcase_designs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    viewId: varchar("view_id", { length: 40 }).notNull(),
    sequence: bigint("sequence", { mode: "number" })
      .generatedAlwaysAsIdentity()
      .notNull(),
    submissionKey: uuid("submission_key").notNull().unique(),
    title: varchar("title", { length: 80 }).notNull(),
    description: varchar("description", { length: 300 }),
    html: text("html").notNull(),
    css: text("css").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      "showcase_designs_view_id_check",
      sql`${table.viewId} in ('notice-card', 'notice-list', 'notice-detail', 'complex-card', 'complex-list', 'complex-detail', 'map-marker', 'top-bar')`,
    ),
    index("showcase_designs_view_sequence_idx").on(table.viewId, desc(table.sequence)),
  ],
);

export type ShowcaseDesignRow = typeof showcaseDesigns.$inferSelect;
export type NewShowcaseDesignRow = typeof showcaseDesigns.$inferInsert;
