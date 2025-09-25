import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum('user_role', ['admin', 'user', 'read-only']);
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense']);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default('user'),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  type: transactionTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  categoryId: varchar("category_id").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  type: transactionTypeEnum("type").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions)
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions)
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id]
  })
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const selectUserSchema = createSelectSchema(users);

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true
});

export const selectCategorySchema = createSelectSchema(categories);

export const insertTransactionSchema = createInsertSchema(transactions)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    amount: z
      .union([z.string(), z.number()])
      .transform((value) => {
        const asNumber = typeof value === 'number' ? value : parseFloat(value);
        if (Number.isNaN(asNumber)) {
          throw new Error('Amount must be a valid number');
        }
        return asNumber.toFixed(2);
      }),
    date: z.string().transform((str) => new Date(str)),
  });

export const selectTransactionSchema = createSelectSchema(transactions);

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export interface TransactionWithCategory extends Transaction {
  category: Category;
}

export interface AnalyticsData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  balanceChange: number;
  incomeChange: number;
  expenseChange: number;
  savingsChange: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
}
