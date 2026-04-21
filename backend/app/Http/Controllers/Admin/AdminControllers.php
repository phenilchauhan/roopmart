<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_users'    => User::where('role', 'user')->count(),
            'total_stores'   => Store::count(),
            'total_products' => Product::count(),
            'total_orders'   => Order::count(),
            'revenue'        => Order::where('payment_status', 'paid')->sum('total'),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'pending_stores' => Store::where('status', 'pending')->count(),
            'recent_orders'  => Order::with(['user', 'items'])->orderBy('created_at', 'desc')->limit(10)->get(),
            'recent_users'   => User::orderBy('created_at', 'desc')->limit(5)->get(),
        ]);
    }

    public function stats()
    {
        // Monthly revenue for chart
        $monthlyRevenue = Order::where('payment_status', 'paid')
            ->selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, SUM(total) as revenue, COUNT(*) as orders')
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();

        return response()->json(['monthly_revenue' => $monthlyRevenue]);
    }
}

class AdminProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with(['store', 'category'])
            ->when($request->status === 'pending', fn($q) => $q->where('is_approved', false))
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($products);
    }

    public function approve($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['is_approved' => true]);
        return response()->json(['message' => 'Product approved']);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->update($request->only(['is_active', 'is_featured', 'is_approved']));
        return response()->json(['message' => 'Product updated', 'product' => $product]);
    }

    public function destroy($id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(['message' => 'Product deleted']);
    }
}

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::where('role', 'user')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%"))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($users);
    }

    public function stores(Request $request)
    {
        $stores = Store::with('user')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($stores);
    }

    public function approveStore($id)
    {
        $store = Store::findOrFail($id);
        $store->update(['status' => 'approved']);
        return response()->json(['message' => 'Store approved']);
    }

    public function rejectStore($id)
    {
        $store = Store::findOrFail($id);
        $store->update(['status' => 'rejected']);
        return response()->json(['message' => 'Store rejected']);
    }

    public function ban($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);
        return response()->json(['message' => $user->is_active ? 'User unbanned' : 'User banned']);
    }
}

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with(['user', 'items'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($orders);
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        if ($request->status === 'delivered') {
            $order->update(['delivered_at' => now()]);
        }

        return response()->json(['message' => 'Order status updated', 'order' => $order]);
    }
}

class AdminCategoryController extends Controller
{
    public function index()
    {
        return response()->json(\App\Models\Category::withCount('products')->get());
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:categories']);
        $category = \App\Models\Category::create([
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name),
            'description' => $request->description,
            'parent_id'   => $request->parent_id,
            'is_active'   => true,
        ]);
        return response()->json($category, 201);
    }

    public function update(Request $request, $id)
    {
        $category = \App\Models\Category::findOrFail($id);
        $category->update($request->all());
        return response()->json($category);
    }

    public function destroy($id)
    {
        \App\Models\Category::findOrFail($id)->delete();
        return response()->json(['message' => 'Category deleted']);
    }
}

class AdminCouponController extends Controller
{
    public function index()
    {
        return response()->json(\App\Models\Coupon::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $coupon = \App\Models\Coupon::create($request->all());
        return response()->json($coupon, 201);
    }

    public function update(Request $request, $id)
    {
        $coupon = \App\Models\Coupon::findOrFail($id);
        $coupon->update($request->all());
        return response()->json($coupon);
    }

    public function destroy($id)
    {
        \App\Models\Coupon::findOrFail($id)->delete();
        return response()->json(['message' => 'Coupon deleted']);
    }
}

class AdminBannerController extends Controller
{
    public function index()
    {
        return response()->json(\App\Models\Banner::orderBy('sort_order')->get());
    }

    public function store(Request $request)
    {
        $banner = \App\Models\Banner::create($request->all());
        return response()->json($banner, 201);
    }

    public function update(Request $request, $id)
    {
        \App\Models\Banner::findOrFail($id)->update($request->all());
        return response()->json(['message' => 'Banner updated']);
    }

    public function destroy($id)
    {
        \App\Models\Banner::findOrFail($id)->delete();
        return response()->json(['message' => 'Banner deleted']);
    }
}
