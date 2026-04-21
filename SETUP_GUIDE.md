# 🛒 RoopMart - Complete eCommerce Platform
## Full Setup, Deployment & Free Hosting Guide

---

## 📁 PROJECT STRUCTURE

```
roopmart/
├── backend/          ← Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Auth/AuthController.php
│   │   │   ├── User/ (ProductController, CartController, OrderController)
│   │   │   ├── Store/ (StoreController, StoreProductController, StoreOrderController)
│   │   │   └── Admin/ (Dashboard, Products, Users, Orders, Categories...)
│   │   ├── Models/ (User, Product, Store, Order, Cart, Review, Coupon...)
│   │   └── Http/Middleware/RoleMiddleware.php
│   ├── config/paytm.php
│   ├── database/migrations/
│   ├── routes/api.php
│   └── .env.example
│
└── frontend/         ← React 18 + Vite
    ├── src/
    │   ├── api/axios.js
    │   ├── store/ (authStore, cartStore, wishlistStore)
    │   ├── layouts/ (MainLayout, AdminLayout, StoreLayout)
    │   ├── pages/
    │   │   ├── HomePage, ProductsPage, SearchPage, CartPage, CheckoutPage
    │   │   ├── auth/ (Login, Register, StoreRegister)
    │   │   ├── user/ (Profile, Orders, Wishlist, Addresses)
    │   │   ├── admin/ (Dashboard, Products, Orders, Users, Stores, Categories...)
    │   │   └── store/ (Dashboard, Products, Orders, AddProduct)
    │   └── components/ProductCard.jsx
    └── package.json
```

---

## ⚙️ BACKEND SETUP (Laravel)

### Step 1: Install Laravel

```bash
# Install Composer first: https://getcomposer.org
composer create-project laravel/laravel roopmart-backend
cd roopmart-backend
```

### Step 2: Copy provided files

Copy all files from the `backend/` folder into your Laravel project. Replace existing files where needed.

### Step 3: Install packages

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### Step 4: Setup database

```bash
# Create MySQL database named 'roopmart'
# Then configure .env:
cp .env.example .env
php artisan key:generate
```

Edit `.env` with your database credentials:
```
DB_DATABASE=roopmart
DB_USERNAME=root
DB_PASSWORD=yourpassword
```

### Step 5: Run migrations & seed

```bash
php artisan migrate
# Create admin user manually in tinker:
php artisan tinker
```

In Tinker, create admin:
```php
\App\Models\User::create([
  'name' => 'Admin',
  'email' => 'admin@roopmart.com',
  'password' => bcrypt('admin123'),
  'role' => 'admin',
  'is_active' => true,
]);
exit
```

### Step 6: Register Middleware

In `bootstrap/app.php` (Laravel 11), add:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \App\Http\Middleware\RoleMiddleware::class,
    ]);
})
```

### Step 7: Storage link

```bash
php artisan storage:link
```

### Step 8: Configure CORS

In `config/cors.php`:
```php
'allowed_origins' => ['http://localhost:5173', 'https://yourdomain.com'],
```

### Step 9: Start backend

```bash
php artisan serve --port=8000
# API now running at http://localhost:8000/api/v1
```

---

## 💻 FRONTEND SETUP (React)

### Step 1: Install dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure environment

```bash
cp .env.example .env
# Edit .env:
# VITE_API_URL=http://localhost:8000/api/v1
```

### Step 3: Start frontend

```bash
npm run dev
# App running at http://localhost:5173
```

### Step 4: Build for production

```bash
npm run build
# Outputs to dist/ folder
```

---

## 💳 PAYTM PAYMENT SETUP

### Step 1: Register on Paytm for Business
Go to: https://business.paytm.com
1. Click "Sign Up"
2. Fill business details
3. Complete KYC verification
4. Get MID (Merchant ID) and MKEY (Merchant Key)

### Step 2: Add to backend .env

```
PAYTM_MERCHANT_ID=YOUR_MID_HERE
PAYTM_MERCHANT_KEY=YOUR_MKEY_HERE
PAYTM_WEBSITE=WEBSTAGING        # For testing
# PAYTM_WEBSITE=DEFAULT         # For production
PAYTM_CHANNEL_ID=WEB
PAYTM_INDUSTRY_TYPE=Retail
PAYTM_ENVIRONMENT=sandbox       # Change to 'production' when live
PAYTM_CALLBACK_URL=https://yourdomain.com/api/v1/payment/callback
```

### Step 3: Test credentials (sandbox)
- MID: `Demoios00000000001234`
- MKEY: `your_test_key`
- Test card: 4111111111111111 / Expiry: Any future date / CVV: Any 3 digits

---

## 🌐 FREE HOSTING GUIDE

### OPTION 1: Railway.app (Recommended - Easiest)

**Backend (Laravel):**
1. Go to https://railway.app → Sign up with GitHub
2. Click "New Project" → "Deploy from GitHub"
3. Connect your repo
4. Add environment variables in Railway dashboard
5. Railway auto-detects PHP/Laravel and deploys!
6. Add MySQL: click "New" → "Database" → "MySQL"
7. Copy connection details to your env vars
8. Your API URL: `https://yourapp.railway.app`

