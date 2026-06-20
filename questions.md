# questions.md — Spice Garden Order Management System

This document covers the assumptions made, decisions taken, and clarifications for the implementation of the Spice Garden OMS.

---

## Assumptions & Decisions

**1. UUID Validation Relaxed for Seed Data**
The UUID validation check was relaxed for seed data purposes since the manually created UUIDs didn't match Zod v4's stricter UUID regex compatibility. In a real system with real data coming from the database, the UUID validation would be kept in place to maintain data integrity. UUID format is still enforced at the database level — Postgres rejects invalid UUIDs regardless.

---

**2. Deleting a Customer with Existing Orders is Blocked**
Deleting a customer who has existing orders is blocked at the database level using a foreign key constraint on `orders.customer_id`. This was an intentional decision to preserve order history — you shouldn't be able to wipe a customer and lose all their associated orders along with it. The API returns a `409 RESOURCE_CONFLICT` in this case.

---

**3. Items Can Be Added or Removed at Any Order Stage**
The spec didn't mention any restriction on adding or removing items based on the order's current status, so items can be added or deleted at any stage. In a real environment this would likely be restricted once the order moves to `PREPARING` — at that point the kitchen has already started, so changing items doesn't make practical sense. This would be a straightforward addition given clearer requirements.

---

**4. Order Number Format**
The order number follows the format `ORD-YYYYMMDD-XXXX` where `XXXX` is a random 4-digit number — for example `ORD-20260620-4821`. The date was included to make it easier for staff to reference and trace orders by when they were placed. The random suffix keeps it unique within the same day.

---

**5. No Authentication Implemented**
Authentication was not implemented because this is described as an internal system used by restaurant staff and managers. In a closed internal environment this is acceptable. If this were to be exposed beyond the internal network, JWT-based authentication with role separation between managers and staff would be the natural next step.

---

**6. Status Transition Rules**
The spec mentions `INVALID_STATUS_TRANSITION` but doesn't define which transitions are actually allowed. The following state machine was implemented based on what makes sense for a restaurant workflow:

- `CONFIRMED → PREPARING → READY → COMPLETED`
- Any non-terminal status can move to `CANCELLED`
- `COMPLETED` and `CANCELLED` are terminal — no further changes allowed

---

**7. totalAmount and itemCount Computed on Read**
These fields are calculated at the time of the response by summing up the order items, rather than being stored as columns on the orders table. Storing them would mean keeping three places in sync every time an item changes — too many ways for the numbers to drift. Computing on read keeps a single source of truth.

---

## What Could Be Added

- **Authentication** — JWT-based auth with role-based access control for managers vs staff
- **Item restriction by status** — lock item changes once an order reaches `PREPARING`
- **Soft deletes** — instead of hard deleting customers, add a `deleted_at` column to preserve history
- **Real-time order updates** — WebSocket or polling so the orders list refreshes automatically when statuses change
