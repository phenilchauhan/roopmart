<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Store\StoreController;
use App\Http\Controllers\Store\StoreProductController;
use App\Http\Controllers\Store\StoreOrderController;
use App\Http\Controllers\User\ProductController;
use App\Http\Controllers\User\CartController;
use App\Http\Controllers\User\OrderController;
use App\Http\Controllers\User\WishlistController;
use App\Http\Controllers\User\ReviewController;
use App\Http\Controllers\User\ProfileController;
use App\Http\Controllers\PaymentController;

// ========================
// PUBLIC ROUTES
// ========================
Route::prefix('v1')->group(function () {

    // Auth
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/store/register', [AuthController::class, 'storeRegister']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    // Public Product Routes
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::get('/categories', [ProductController::class, 'categories']);
    Route::get('/categories/{id}/products', [ProductController::class, 'byCategory']);
    Route::get('/search', [ProductController::class, 'search']);
    Route::get('/featured', [ProductController::class, 'featured']);
    Route::get('/deals', [ProductController::class, 'deals']);
    Route::get('/new-arrivals', [ProductController::class, 'newArrivals']);

    // Payment Callback (public)
    Route::post('/payment/callback', [PaymentController::class, 'callback']);
    Route::get('/payment/status', [PaymentController::class, 'status']);

    // ========================
    // AUTHENTICATED USER ROUTES
    // ========================
    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        // Profile
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::put('/profile/password', [ProfileController::class, 'changePassword']);
        Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
        Route::get('/addresses', [ProfileController::class, 'addresses']);
        Route::post('/addresses', [ProfileController::class, 'addAddress']);
        Route::put('/addresses/{id}', [ProfileController::class, 'updateAddress']);
        Route::delete('/addresses/{id}', [ProfileController::class, 'deleteAddress']);

        // Cart
        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart', [CartController::class, 'add']);
        Route::put('/cart/{id}', [CartController::class, 'update']);
        Route::delete('/cart/{id}', [CartController::class, 'remove']);
        Route::delete('/cart', [CartController::class, 'clear']);
        Route::post('/cart/coupon', [CartController::class, 'applyCoupon']);

        // Orders
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        Route::post('/orders', [OrderController::class, 'place']);
        Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
        Route::post('/orders/{id}/return', [OrderController::class, 'returnRequest']);

        // Payment
        Route::post('/payment/initiate', [PaymentController::class, 'initiate']);
        Route::get('/payment/{orderId}', [PaymentController::class, 'getStatus']);

        // Wishlist
        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist/{productId}', [WishlistController::class, 'toggle']);

        // Reviews
        Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);
        Route::get('/products/{id}/reviews', [ReviewController::class, 'index']);
        Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
    });

    // ========================
    // STORE OWNER ROUTES
    // ========================
    Route::middleware(['auth:sanctum', 'role:store'])->prefix('store')->group(function () {
        Route::get('/dashboard', [StoreController::class, 'dashboard']);
        Route::get('/stats', [StoreController::class, 'stats']);

        // Store Products
        Route::get('/products', [StoreProductController::class, 'index']);
        Route::post('/products', [StoreProductController::class, 'store']);
        Route::get('/products/{id}', [StoreProductController::class, 'show']);
        Route::put('/products/{id}', [StoreProductController::class, 'update']);
        Route::delete('/products/{id}', [StoreProductController::class, 'destroy']);
        Route::post('/products/{id}/images', [StoreProductController::class, 'uploadImages']);

        // Store Orders
        Route::get('/orders', [StoreOrderController::class, 'index']);
        Route::get('/orders/{id}', [StoreOrderController::class, 'show']);
        Route::put('/orders/{id}/status', [StoreOrderController::class, 'updateStatus']);

        // Store Profile
        Route::get('/profile', [StoreController::class, 'profile']);
        Route::put('/profile', [StoreController::class, 'updateProfile']);
    });

    // ========================
    // ADMIN ROUTES
    // ========================
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::get('/stats', [AdminDashboardController::class, 'stats']);
        Route::get('/analytics', [AdminDashboardController::class, 'analytics']);

        // Users Management
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{id}', [AdminUserController::class, 'show']);
        Route::put('/users/{id}', [AdminUserController::class, 'update']);
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
        Route::post('/users/{id}/ban', [AdminUserController::class, 'ban']);

        // Store Management
        Route::get('/stores', [AdminUserController::class, 'stores']);
        Route::post('/stores/{id}/approve', [AdminUserController::class, 'approveStore']);
        Route::post('/stores/{id}/reject', [AdminUserController::class, 'rejectStore']);

        // Categories
        Route::apiResource('/categories', AdminCategoryController::class);

        // Products
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::get('/products/{id}', [AdminProductController::class, 'show']);
        Route::put('/products/{id}', [AdminProductController::class, 'update']);
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
        Route::post('/products/{id}/approve', [AdminProductController::class, 'approve']);

        // Orders
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
        Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

        // Coupons
        Route::apiResource('/coupons', \App\Http\Controllers\Admin\AdminCouponController::class);

        // Banners
        Route::apiResource('/banners', \App\Http\Controllers\Admin\AdminBannerController::class);
    });
});
