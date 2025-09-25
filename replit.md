# Personal Finance Tracker

## Overview

A full-stack Personal Finance Tracker application built with React, Node.js, Express, and PostgreSQL. The application allows users to manage their income and expenses with role-based access control, real-time analytics, and comprehensive transaction management features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety and modern React patterns
- **Vite** as the build tool for fast development and optimized production builds
- **Wouter** for lightweight client-side routing
- **Tailwind CSS** with shadcn/ui components for consistent, accessible UI design
- **TanStack Query** for server state management, caching, and data fetching
- **React Hook Form** with Zod validation for form handling and validation
- **Chart.js** for data visualization and analytics charts

### Backend Architecture
- **Express.js** REST API with TypeScript
- **Modular route structure** with centralized error handling and logging middleware
- **JWT-based authentication** with role-based access control (admin, user, read-only)
- **Rate limiting** implemented for security (different limits for auth, transactions, and analytics)
- **Bcrypt** for secure password hashing
- **Express sessions** with connect-pg-simple for session storage

### Database Design
- **PostgreSQL** as the primary database
- **Drizzle ORM** for type-safe database operations and migrations
- **Neon Database** integration for serverless PostgreSQL hosting
- **Schema design** includes users, categories, and transactions tables with proper relationships
- **Default categories** are automatically seeded on application startup

### Authentication & Authorization
- **Three-tier role system**: admin (full access), user (own data only), read-only (view only)
- **JWT tokens** with 7-day expiration for authentication
- **Protected routes** on both frontend and backend
- **Middleware-based authorization** restricting API endpoints based on user roles

### State Management
- **Context API** for global state (authentication, theme)
- **TanStack Query** for server state with intelligent caching strategies
- **Local storage** for persisting authentication tokens and user preferences

### UI/UX Design
- **Responsive design** with mobile-first approach
- **Dark/light theme support** with system preference detection
- **shadcn/ui component library** for consistent, accessible components
- **Loading states and skeletons** for better user experience
- **Toast notifications** for user feedback

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web framework for Node.js backend
- **jsonwebtoken**: JWT token generation and verification
- **bcryptjs**: Password hashing and comparison

### Frontend UI Libraries
- **@radix-ui/***: Headless UI components for accessibility
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router
- **chart.js**: Data visualization library
- **react-chartjs-2**: React wrapper for Chart.js

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the application
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form handling and validation
- **Zod**: Runtime type validation

### Security & Performance
- **express-rate-limit**: Rate limiting middleware
- **connect-pg-simple**: PostgreSQL session store
- **class-variance-authority**: Type-safe component variants
- **date-fns**: Date manipulation and formatting

The application follows a clean separation of concerns with shared types between frontend and backend, comprehensive error handling, and scalable architecture patterns suitable for a production finance application.