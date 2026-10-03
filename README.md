# 🍽️ DineSetu Frontend Web Application

[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646cff.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Next-generation digital dining and table intelligence client for **DineSetu (Rasrang — Modern Indian Dining)**.

Features:
- **Collaborative QR Dining**: Real-time shared mobile cart and ordering in courses.
- **Table Intelligence**: Spice Harmonizer, Pairing Engine, Dietary Guardian, and AI Help Me Choose.
- **Unified Floor-Wise Grid**: Main Dining Hall, Terrace Garden, Bar & Lounge, Private Dining Suite.
- **Live Order Stream**: Manager live order monitoring and ticket expediting.
- **Multi-Station KDS**: Real-time kitchen stations for curries, tandoor, drinks, and desserts.
- **DineSetu Pay & Split Billing**: Full, Equal, Itemized, and Custom splits with instant GST invoice download.

---
Backend: https://github.com/laksh76777/dinesetu_backend.git
backend deployed: https://dinesetu-backend-1.onrender.com

frontend : https://github.com/laksh76777/DINEFLOW_frontend.git
frontend deployed: https://dineflow-frontend-rosy.vercel.app/
## ⚡ Quick Start (Local)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables (Optional in Dev)**:
   In local development, Vite automatically proxies `/api` and `/socket.io` to `http://localhost:5000`.
   ```bash
   cp .env.example .env
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to view the Portal Gateway.

4. **Build Production Bundle**:
   ```bash
   npm run build
   ```

---

## 🚀 Deploy to Vercel (Step-by-Step)

1. Open your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** ➔ **Project**.
3. Import the repository: `laksh76777/DINEFLOW_frontend`.
4. Build & Output Settings are auto-detected by Vercel:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://your-backend.onrender.com`
   - `VITE_SOCKET_URL` = `https://your-backend.onrender.com`
   *(Ensure no trailing slash)*
6. Click **Deploy**.
7. In ~30 seconds, your site is live with client-side SPA routing backed by `vercel.json`!
