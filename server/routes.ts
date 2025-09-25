import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticate, authorize, hashPassword, comparePassword, generateToken, AuthRequest } from "./middleware/auth";
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { insertUserSchema, insertTransactionSchema, insertCategorySchema } from "@shared/schema";
import rateLimit from 'express-rate-limit';

// Rate limiting configurations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later',
  skip: () => process.env.NODE_ENV !== 'production' || process.env.RATE_LIMIT_DISABLE === '1'
});

const transactionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour
  message: 'Too many requests, please try again later',
  skip: () => process.env.NODE_ENV !== 'production' || process.env.RATE_LIMIT_DISABLE === '1'
});

const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 requests per hour
  message: 'Too many requests, please try again later',
  skip: () => process.env.NODE_ENV !== 'production' || process.env.RATE_LIMIT_DISABLE === '1'
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Initialize default categories
  const initializeCategories = async () => {
    const categories = await storage.getCategories();
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Food & Dining', icon: 'fas fa-utensils', color: '#ef4444', type: 'expense' as const },
        { name: 'Transportation', icon: 'fas fa-car', color: '#f97316', type: 'expense' as const },
        { name: 'Entertainment', icon: 'fas fa-film', color: '#8b5cf6', type: 'expense' as const },
        { name: 'Shopping', icon: 'fas fa-shopping-bag', color: '#ec4899', type: 'expense' as const },
        { name: 'Utilities', icon: 'fas fa-bolt', color: '#06b6d4', type: 'expense' as const },
        { name: 'Healthcare', icon: 'fas fa-heart', color: '#10b981', type: 'expense' as const },
        { name: 'Education', icon: 'fas fa-graduation-cap', color: '#3b82f6', type: 'expense' as const },
        { name: 'Salary', icon: 'fas fa-dollar-sign', color: '#22c55e', type: 'income' as const },
        { name: 'Freelance', icon: 'fas fa-laptop', color: '#84cc16', type: 'income' as const },
        { name: 'Investment', icon: 'fas fa-chart-line', color: '#f59e0b', type: 'income' as const },
        { name: 'Other', icon: 'fas fa-ellipsis-h', color: '#6b7280', type: 'expense' as const }
      ];

      for (const category of defaultCategories) {
        await storage.createCategory(category);
      }
    }
  };

  await initializeCategories();

  // Seed demo users if they don't exist
  const seedDemoUsers = async () => {
    const demoUsers = [
      { username: 'admin', email: 'admin@demo.com', password: 'admin123', name: 'Admin User', role: 'admin' as const },
      { username: 'user', email: 'user@demo.com', password: 'user123', name: 'Demo User', role: 'user' as const },
      { username: 'readonly', email: 'readonly@demo.com', password: 'readonly123', name: 'Read Only', role: 'read-only' as const },
    ];

    for (const u of demoUsers) {
      const existing = await storage.getUserByEmail(u.email);
      if (!existing) {
        const hashed = await hashPassword(u.password);
        await storage.createUser({
          username: u.username,
          email: u.email,
          password: hashed,
          name: u.name,
          role: u.role,
        });
      }
    }
  };

  await seedDemoUsers();

  // Authentication routes
  app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
      const { username, email, password, name, role = 'user' } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        name,
        role
      });

      const token = generateToken(user);
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid input data' });
    }
  });

  // Removed rate limiter on login to avoid blocking local testing
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user);
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/auth/me', authenticate, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Categories routes
  app.get('/api/categories', authenticate, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  app.post('/api/categories', authenticate, authorize(['admin']), async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: 'Invalid category data' });
    }
  });

  // Transaction routes
  app.get('/api/transactions', authenticate, transactionLimiter, async (req: AuthRequest, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const categoryId = req.query.categoryId as string;
      const type = req.query.type as 'income' | 'expense';
      const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
      const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;
      const sortBy = req.query.sortBy as 'date' | 'amount' || 'date';
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

      const result = await storage.getTransactions(req.user!.id, {
        page,
        limit,
        search,
        categoryId,
        type,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  });

  app.get('/api/transactions/:id', authenticate, async (req: AuthRequest, res) => {
    try {
      const transaction = await storage.getTransactionById(req.params.id, req.user!.id);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch transaction' });
    }
  });

  app.post('/api/transactions', authenticate, authorize(['admin', 'user']), transactionLimiter, async (req: AuthRequest, res) => {
    try {
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof ZodError) {
        const pretty = fromZodError(error);
        return res.status(400).json({ message: 'Invalid transaction data', details: pretty.message, issues: error.issues });
      }
      const message = error instanceof Error ? error.message : 'Invalid transaction data';
      res.status(400).json({ message });
    }
  });

  app.put('/api/transactions/:id', authenticate, authorize(['admin', 'user']), transactionLimiter, async (req: AuthRequest, res) => {
    try {
      const transactionData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(req.params.id, req.user!.id, transactionData);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: 'Invalid transaction data' });
    }
  });

  app.delete('/api/transactions/:id', authenticate, authorize(['admin', 'user']), transactionLimiter, async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteTransaction(req.params.id, req.user!.id);
      if (!success) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete transaction' });
    }
  });

  // Analytics routes
  app.get('/api/analytics', authenticate, analyticsLimiter, async (req: AuthRequest, res) => {
    try {
      const analytics = await storage.getAnalytics(req.user!.id);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  // Admin routes
  app.get('/api/admin/users', authenticate, authorize(['admin']), async (_req, res) => {
    try {
      // Basic stub for demo: return all users' public info
      const users = await storage.getUsers?.();
      if (users) {
        res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
      } else {
        res.json({ message: 'Users listing not implemented in storage' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
