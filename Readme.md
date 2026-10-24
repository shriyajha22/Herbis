# PrimeBrew Herbis - Farm to Cup Herbal Tea E-Commerce Platform

> **Farm to Cup. Nature in Every Sip.**

PrimeBrew Herbis is a full-stack, production-ready herbal tea e-commerce platform built strictly adhering to the requirements in `Gemini.md` and design tokens specified in `BrandGuidelines.md`.

---
## 🌟 Brand Identity & Design System

- **Primary Green**: `#2E7D32`
- **Dark Forest Green**: `#1B5E20`
- **Mint Green**: `#A5D6A7`
- **Tea Beige**: `#F8F5F0`
- **Cream White**: `#FFFDF8`
- **Accent Gold**: `#D4AF37`
- **Typography**: Poppins (Headings) & Inter (Body)
- **Icons**: Lucide Icons
- **Animations**: Framer Motion smooth page transitions and micro-interactions

---

## 🚀 Key Features

### 🛍️ Customer Experience
- **Interactive Hero Slider**: Showcasing seasonal herbal harvest blends with CTA buttons.
- **Shop Catalog & Multi-Faceted Filters**: Instant search by tea name, herb, caffeine content, target health benefit, and price range.
- **Product Detail Page**:
  - Image gallery with zoom thumbnails.
  - Size / weight variant selector with live price update.
  - **Interactive Steep Timer Modal**: Steeping countdown timer with water temperature and ratio guides.
  - Ingredients breakdown, health benefits, nutrition facts, and customer reviews with rating submission form.
- **Cart & Checkout**:
  - Slide-over Cart Drawer with free express shipping progress meter.
  - Coupon code validation (e.g. `HERBAL15`, `FARM2CUP`).
  - Eco gift wrapping option (₹49).
  - Address management and **GST B2B Tax Invoice** option.
  - Payment Gateways: Razorpay, Stripe, and Cash on Delivery (COD).
  - Instant printable invoice generation and confetti celebration on order placement.
- **Customer Dashboard**:
  - Saved addresses, wishlist manager, wallet balance (₹250 default bonus), and live **Shiprocket** tracking timeline.
- **Live Tea Concierge Chat**: Simulated WhatsApp & AI tea advisor for personalized blend recommendations.

### ⚡ Admin Control Panel (`/admin`)
- **Dashboard Analytics Widgets**: Today's Sales, Monthly Revenue, Total Orders, Conversion Rate, and Low Stock Alerts.
- **Interactive Revenue Graph**: Monthly sales trends.
- **Product Catalog CRUD**: Modal to add, edit, or delete herbal products with stock tracking.
- **Order Management**: Status timeline updates (Pending, Processing, Packed, Shipped, Delivered).

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti.
- **Backend API**: Next.js App Router REST API endpoints (`/api/products`, `/api/orders`, `/api/categories`, `/api/admin/analytics`).
- **Database Layer**: Mongoose / MongoDB Atlas integration with an intelligent in-memory fallback store for instant local execution out of the box.
- **Authentication**: Role-based access control (Customer vs. Admin).

---

## 🔑 Admin Credentials & Configuration

### Admin Account
- **Email**: `Contact.primebrew@gmail.com`
- **Password**: Configured securely via `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH` environment variables.
- **Access**: Full admin control panel at `/admin`

---

## 🚀 Quick Setup & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
```bash
npm run build
npm run start
```
Updates and bug fixes applied
New Update
