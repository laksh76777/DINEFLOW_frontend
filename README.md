# 🍽️ DineFlow - Smart Restaurant & Table Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646cff.svg)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248.svg)](https://mongoosejs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-white.svg)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **DineFlow** is an enterprise-grade, end-to-end digital restaurant operations platform. It unifies QR-based collaborative customer mobile dining, station-routed Kitchen Display Systems (KDS), waiter dispatch terminals, live 2D restaurant floor management, server-side split billing with PDFKit invoicing, a simulated payment gateway (**DineFlow Pay**), and an executive operations dashboard powered by Recharts and Google Gemini AI.

---

## 📑 Table of Contents

- [Architectural Highlights](#-architectural-highlights)
- [System Modules & Phases](#-system-modules--phases)
  - [1. Collaborative Mobile Dining (Phases 7 & 8)](#1-collaborative-mobile-dining)
  - [2. Kitchen Display System - KDS (Phase 9)](#2-kitchen-display-system-kds)
  - [3. Waiter Floor Terminal (Phase 10)](#3-waiter-floor-terminal)
  - [4. Live Floor & Table Visualizer (Phase 11)](#4-live-floor--table-visualizer)
  - [5. Split Billing & PDF Invoicing (Phase 12)](#5-split-billing--pdf-invoicing)
  - [6. DineFlow Pay Demo Checkout (Phase 13)](#6-dineflow-pay-demo-checkout)
  - [7. Executive Analytics & AI Advisor (Phase 14)](#7-executive-analytics--ai-advisor)
- [Tech Stack](#-tech-stack)
- [Directory Structure](#-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Default Demo Roles & Credentials](#-default-demo-roles--credentials)
- [API Endpoints](#-api-endpoints)
- [Contributing & License](#-contributing--license)

---

## 🌟 Architectural Highlights

- **Server-Authoritative Calculation**: Frontend totals are never trusted for orders or bills. All item pricing, GST tax rates, service charges, and split amounts are recalculated strictly from immutable database records.
- **Bi-Directional Real-Time Synchronization**: Backed by **Socket.IO** rooms (`session_*`, `table_*`, `kitchen_station_*`, `staff_channel`).
- **Simulated Payment Gateway (DineFlow Pay)**: Fully functional checkout demonstration with zero external vendor dependencies, predictable test switches, and instant PDF invoice generation.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions across `OWNER`, `MANAGER`, `KITCHEN`, and `WAITER`.

---

## 🚀 System Modules & Phases

### 1. Collaborative Mobile Dining
- **QR Onboarding**: Seating verified via encrypted table QR tokens (`/welcome?token=...`).
- **Multi-Guest Cart Attribution**: Multiple guests at the same table can browse together, add dishes under their own names, and dispatch rounds.
- **Dietary & Category Navigation**: Filter dishes instantly across Pure Veg, Non-Veg, Vegan, Chef Specials, and spice indicators (1-3 Flame levels).
- **Rounds System**: Support for appetizers in Round 1, mains in Round 2, desserts in Round 3 with step-by-step progress tracking.

### 2. Kitchen Display System (KDS)
- **Culinary Station Dispatch**: Order tickets automatically partition items by station (`Main Kitchen`, `Grill`, `Beverage`, `Dessert`).
- **Kanban Ticket Progression**: 4 distinct state columns (`NEW` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `READY`).
- **Audio Chimes**: Web Audio API sound alerts for incoming tickets with a global mute toggle.

### 3. Waiter Floor Terminal
- **Instant Guest Assistance Alerts**: Water, Extra Cutlery, Call Waiter, Request Bill, and custom notes.
- **Service Request Management**: Lifecycle states (`REQUESTED` ➔ `ACCEPTED` ➔ `IN_PROGRESS` ➔ `COMPLETED`).
- **Ready Food Delivery**: Alerts service staff immediately when dishes hit `READY` on kitchen lines.

### 4. Live Floor & Table Visualizer
- **Visual Floor Map**: Live status badges across all tables (`AVAILABLE`, `ACTIVE`, `ORDERING`, `PREPARING`, `READY`, `SERVING`, `PAYMENT_PENDING`).
- **Table Inspection Modal**: Deep-dive into active diners, session duration, itemized order timeline, running bill total, and waiter requests.

### 5. Split Billing & PDF Invoicing
- **Multi-Mode Split Billing**:
  - **Full Bill**: Settle the entire table session.
  - **Own Items**: Settle only the dishes ordered under the diner's personal identity + proportional tax.
  - **Equal Split**: Split bill evenly among $N$ dining companions with an interactive stepper.
  - **Custom Split**: Enter an arbitrary amount with server-side validation against remaining balance.
- **Official PDFKit Tax Invoices**: Generates GST-compliant, formatted tax invoices downloadable as PDF files (`/api/payments/invoice/:sessionId`).

### 6. DineFlow Pay Demo Checkout
- **Strict Constraint**: Completely simulated demo experience. **Zero external payment APIs** (No Razorpay SDK, No Stripe, No external credentials).
- **Payment Methods**:
  - **UPI**: `[ example@upi ]` (with quick shortcut tags)
  - **Cards**: Card number, expiry, CVV, cardholder name
  - **Net Banking**: Bank selector dropdown
- **Predictable Test Toggle**: Allows test evaluators to switch between `[✓ Simulate Success]` and `[× Simulate Failure]` flows.
- **Demo Transaction ID**: Auto-generates identifiers in the format `DF-DEMO-XXXXXX`.

### 7. Executive Analytics & AI Advisor
- **Telemetry Event Logging**: Tracks `QR_SCAN`, `SESSION_STARTED`, `SESSION_JOINED`, `MENU_VIEW`, `ITEM_VIEW`, `ADD_TO_CART`, `ORDER_CREATED`, `ORDER_COMPLETED`, `PAYMENT_SUCCESS`, `SESSION_COMPLETED`, and `STAFF_REQUEST`.
- **Interactive Recharts Dashboard**:
  - **Date Filters**: `Today` | `Last 7 Days` | `Last 30 Days` | `All Time`.
  - **Animated KPI Counters**: Settled Revenue, Total Orders, Average Order Value (AOV), Floor Occupancy, Average Session Duration, and Average Preparation Time.
  - **Charts**: Hourly Sales & Rush Trend (AreaChart), Kitchen Station Workload (Pie/Donut Chart), Popular Dishes vs. Telemetry Views (Vertical BarChart), Table Turnover (BarChart), and Sold-Out Inventory Alerts.
- **Gemini AI Operations Advisor**: Executive insights powered by Google Gemini 1.5 Flash (with intelligent heuristic engine fallback).

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide Icons, Canvas-Confetti |
| **State & Networking** | Zustand, Socket.IO Client, Fetch API |
| **Backend** | Node.js, Express, TypeScript, Mongoose, Socket.IO Server, PDFKit, Multer, Helmet, Rate Limiter |
| **Database** | MongoDB (supports MongoDB Atlas and local instance) |
| **AI Integration** | Google Gemini 1.5 Flash API |

---

## 📁 Directory Structure

```text
dineflow/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Cloudinary, Redis, Constants
│   │   ├── controllers/     # Analytics, Auth, Menu, Order, Payment, Session, Table, Staff
│   │   ├── middleware/      # Auth, Rate Limiter, Validation, Error Handler
│   │   ├── models/          # Mongoose Schemas (Invoice, Payment, Order, Table, User, etc.)
│   │   ├── routes/          # Express REST API routes
│   │   ├── scripts/         # Seed script for realistic restaurant mock data
│   │   ├── services/        # AI Service, Cloudinary, etc.
│   │   ├── sockets/         # Socket.IO event broadcaster & listeners
│   │   ├── utils/           # PDFKit invoice generator, Token generator, Logger
│   │   ├── app.ts           # Express Application configuration
│   │   └── server.ts        # HTTP & WebSocket bootstrap
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # UI component library (Buttons, Cards, Modals, Badges, Tables)
│   │   ├── layouts/         # Role-specific layouts (Customer, Kitchen, Waiter, Manager, Owner)
│   │   ├── pages/           # CustomerMenuPage, FloorPlanPage, KitchenDashboard, OwnerDashboard, etc.
│   │   ├── services/        # Frontend API services (paymentService, analyticsService, etc.)
│   │   ├── stores/          # Zustand stores (useAuthStore, useCartStore, useToastStore)
│   │   ├── utils/           # Web Audio API sound alert manager
│   │   ├── App.tsx          # Router configuration
│   │   └── main.tsx         # React bootstrap
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── .gitignore               # Clean, root Git ignore rules
└── README.md                # System documentation
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or a MongoDB Atlas URI
- **Git**

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` if using a custom MongoDB connection string or custom port.*

4. **Seed Mock Restaurant Data**:
   Populates the database with categories, gourmet dishes, active tables with QR tokens, and role-based staff accounts:
   ```bash
   npm run seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   *Backend starts at `http://localhost:5000` with WebSockets enabled.*

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   *Frontend dev server starts at `http://localhost:5173`.*

---

## 👥 Default Demo Roles & Credentials

When seeded via `npm run seed`, you can sign in directly or use the role switcher in the UI:

| Role | Email | Password | Primary Views |
|---|---|---|---|
| **Owner** | `owner@dineflow.com` | `dineflow123` | Executive Analytics, Recharts Dashboard, Staff Roster |
| **Manager** | `manager@dineflow.com` | `dineflow123` | Floor Overview, Active Shift Management, Staff Oversight |
| **Line Chef** | `chef@dineflow.com` | `dineflow123` | Kitchen Display System (KDS), Station Ticket Queues |
| **Waiter** | `waiter@dineflow.com` | `dineflow123` | Floor Assistance, Bill Drops, Ready Dish Delivery |
| **Guest Diner** | *Scans table QR code* | *N/A* | Interactive Mobile Menu, Collaborative Cart, DineFlow Pay |

---

## 📡 API Endpoints

### 💳 Payments & Invoicing
- `GET /api/payments/bill/:sessionId` - Compute server-authoritative bill breakdown across all split modes (`FULL`, `OWN_ITEMS`, `EQUAL`, `CUSTOM`).
- `POST /api/payments/demo/create` - Initialize a simulated DineFlow Pay demo transaction.
- `POST /api/payments/demo/confirm` - Confirm demo payment, generate `DF-DEMO-XXXXXX`, and update table session.
- `GET /api/payments/:id` - Fetch payment and linked invoice record.
- `GET /api/payments/invoice/:sessionId` - Stream or download official PDFKit tax invoice.

### 📊 Analytics & Telemetry
- `POST /api/analytics/track` - Client telemetry event logging (`ITEM_VIEW`, `MENU_VIEW`, `ADD_TO_CART`, etc.).
- `GET /api/analytics/dashboard?timeRange=today|7d|30d|all` - Executive operational analytics.
- `POST /api/analytics/ai-advisor` - Operations advisory consultation via Gemini AI.

### 🍽️ Orders & Tables
- `POST /api/orders` - Dispatch new round order to station queues.
- `GET /api/orders/session/:sessionId` - Get all active order rounds for table.
- `PATCH /api/orders/:orderId/status` - Update order stage (`ACCEPTED`, `PREPARING`, `READY`, `SERVED`).
- `GET /api/tables` - Fetch floor tables and active session states.
- `POST /api/staff-requests` - Call waiter assistance from table.

---

## 📄 Contributing & License

Contributions, issues, and feature requests are welcome!

Distributed under the **MIT License**. See `LICENSE` for details. Built with ❤️ for modern restaurants.