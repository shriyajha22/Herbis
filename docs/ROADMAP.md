# PrimeBrew Herbis — Complete Upgrade Roadmap
> Solo developer · ASAP timeline (target: 3 weeks) · Docker + Cloud (AWS or OCI) · Managed PostgreSQL

---

## How to Read This Document

- Tasks are **strictly sequential** within each phase
- Each phase has a **time estimate** and a **clear exit condition** (what "done" means)
- 🔴 = blocking / critical · 🟠 = high priority · 🟡 = should do · 🔵 = design / architecture
- Platform choice between **AWS** and **Oracle Cloud (OCI)** is deferred — comparison is in Phase 3
- **Phase 1.5** covers project structure refactoring — must happen before the DB migration so you're not refactoring and migrating at the same time

---

## PHASE 0 — Critical Security Hotfixes (Day 1–2)
> Do this FIRST, before anything else. These are live vulnerabilities on your deployed site.

### 0.1 🔴 Fix: Middleware JWT Bypass (Most Urgent)
**File:** `src/middleware.ts`

Your middleware currently only base64-decodes the JWT — it does NOT verify the signature. A forged token with `{"role":"admin"}` grants full admin access right now.

**Action:**
1. Install `jose` (works in Edge runtime, unlike `jsonwebtoken`):
   ```bash
   npm install jose
   ```
2. Replace `parseJwtRole()` with proper cryptographic verification using `jwtVerify()` from `jose`.
3. Ensure `JWT_SECRET` env var is set in Vercel (Settings → Environment Variables).

---

### 0.2 🔴 Fix: Admin Login Bypass
**File:** `src/app/api/admin/login/route.ts:134–140`

Remove the block that accepts any password when `ADMIN_PASSWORD` env var is not set. Always require a valid bcrypt hash.

**Action:**
1. Delete lines 134–140 (the `!ADMIN_PASSWORD && !ADMIN_PASSWORD_HASH && isAdminEmailMatch` block).
2. Set `ADMIN_PASSWORD_HASH` in Vercel environment variables (generate using `bcrypt.hashSync('yourpassword', 10)`).

---

### 0.3 🔴 Fix: Customer Login Bypass
**File:** `src/app/api/auth/login/route.ts:51–53`

Remove the `else { isPasswordValid = true; }` fallback.

**Action:** Replace with:
```ts
if (!user.passwordHash) {
  return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
}
isPasswordValid = await bcrypt.compare(password, user.passwordHash);
```

---

### 0.4 🔴 Fix: Remove Hardcoded JWT Secret Fallback
**Files:** `src/lib/auth.ts`, all 6 login/auth routes

**Action:** In every file, change:
```ts
// REMOVE THIS:
const JWT_SECRET = process.env.JWT_SECRET || 'pbh_super_secret_jwt_key_2026_primebrew';

// REPLACE WITH:
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
```

Set `JWT_SECRET` in Vercel to a new 64-character random string:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### 0.5 🟠 Fix: Protect Contact Query API
**File:** `src/app/api/contact/route.ts`

Add `verifyAdminToken` to GET, PATCH, and DELETE handlers. Leave POST public.

---

### 0.6 🟠 Fix: Protect User Addresses API
**File:** `src/app/api/user/addresses/route.ts`

Add `verifyCustomerToken` to both GET and POST. Verify that `decoded.email === requested email`.

---

### 0.7 🟠 Fix: Remove JWT Token from Response Body
**Files:** `src/app/api/auth/login/route.ts`, `register/route.ts`, `admin/login/route.ts`

Remove `token` from the `NextResponse.json({...})` payload. The `httpOnly` cookie is sufficient.

---

**✅ Phase 0 Exit Condition:** Deploy hotfixes to Vercel. Verify admin login, customer login, and middleware all work. Confirm `/api/contact` returns 401 without auth. *Timeline: 1–2 days.*

---

## PHASE 1 — Security Hardening (Day 3–7)

### 1.1 🟠 Input Validation — Centralize with Zod
Install `zod` and create validation schemas for all POST/PUT request bodies:

```bash
npm install zod
```

