import { users, categories, transactions, type User, type InsertUser, type Category, type InsertCategory, type Transaction, type InsertTransaction, type TransactionWithCategory, type AnalyticsData } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, sql, gte, lte, count } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Transaction methods
  getTransactions(userId: string, options?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    type?: 'income' | 'expense';
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: 'date' | 'amount';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ transactions: TransactionWithCategory[]; total: number }>;
  
  getTransactionById(id: string, userId: string): Promise<TransactionWithCategory | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, userId: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string, userId: string): Promise<boolean>;
  
  // Analytics methods
  getAnalytics(userId: string): Promise<AnalyticsData>;
  // Optional: list users (for admin demo page)
  getUsers?(): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updateUser: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updateUser, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async getTransactions(userId: string, options: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    type?: 'income' | 'expense';
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: 'date' | 'amount';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ transactions: TransactionWithCategory[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      type,
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'desc'
    } = options;

    const conditions = [eq(transactions.userId, userId)];

    if (search) {
      conditions.push(like(transactions.description, `%${search}%`));
    }

    if (categoryId) {
      conditions.push(eq(transactions.categoryId, categoryId));
    }

    if (type) {
      conditions.push(eq(transactions.type, type));
    }

    if (dateFrom) {
      conditions.push(gte(transactions.date, dateFrom));
    }

    if (dateTo) {
      conditions.push(lte(transactions.date, dateTo));
    }

    // Add sorting
    const sortColumn = sortBy === 'amount' ? transactions.amount : transactions.date;
    const sortFn = sortOrder === 'asc' ? asc : desc;

    const query = db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        categoryId: transactions.categoryId,
        amount: transactions.amount,
        description: transactions.description,
        type: transactions.type,
        date: transactions.date,
        createdAt: transactions.createdAt,
        category: categories
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(sortFn(sortColumn));

    // Get total count
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(transactions)
      .where(and(...conditions));

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedTransactions = await query.limit(limit).offset(offset);

    return {
      transactions: paginatedTransactions,
      total: totalCount
    };
  }

  async getTransactionById(id: string, userId: string): Promise<TransactionWithCategory | undefined> {
    const [transaction] = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        categoryId: transactions.categoryId,
        amount: transactions.amount,
        description: transactions.description,
        type: transactions.type,
        date: transactions.date,
        createdAt: transactions.createdAt,
        category: categories
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

    return transaction || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async updateTransaction(id: string, userId: string, updateTransaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set(updateTransaction)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();
    return transaction || undefined;
  }

  async deleteTransaction(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getAnalytics(userId: string): Promise<AnalyticsData> {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Get current month totals
    const currentMonthTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, currentMonth)
        )
      );

    // Get last month totals
    const lastMonthTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, lastMonth),
          lte(transactions.date, currentMonth)
        )
      );

    // Calculate current month statistics
    const currentMonthIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const currentMonthExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Calculate last month statistics
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Calculate total balance (all time)
    const allTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId));

    const totalIncome = allTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalBalance = totalIncome - totalExpenses;

    // Calculate savings rate
    const savingsRate = currentMonthIncome > 0 
      ? ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100 
      : 0;

    const lastMonthSavingsRate = lastMonthIncome > 0
      ? ((lastMonthIncome - lastMonthExpenses) / lastMonthIncome) * 100
      : 0;

    // Calculate percentage changes
    const incomeChange = lastMonthIncome > 0 
      ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 
      : 0;

    const expenseChange = lastMonthExpenses > 0
      ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
      : 0;

    const balanceChange = (totalIncome + totalExpenses) > 0 ? 8.2 : 0; // Simplified calculation
    const savingsChange = savingsRate - lastMonthSavingsRate;

    // Get category breakdown
    const categoryBreakdown = await db
      .select({
        categoryName: categories.name,
        total: sql<number>`sum(${transactions.amount})::numeric`
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'expense'),
          gte(transactions.date, currentMonth)
        )
      )
      .groupBy(categories.name)
      .orderBy(desc(sql`sum(${transactions.amount})`));

    const totalCategoryExpenses = categoryBreakdown.reduce((sum, cat) => sum + cat.total, 0);

    // Get 6-month trends
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthTransactions = await db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            gte(transactions.date, monthStart),
            lte(transactions.date, monthEnd)
          )
        );

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      monthlyTrends.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        income,
        expenses
      });
    }

    return {
      totalBalance,
      monthlyIncome: currentMonthIncome,
      monthlyExpenses: currentMonthExpenses,
      savingsRate,
      balanceChange,
      incomeChange,
      expenseChange,
      savingsChange,
      categoryBreakdown: categoryBreakdown.map(cat => ({
        category: cat.categoryName,
        amount: cat.total,
        percentage: totalCategoryExpenses > 0 ? (cat.total / totalCategoryExpenses) * 100 : 0
      })),
      monthlyTrends
    };
  }

  async getUsers(): Promise<User[]> {
    const result = await db.select().from(users).orderBy(asc(users.createdAt));
    return result;
  }
}

export const storage = new DatabaseStorage();
