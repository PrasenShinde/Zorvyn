# 💰 Finance Dashboard & Access Control System

A complete full-stack application designed to securely manage financial records with strict **Role-Based Access Control (RBAC)**. This project features a robust Node.js/Express backend and a modern, responsive React frontend.

---

## 🌟 Project Overview

This project serves as a financial management hub where users can track income, expenses, and view visual analytics. The system natively enforces access control based on three distinct user roles:

* **👑 Admin:** Has full system access. Can create, view, update, and soft-delete any financial record. Can also manage users.
* **📊 Analyst:** Can view data and access the dashboard. They can only see and interact with records they created themselves.
* **👀 Viewer:** Can only view the summary-level dashboard and analytics. They are restricted from seeing the raw data tables or making modifications.

---

## 📁 Project Structure

This repository is split into two main directories:

### 🔙 1. Backend (`/backend`)
A production-ready REST API built using **Node.js**, **TypeScript**, and **Express**. It uses **Prisma** as the ORM with a localized **SQLite** database. It features secure JWT authentication, Zod validation, rate limiting, and centralized error handling.

> 💡 **Note:** A dedicated and highly detailed README with setup instructions, environment variables, and API maps can be found inside the `backend/` folder.

### 🎨 2. Frontend (`/frontend`)
An interactive user dashboard built with **React**, **Vite**, and **Tailwind CSS**. It communicates with the backend using Axios interceptors to automatically pass user authentication tokens.

> 💡 **Note:** A dedicated README explaining component structures, state management, and the setup process can be found inside the `frontend/` folder.

---

## 🚀 Quick Start Guide

To get the full project running on your local machine, follow these summarized steps:

### 🔌 Running the Backend
1. Open your terminal and navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Initialize the database and run migrations: `npx prisma migrate dev`
4. **Seed the database** (Creates mock users and financial data): `npm run db:seed`
5. Start the server: `npm run dev`

### 💻 Running the Frontend
1. Open a new terminal and navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

---

## 🔑 Demo Credentials

Once you have run the seed script on the backend (`npm run db:seed`), you can log into the frontend using any of these test accounts. 

**The password for all accounts is:** `Password123!`

* **Admin Access:** `admin@zorvyn.local`
* **Analyst Access:** `analyst@zorvyn.local`
* **Viewer Access:** `viewer@zorvyn.local`

---

## ⚖️ Key Design Trade-offs Considered

* **SQLite String for Money:** Prisma does not support the native `Decimal` type on SQLite. To preserve exact precision and avoid floating-point rounding errors typical of financial applications, amounts are stored as strings and validated strictly via regular expressions.
* **In-Memory Aggregation for Dashboard:** To maintain database agility on SQLite without relying on complex, engine-specific SQL casting functions, analytical processing was moved to the service layer. In a production environment with PostgreSQL, this would be refactored to native database `SUM()` and `GROUP BY` aggregations.