Create `src/lib/validators.ts`:
- `registerSchema`: email (proper regex), password (min 8 chars), name (1–100 chars), phone (Indian 10-digit)
- `orderSchema`: pincode (`/^\d{6}$/`), phone, shippingAddress fields
- `productSchema`: name, price (positive number), stock (non-negative integer)
- `contactSchema`: name, email, message (max 2000 chars)

Apply each schema at the top of its respective API route.

---

### 1.2 🟠 Rate Limiting — Temporary Vercel Solution
Since you're still on Vercel during this phase, use `@upstash/ratelimit` + Upstash Redis (free tier):

```bash
npm install @upstash/ratelimit @upstash/redis
```

Create `src/lib/rateLimit.ts` with limits:
- **Login / Admin Login:** 5 attempts per 15 min per IP
- **Register:** 3 accounts per hour per IP
- **Forgot password:** 3 requests per hour per email
- **Contact form:** 5 submissions per hour per IP

Apply in middleware or at the top of each route.

> **Note:** In Phase 3, when you move to Nginx, these limits will move to Nginx config. The Upstash approach is a temporary bridge.

---

### 1.3 🟡 Fix: Order Number Generation
**File:** `src/app/api/orders/route.ts:199–201`

Replace guessable 4-digit suffix with cryptographically random:
```ts
import crypto from 'crypto';
const orderNumber = `PBH-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
// Example: PBH-3F7A12C4 → 4 billion+ possibilities
```

---

### 1.4 🟡 Fix: Public Order Tracking — Limit Exposed Data
**File:** `src/app/api/orders/route.ts:44–60`

For unauthenticated tracking by order number, return only:
- Order status
- Estimated delivery
- Tracking number
- Courier name
- Partially masked address (city + state only, no street/phone/email)

---

### 1.5 🟡 Add Security HTTP Headers
**File:** `next.config.js` (or `next.config.ts`)

```js
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};
```

---

### 1.6 🟡 Fix: Cookie sameSite Policy
**Files:** All login routes

Change `sameSite: 'lax'` → `sameSite: 'strict'` on all `pbh_token` and `pbh_admin_token` cookies.

---

### 1.7 🟡 Fix: Sanitize Error Responses
**All API routes:** Replace `message: error.message` with `message: 'An unexpected error occurred'` in all `500` responses. Log the real error server-side only.

---

### 1.8 🟡 Improve Password Policy
- Minimum 8 characters (update register + reset-password)
- Add strength hint on frontend (no blocking)

---

**✅ Phase 1 Exit Condition:** Run `npm audit`. No critical or high vulnerabilities. Auth endpoints require valid credentials. Contact/address APIs return 401 without tokens. All inputs are validated. *Timeline: Days 3–7.*

---

## PHASE 1.5 — Project Structure Refactoring (Days 7–11)
> Fix the structural problems that will cause build failures and developer pain in production. Do this **before** the database migration — you don't want to migrate the DB while simultaneously reorganising files.

### What's Good (No Changes Needed)
Before diving in, note what's already correct and shouldn't be touched:
- ✅ Next.js 14 App Router (`src/app/`) — correct long-term choice
- ✅ `"strict": true` in `tsconfig.json` — keep it
- ✅ Components grouped by domain (`admin/`, `cart/`, `home/`, `layout/`, `shop/`) — correct pattern
- ✅ `@/*` path alias — already configured, use it everywhere
- ✅ SEO metadata, OpenGraph, JSON-LD, robots.txt, sitemap.xml — solid foundation
- ✅ API routes follow REST conventions — keep the structure as-is

---

### 1.5.1 🔴 Split `admin/page.tsx` — 120 KB God File
**File:** `src/app/admin/page.tsx` — 2,559 lines · 120.9 KB

This is the most urgent structural issue. On a 1GB RAM VM (your free-tier cloud), `next build` risks running out of memory on this single file. Every admin tab is downloaded together even when only one is visited.

**Action — Create these route segments:**
```
src/app/admin/
  layout.tsx              ← Shared sidebar, admin auth check shell
  page.tsx                ← 3 lines: redirect to /admin/dashboard
  dashboard/
    page.tsx              ← KPI overview only (~300 lines)
  orders/
    page.tsx              ← Orders table + filters (~400 lines)
    [orderId]/
      page.tsx            ← Order detail + status update (~200 lines)
  products/
    page.tsx              ← Product list table (~300 lines)
    new/
      page.tsx            ← Add product form (~250 lines)
    [slug]/
      page.tsx            ← Edit product form (~250 lines)
  customers/
    page.tsx              ← Customers table (~200 lines)
  support/
    page.tsx              ← Contact queries (~150 lines)
  login/
    page.tsx              ← (already exists, keep)
```

Next.js **automatically code-splits on route boundaries** — no extra config needed. Each tab is its own JS chunk.

> Also split `src/app/dashboard/page.tsx` (42 KB customer dashboard) into sub-components.

---

### 1.5.2 🔴 Remove `seedData.ts` Imports from Production Pages
**Files:** `src/app/page.tsx:10`, `src/app/shop/page.tsx:6`, `src/app/blogs/page.tsx`

```ts
// CURRENT PROBLEM — hardcoded static data, bypasses your entire backend:
import { initialProducts, initialCategories, initialBlogs } from '@/lib/seedData';
```

The shop page and homepage import hardcoded product arrays. This means **the admin panel's add/edit/delete product features have zero effect** on what customers see. The shop is completely disconnected from the backend.

**Action:**
1. Remove all `seedData` imports from every page in `src/app/`
2. Fetch data from your API routes at runtime instead (see 1.5.3 below)
3. Keep `src/lib/seedData.ts` only as a database seeding script (for initial PostgreSQL population in Phase 2)

---

### 1.5.3 🟠 Convert Pages to Server Components
**Files:** `src/app/shop/page.tsx`, `src/app/product/[slug]/page.tsx`, `src/app/page.tsx`, `src/app/blogs/page.tsx`

Every page currently starts with `'use client'`, which disables Server-Side Rendering for the whole app. For an e-commerce site this means:
- Product pages aren't statically generated → slow first paint on mobile
- Search engines see mostly empty HTML until JS runs → weaker SEO
- All data must be fetched after the page loads in the browser

**Action — Convert each page to a Server Component:**
```tsx
// src/app/shop/page.tsx — REMOVE 'use client', make it async
// This runs on the server at request time

async function getProducts(searchParams: Record<string, string>) {
  const qs = new URLSearchParams(searchParams).toString();
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products?${qs}`, {
    next: { revalidate: 60 } // ISR: revalidate every 60 seconds
  });
  return res.json();
}

export default async function ShopPage({ searchParams }) {
  const { products } = await getProducts(searchParams);
  return (
    <div>
      <ShopFilters />   {/* Client component — keeps useState for filters */}
      {products.map(p => <ProductCard key={p._id} product={p} />)}
    </div>
  );
}
```

**Conversion priority:**
1. `src/app/shop/page.tsx` — product listing (biggest SEO impact)
2. `src/app/product/[slug]/page.tsx` — can be fully SSG + ISR
3. `src/app/page.tsx` — homepage (hero, featured products)
4. `src/app/blogs/page.tsx` — blog listing

**Pages that MUST stay `'use client'`:** `checkout/`, `dashboard/`, `cart/`, `login/`, `register/` — these have interactive state that requires the browser.

---

### 1.5.4 🟠 Split `storeContext.tsx` into Focused Contexts
**File:** `src/lib/storeContext.tsx` — 443 lines managing everything

Currently one context holds: cart, coupons, gift wrap, wishlist, auth state, cart drawer state, search modal state, and toasts. Any state change anywhere (e.g., opening search) re-renders every component that calls `useStore()` — including the Navbar, CartDrawer, and every ProductCard.

**Action — Create `src/lib/contexts/` folder:**
```
src/lib/contexts/
  authContext.tsx       ← currentUser, isAuthLoading, login, logout
  cartContext.tsx       ← cart items, add/remove/update, totals, coupon, giftWrap
  wishlistContext.tsx   ← wishlist IDs, toggle, isInWishlist
  uiContext.tsx         ← isCartOpen, isSearchOpen, toasts, showToast
