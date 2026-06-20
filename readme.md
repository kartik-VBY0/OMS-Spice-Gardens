# Spice Garden — Order Management System

A full-stack internal order management system for Spice Garden restaurant. Built with Hono, PostgreSQL (Supabase), and React.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Hono + TypeScript |
| Validation | Zod |
| Database | PostgreSQL via Supabase |
| DB Client | node-postgres (pg) |
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Data Fetching | React Query + Axios |

---

## Prerequisites

- Node.js 18 or higher
- npm
- A Supabase project (free tier works fine) — [supabase.com](https://supabase.com)

---

## Project Structure

```
spice-garden-oms/
├── backend/
├── frontend/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── questions.md
└── readme.md
```

---

## Setup Instructions

### Step 1 — Database (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once provisioned, go to **Project Settings → Database → Connection String**
3. Copy the **URI** under **Session mode (port 5432)**
4. Open the **SQL Editor** in the Supabase dashboard
5. Paste and run the contents of `database/schema.sql`
6. Paste and run the contents of `database/seed.sql`

Your database now has 3 tables (`customers`, `orders`, `order_items`) and seed data covering all order statuses.

---

### Step 2 — Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```
DATABASE_URL=postgresql://postgres.[your-ref]:[your-password]@[your-region].pooler.supabase.com:5432/postgres
PORT=3000
```

Replace the `DATABASE_URL` with the connection string you copied from Supabase.

Start the backend:

```bash
npm run dev
```

Backend runs on **http://localhost:3000**

Verify it's working:
```
GET http://localhost:3000/customers
GET http://localhost:3000/orders
```

Both should return data from your seeded database.

---

### Step 3 — Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## Running the Full Project

You need two terminals open simultaneously:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## Available Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start backend with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled build |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## API Overview

Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/customers` | List customers (search, pagination) |
| POST | `/customers` | Create a customer |
| PATCH | `/customers/:id` | Update a customer |
| DELETE | `/customers/:id` | Delete a customer |
| GET | `/orders` | List orders (search, status filter, pagination) |
| GET | `/orders/:id` | Get order details |
| POST | `/orders` | Create an order |
| PATCH | `/orders/:id/status` | Update order status |
| POST | `/orders/:id/items` | Add item to order |
| DELETE | `/orders/:id/items/:itemId` | Remove item from order |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://postgres...` |
| `PORT` | Port the backend runs on | `3000` |

---

## Notes

- The `.env` file is not committed to the repository. You must create it manually.
- Supabase's free tier has a connection limit — sufficient for development and demonstration.
- CORS is enabled on the backend for all origins (`*`) to allow the frontend to communicate during development.
- See `questions.md` for all assumptions made during implementation.