**Frontend (React):**
1. In same Railway project → "New" → "GitHub Repo"
2. Set build command: `npm run build`
3. Set start command: `npx serve dist`
4. Add env var: `VITE_API_URL=https://your-backend.railway.app/api/v1`

**Free tier:** 500 hours/month (enough for testing)

---

### OPTION 2: Render.com (Good free tier)

**Backend:**
1. Go to https://render.com → Sign up
2. "New" → "Web Service"
3. Connect GitHub repo
4. Runtime: PHP
5. Build Command: `composer install --no-dev && php artisan migrate --force`
6. Start Command: `php artisan serve --host=0.0.0.0 --port=$PORT`
7. Add free PostgreSQL database from Render

**Frontend:**
1. "New" → "Static Site"
2. Build Command: `npm install && npm run build`
3. Publish Directory: `dist`

**Free tier:** 750 hours/month

---

### OPTION 3: Vercel (Frontend) + Supabase (DB)

**Frontend on Vercel:**
1. Go to https://vercel.com → Sign up with GitHub
2. "Import Project" → select your frontend folder
3. Vercel auto-detects Vite and deploys!
4. Add `VITE_API_URL` in project settings → Environment Variables
5. Your URL: `https://roopmart.vercel.app`

**Backend on Vercel (Serverless):** Not ideal for Laravel. Use Railway instead.

---

### OPTION 4: Hostinger / cPanel Shared Hosting (₹99/month)

**Backend:**
1. Upload backend files to `public_html/api/` (or subdomain)
2. Point document root to `public/`
3. Create MySQL database in cPanel
4. Upload files via FTP or cPanel File Manager
5. Set .env values
6. Run: `php artisan migrate` via SSH

**Frontend:**
1. Run `npm run build` locally
2. Upload `dist/` folder contents to `public_html/`
3. Create `.htaccess` for SPA routing (see below)

**.htaccess for React SPA:**
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QL]
```

---

## 🔒 PRODUCTION CHECKLIST

Before going live:

```bash
# Backend
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Update .env:
APP_ENV=production
APP_DEBUG=false
PAYTM_ENVIRONMENT=production
PAYTM_WEBSITE=DEFAULT
```

**Frontend:**
- Update `VITE_API_URL` to your production API URL
- Run `npm run build`

---

## 👤 DEFAULT LOGIN CREDENTIALS

After setup:

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@roopmart.com     | admin123  |

---

## 📦 FEATURES INCLUDED

### 👥 USER Features
- ✅ Register / Login / Logout
- ✅ Browse products (search, filter, sort)
- ✅ Product detail with reviews
- ✅ Add to cart, wishlist
- ✅ Multiple delivery addresses
- ✅ Checkout with Paytm / COD
- ✅ Order tracking
- ✅ Cancel / Return orders
- ✅ Profile management

### 🏪 STORE (Seller) Features
- ✅ Register store
- ✅ Dashboard with stats
- ✅ Add/Edit/Delete products
- ✅ Upload product images
- ✅ Manage orders
- ✅ Track revenue

### 🛡 ADMIN Features
- ✅ Full dashboard with analytics
- ✅ Approve/Reject stores
- ✅ Approve/Delete products
- ✅ Manage all users (ban/unban)
- ✅ Manage all orders + status updates
- ✅ Categories management
- ✅ Coupon codes
- ✅ Banner management

### 💳 PAYMENT
- ✅ Paytm Gateway (UPI, Cards, Net Banking, Wallets)
- ✅ Cash on Delivery
- ✅ Payment status tracking
- ✅ Automatic order confirmation

---

## 🆘 TROUBLESHOOTING

**CORS Error:** Add frontend URL to `config/cors.php` allowed_origins

**401 Unauthorized:** Check Sanctum configuration and token in localStorage

**Payment not working:** Verify Paytm MID/MKEY and callback URL is publicly accessible

**Images not showing:** Run `php artisan storage:link`

**Migration failed:** Check DB credentials in .env

---

## 📞 SUPPORT

- Laravel Docs: https://laravel.com/docs
- React Docs: https://react.dev
- Paytm Docs: https://developer.paytm.com
- Railway Docs: https://docs.railway.app

---

Made with ❤️ | RoopMart eCommerce Platform