```

Each context re-renders only its own subscribers. Cart changes won't re-render auth-dependent components.

Update `src/app/layout.tsx` to nest all 4 providers and export a combined `useAuth()`, `useCart()`, `useWishlist()`, `useUI()` hook from each file.

---

### 1.5.5 🟡 Fix Image Optimization
**File:** `next.config.mjs:5`

```js
// REMOVE THIS LINE:
images: { unoptimized: true }
```

This single line disables WebP conversion, lazy loading, responsive srcsets, and blur placeholders for all images — the biggest assets on an e-commerce site. With it removed, Next.js `<Image />` will automatically serve optimized formats.

Also update `remotePatterns` to include your future object storage domain (OCI / S3) once you set that up in Phase 4.

---

### 1.5.6 🟡 Clean Up Root-Level Files

| File | Action |
|------|--------|
| `er.name` (48 KB) | Investigate what this is, likely delete |
| `task.md` | Move to `docs/` or add to `.gitignore` |
| `Gemini.md` | Move to `docs/` or add to `.gitignore` |
| `BrandGuidelines.md` | Move to `docs/` |
| `nodemailer` in `package.json` | Remove — unused, actual email uses Resend HTTP API |

```bash
# Remove unused nodemailer dependency
npm uninstall nodemailer @types/nodemailer
```

---

### 1.5.7 🔵 Add Route Groups for Cleaner Middleware

Reorganise `src/app/` into route groups using Next.js `(groupName)` folders. This lets middleware apply different rules to different page categories without complex path matching:

```
src/app/
  (public)/             ← Public pages — no auth required
    page.tsx
    shop/
    product/
    blogs/
    about/
    contact/
    track-order/
  (auth)/               ← Auth pages — redirect to dashboard if already logged in
    login/
    register/
    forgot-password/
    reset-password/
  (protected)/          ← Requires customer login — middleware redirects if not logged in
    checkout/
    dashboard/
    order-confirmation/
  admin/                ← Kept separate (already has its own middleware logic)
