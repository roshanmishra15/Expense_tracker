
# 💰 Expense Tracker - Full-Stack Application

A modern, full-stack personal finance application designed to help you track your income and expenses with ease. View detailed analytics, manage transactions, and gain insights into your spending habits.

**🔗 Live Demo:** [Expense Tracker App](https://expense-tracker-n4yw.onrender.com)

---

## 📖 About The Project

This project is a complete web application built with a modern tech stack. The backend is a robust REST API powered by **Node.js** and **Express**, connected to a **PostgreSQL** database via **Drizzle ORM**. The frontend is a responsive and interactive **React + Vite** single-page application.

---

## ✨ Key Features

- ✅ **User Authentication**: Secure registration & login using JWT.  
- ✅ **Role-Based Access**: Pre-seeded demo users with `admin`, `user`, and `read-only` roles.  
- ✅ **Transaction Management**: Full CRUD for income and expenses.  
- ✅ **Dynamic Filtering & Sorting**: Search, filter, sort, and paginate transactions.  
- ✅ **Data Analytics**: Dashboard with insights on spending and income trends.  
- ✅ **Category Management**: Pre-seeded categories for quick setup.  
- ✅ **Admin Panel**: Admins can view all registered users.  

---

## 🛠️ Built With

### Frontend
- ⚛️ [React](https://react.dev/) – UI library  
- ⚡ [Vite](https://vitejs.dev/) – Build tool  
- 🔄 [TanStack Query](https://tanstack.com/query/latest) – Data fetching & state management  
- 🎨 [shadcn/ui](https://ui.shadcn.com/) – UI components  
- 📝 [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) – Form handling & validation  
- 🌐 [Wouter](https://github.com/molefrog/wouter) – Lightweight router  

### Backend
- 🚀 [Node.js](https://nodejs.org/) – JavaScript runtime  
- 🧩 [Express](https://expressjs.com/) – Web framework  
- 🗄️ [PostgreSQL](https://www.postgresql.org/) – Relational database  
- 🗃️ [Drizzle ORM](https://orm.drizzle.team/) – TypeScript-first ORM  
- 🔑 [JWT](https://jwt.io/) – Authentication  
- 🔐 [bcrypt.js](https://www.npmjs.com/package/bcryptjs) – Password hashing  

---

## 🚀 Getting Started

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v18+)  
- [npm](https://www.npmjs.com/)  
- [PostgreSQL](https://www.postgresql.org/download/)  

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/roshanmishra15/Expense_tracker.git
````

2. **Navigate into the project**

   ```bash
   cd Expense_tracker
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Configure environment variables**
   Create a `.env` file in the root:

   ```env
   DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/expensetracker_db"
   SESSION_SECRET="your_super_secret_string_here"
   ```

5. **Apply database schema**

   ```bash
   npm run db:push
   ```

6. **Run the development server**

   ```bash
   npm run dev
   ```

   Now open: [http://localhost:5000](http://localhost:5000)

   > Demo users are auto-seeded:
   >
   > * `admin@demo.com`
   > * `user@demo.com`

---

## 📜 Available Scripts

* `npm run dev` → Start development server
* `npm run build` → Build for production
* `npm run start` → Run production server
* `npm run db:push` → Push schema to database

---

## ☁️ Deployment

This project is configured for **Render** deployment.

1. Push your code to GitHub
2. Provision a managed PostgreSQL database (e.g., [Neon](https://neon.tech/))
3. Create a new **Web Service** on Render and connect GitHub repo
4. Configure:

   * **Build Command**:

     ```bash
     npm install && npm run build
     ```
   * **Start Command**:

     ```bash
     node dist/index.js
     ```
   * **Environment Variables**:

     * `DATABASE_URL` → from your hosted DB
     * `SESSION_SECRET` → a secure random string
5. Deploy 🚀

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

## 👤 Contact

**Roshan Mishra**
🔗 GitHub: [@roshanmishra15](https://github.com/roshanmishra15)
📂 Project Repo: [Expense Tracker](https://github.com/roshanmishra15/Expense_tracker)