```

Route groups are folder names in parentheses — they don't affect the URL. `/shop` stays `/shop`.

---

### 1.5.8 🔵 Add a Shared UI Components Folder

Create `src/components/shared/` for reusable primitives used across admin, shop, and customer pages:
- `Button.tsx` — primary, secondary, danger variants
- `Input.tsx` — with label, error state, helper text
- `Badge.tsx` — status badges (In Stock, Processing, etc.)
- `Modal.tsx` — base modal shell used by QuickView, AddProduct, etc.
- `Spinner.tsx` — loading indicator

This avoids duplicating button/input styles across the 120KB admin page, checkout page, and dashboard.

---

### 1.5.9 🔵 Add Basic Tests (Vitest)

There are currently zero tests across 80 files. Before going to production, add at minimum:

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
```

**Priority tests to write first:**
1. `src/lib/auth.ts` — unit test `verifyAdminToken` and `verifyCustomerToken`
2. `POST /api/auth/login` — integration test: valid credentials pass, invalid fail, bypass removed
3. `POST /api/orders` — integration test: unauthenticated returns 401, authenticated creates order
4. `src/lib/validators.ts` — unit test Zod schemas reject bad inputs

---

**✅ Phase 1.5 Exit Condition:** Admin panel is split into ≤8 route files, each under 500 lines. Shop and homepage fetch data from the API (not seedData). TypeScript compiles cleanly. `next build` succeeds without memory errors. Image optimization is enabled. *Timeline: Days 7–11.*

---

## PHASE 2 — PostgreSQL Migration with Prisma (Week 2)
> This is the biggest engineering task. Plan ~5–7 days.

### Why PostgreSQL over MongoDB (for this app)?

| Factor | MongoDB (current) | PostgreSQL |
|--------|------------------|------------|
| Schema | Flexible, schemaless | Strict, relational — better for orders, users, products |
| Transactions | Limited multi-document | Full ACID transactions (critical for stock deduction) |
| Relations | Manual references | Native foreign keys |
| Querying | OK | Much more powerful — CTEs, window functions, joins |
| Free hosting | Atlas free (512MB) | AWS RDS free tier (20GB), OCI Autonomous DB free forever |
| ORM ecosystem | Mongoose | Prisma (type-safe, excellent DX) |

### Why Prisma ORM?

| Factor | Prisma | Drizzle | Raw SQL |
|--------|--------|---------|---------|
| Type safety | ✅ Full auto-generation | ✅ Good | ❌ Manual |
| Migrations | ✅ Declarative, tracked | ✅ Good | ❌ Manual |
| Next.js integration | ✅ First-class | ✅ Good | ✅ Works |
| Learning curve | Low | Low-Medium | High |
| Studio (GUI) | ✅ Built-in | ❌ | ❌ |
| Best for solo dev | ✅ Yes | ⚠️ Possible | ❌ No |

**Decision: Use Prisma.** Best DX for a solo developer on a tight timeline.

---

### 2.1 Install Prisma

```bash
npm install prisma @prisma/client
npx prisma init
```

---

### 2.2 Design the PostgreSQL Schema

Create `prisma/schema.prisma`. Key tables derived from your existing models:

```prisma
model User {
  id           String    @id @default(cuid())
  name         String
  email        String    @unique
  phone        String?
  role         Role      @default(CUSTOMER)
  passwordHash String?
  walletBalance Float    @default(250)
  addresses    Address[]
  orders       Order[]
  wishlist     String[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Product {
  id                 String   @id @default(cuid())
  name               String
  slug               String   @unique
  description        String
  price              Float
  mrp                Float
  discountPercentage Float    @default(0)
  category           String
  categoryName       String
  stock              Int      @default(100)
  inStock            Boolean  @default(true)
  packagingSizes     String[]
  images             String[]
  caffeineLevel      String
  rating             Float    @default(5.0)
  reviewCount        Int      @default(0)
  isFeatured         Boolean  @default(false)
  isBestSeller       Boolean  @default(false)
  isNewArrival       Boolean  @default(false)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  orderItems         OrderItem[]
}

model Order {
  id               String      @id @default(cuid())
  orderNumber      String      @unique
  userId           String
  user             User        @relation(fields: [userId], references: [id])
  items            OrderItem[]
  status           OrderStatus @default(PROCESSING)
  paymentMethod    String      @default("Cash on Delivery")
  paymentStatus    String      @default("Pending")
  subtotal         Float
  discount         Float       @default(0)
  shippingFee      Float       @default(0)
  tax              Float       @default(0)
  total            Float
  trackingNumber   String?
  courierName      String?
  estimatedDelivery String?
  shippingAddress  Json
  cancelledAt      DateTime?
  cancelledBy      String?
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
}

model OrderItem {
  id           String   @id @default(cuid())
  orderId      String
  order        Order    @relation(fields: [orderId], references: [id])
  productId    String
  product      Product  @relation(fields: [productId], references: [id])
  productName  String
  productImage String?
  price        Float
  quantity     Int
  weight       String?
}

model PasswordReset {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}

model ContactQuery {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  subject   String?
  message   String
  status    String   @default("Unread")
  createdAt DateTime @default(now())
}

model AuditLog {
  id          String   @id @default(cuid())
  adminEmail  String
  action      String
  targetType  String
  targetId    String?
  changes     Json?
  createdAt   DateTime @default(now())
}

enum Role {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  CONFIRMED
  PACKED
  SHIPPED
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
}
```

---

### 2.3 Replace Database Layer

1. **Delete** `src/lib/db.ts` (the `InMemoryStore` class and `connectToDatabase`)
2. **Create** `src/lib/prisma.ts`:
   ```ts
   import { PrismaClient } from '@prisma/client';
   declare global { var prisma: PrismaClient | undefined; }
   export const prisma = global.prisma || new PrismaClient();
   if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
   ```
3. **Delete** `src/lib/db.ts`, all Mongoose model files in `src/models/`
4. Update `DATABASE_URL` env var to your PostgreSQL connection string

---

### 2.4 Rewrite API Routes

Rewrite all routes in this order (easiest → most complex):

1. `src/app/api/auth/register` → `prisma.user.create()`
2. `src/app/api/auth/login` → `prisma.user.findUnique()`
3. `src/app/api/auth/me` → `prisma.user.findUnique()`
4. `src/app/api/products` → `prisma.product.findMany()` / `prisma.product.create()`
5. `src/app/api/products/[slug]` → `prisma.product.findUnique()` / `prisma.product.update()`
6. `src/app/api/orders` → `prisma.order.create()` with `prisma.$transaction()` for stock deduction
7. `src/app/api/orders/[orderId]` → `prisma.order.findUnique()`
8. `src/app/api/orders/cancel` → `prisma.order.update()`
9. `src/app/api/contact` → `prisma.contactQuery`
10. `src/app/api/user/addresses` → `prisma.address` (add Auth!)
11. `src/app/api/admin/*` → `prisma.order.findMany()`, `prisma.user.findMany()`

---

### 2.5 Fix: Stock Deduction on Order (Design Gap D6)

In `POST /api/orders`, use a Prisma transaction:

```ts
await prisma.$transaction(async (tx) => {
  // 1. Check stock for each item
  for (const item of items) {
    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product || product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.productName}`);
    }
  }
  // 2. Decrement stock
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }
  // 3. Create order
  const order = await tx.order.create({ data: orderData });
  return order;
});
```

---

### 2.6 Add Admin Audit Log (Design Gap D8)

Create `src/lib/audit.ts`:
```ts
export async function logAdminAction(adminEmail: string, action: string, targetType: string, targetId?: string, changes?: object) {
  await prisma.auditLog.create({
    data: { adminEmail, action, targetType, targetId, changes }
  });
}
```

Call `logAdminAction()` in: delete customer, update order status, create/edit/delete product.

---

### 2.7 Run Migration

```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio  # verify schema in browser GUI
```

---

**✅ Phase 2 Exit Condition:** All API routes rewritten to use Prisma. TypeScript compiles cleanly (`npx tsc --noEmit`). Core flows work: register → login → add to cart → checkout → order placed with stock deducted → admin sees order. *Timeline: ~5–7 days.*

---

## PHASE 3 — Cloud Deployment: Docker + Nginx + Managed PostgreSQL (Days 10–14)

### AWS vs Oracle Cloud Free Tier Comparison

| Feature | AWS Free Tier | Oracle Cloud (OCI) Always Free |
|---------|--------------|-------------------------------|
| VM duration | 12 months only | **Forever** |
| VM spec | t2.micro: 1 vCPU, 1GB RAM | 4x Ampere vCPUs, **24GB RAM** |
| PostgreSQL | RDS 20GB, 12 months | Autonomous DB **forever free**, 20GB |
| Storage | 30GB EBS, 12 months | 200GB block storage forever |
| Bandwidth | 100GB/month | 10TB/month outbound |
| Object storage | S3 5GB, 12 months | 20GB forever |
| SSL Certs | ACM (free) | Let's Encrypt via Certbot |
| Verdict | Industry standard, shorter free window | **Better raw specs, longer free period** |

**Recommendation for solo dev on tight budget: Start with OCI.** Significantly better free tier. If you later need AWS-specific services (SES, Rekognition, etc.), you can add them alongside OCI.

---

### 3.1 Set Up the Cloud VM

**On OCI:**
1. Sign up → Compute → Create Instance → `VM.Standard.A1.Flex` (Ampere ARM, free forever)
2. Choose Ubuntu 22.04 LTS
3. Configure: 4 OCPUs, 24GB RAM (free allowance)
4. Generate and download SSH key pair
5. Open ports in Security List: 22 (SSH), 80 (HTTP), 443 (HTTPS)

**On AWS:**
1. Sign up → EC2 → Launch Instance → `t2.micro` (free tier eligible)
2. Choose Ubuntu 22.04 LTS
3. Create key pair → download `.pem`
4. Security Group: Allow 22, 80, 443

---

### 3.2 Set Up Managed PostgreSQL

**On OCI (Autonomous DB — Free Forever):**
1. Database → Autonomous Database → Create → Transaction Processing
2. Set admin password, note the connection string
3. Download wallet (for mTLS connection)

**On AWS (RDS — 12 months free):**
1. RDS → Create Database → PostgreSQL 15
2. `db.t3.micro` free tier eligible
3. Set DB name: `primebrew`, username, password
4. VPC: Same VPC as your EC2 instance
5. Note endpoint URL

```
# Connection string format (add to .env):
DATABASE_URL="postgresql://username:password@your-db-host:5432/primebrew?sslmode=require"
```

---

### 3.3 Provision the VM (run these after SSH into VM)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Clone your repository
git clone https://github.com/your-username/primebrew-herbis.git
cd primebrew-herbis
```

---

### 3.4 Docker Compose Setup

Create `docker-compose.yml` in project root:

```yaml
version: '3.9'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: primebrew_app
    restart: unless-stopped
    env_file: .env.production
    environment:
      - NODE_ENV=production
      - PORT=3000
    expose:
      - "3000"
    depends_on:
      - nginx

  nginx:
    image: nginx:alpine
    container_name: primebrew_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/www/certbot:/var/www/certbot:ro
    depends_on:
      - app
```

---

### 3.5 Create Dockerfile

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

Add to `next.config.js`:
```js
output: 'standalone',
```

---

### 3.6 Nginx Configuration with Rate Limiting

Create `nginx/conf.d/primebrew.conf`:

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=contact_limit:10m rate=3r/m;
limit_req_zone $binary_remote_addr zone=general:10m rate=60r/m;

# Gzip compression
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # ACME challenge for SSL cert renewal
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' fonts.googleapis.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com fonts.gstatic.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self';" always;

    # Block bad bots
    if ($http_user_agent ~* (sqlmap|nikto|dirbuster|masscan|nmap)) {
        return 403;
    }

    # Max request body size
    client_max_body_size 5m;

    # Auth endpoints — strict rate limit (5 req/min per IP)
    location ~ ^/api/auth/(login|register) {
        limit_req zone=auth_limit burst=3 nodelay;
        limit_req_status 429;
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin login — stricter limit (3 req/min per IP)
    location /api/admin/login {
        limit_req zone=auth_limit burst=2 nodelay;
        limit_req_status 429;
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Contact form — 3 per min
    location /api/contact {
        limit_req zone=contact_limit burst=2 nodelay;
        limit_req_status 429;
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # General API — 30 req/min
    location /api/ {
        limit_req zone=api_limit burst=10 nodelay;
        limit_req_status 429;
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static Next.js assets — cache aggressively
    location /_next/static/ {
        proxy_pass http://app:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # Everything else — general limit
    location / {
        limit_req zone=general burst=20 nodelay;
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### 3.7 Domain & SSL Setup

1. Point your domain's DNS A record to the VM's public IP
2. SSH into VM, run Certbot:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
3. Auto-renewal cron:
   ```bash
   sudo crontab -e
   # Add: 0 0 * * * certbot renew --quiet
   ```

---

### 3.8 Environment Variables Checklist (`.env.production`)

```env
# Database
DATABASE_URL=postgresql://user:pass@db-host:5432/primebrew?sslmode=require

# Auth
JWT_SECRET=<64-char random hex — run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
ADMIN_EMAIL=your-real-admin-email@domain.com
ADMIN_PASSWORD_HASH=<bcrypt hash of your admin password>

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=PrimeBrew Herbis <noreply@yourdomain.com>
```

---

### 3.9 Deploy

```bash
# On VM, in project directory
cp .env.production .env
docker compose up -d --build

# Run database migrations
docker compose exec app npx prisma migrate deploy

# View logs
docker compose logs -f app
```

---

### 3.10 Set Up CI/CD (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VM_HOST }}
          username: ubuntu
          key: ${{ secrets.VM_SSH_KEY }}
          script: |
            cd ~/primebrew-herbis
            git pull origin main
            docker compose down
            docker compose up -d --build
            docker compose exec -T app npx prisma migrate deploy
            echo "✅ Deployed successfully"
```

Add secrets to GitHub repo: `VM_HOST`, `VM_SSH_KEY`.

---

**✅ Phase 3 Exit Condition:** Site is live on your domain with HTTPS. Nginx is serving traffic. Rate limiting is active. Docker containers auto-restart. GitHub push triggers auto-deploy. *Timeline: Days 10–14.*

---

## PHASE 4 — Production Hardening & Monitoring (Post-Launch)

### 4.1 Set Up Monitoring
- UptimeRobot (Free) or Grafana Cloud + Loki

### 4.2 Set Up Automated Database Backups
- PostgreSQL pg_dump via cron with retention and offsite sync

### 4.3 Remove Dead Code
- walletBalance, mock analytics, inMemoryStore

### 4.4 Connect Real Analytics
- Real Prisma count / aggregate queries

### 4.5 Product Image Storage
- OCI Object Storage / AWS S3 with CDN
