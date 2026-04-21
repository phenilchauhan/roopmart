<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class StoreController extends Controller
{
    public function dashboard(Request $request)
    {
        $store = $request->user()->store;

        return response()->json([
            'total_products'  => Product::where('store_id', $store->id)->count(),
            'total_orders'    => OrderItem::where('store_id', $store->id)->distinct('order_id')->count(),
            'total_revenue'   => OrderItem::where('store_id', $store->id)->sum('total'),
            'pending_orders'  => OrderItem::where('store_id', $store->id)->where('status', 'pending')->count(),
            'recent_orders'   => OrderItem::with(['order.user', 'product'])
                                    ->where('store_id', $store->id)
                                    ->orderBy('created_at', 'desc')
                                    ->limit(10)->get(),
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json($request->user()->store);
    }

    public function updateProfile(Request $request)
    {
        $store = $request->user()->store;
        $store->update($request->only(['name', 'description', 'phone', 'email', 'address', 'city', 'state', 'pincode']));
        return response()->json($store);
    }
}

class StoreProductController extends Controller
{
    public function index(Request $request)
    {
        $storeId  = $request->user()->store->id;
        $products = Product::where('store_id', $storeId)
            ->with('category')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'description' => 'required|string',
        ]);

        $storeId = $request->user()->store->id;

        $product = Product::create([
            'store_id'          => $storeId,
            'category_id'       => $request->category_id,
            'name'              => $request->name,
            'slug'              => Str::slug($request->name) . '-' . time(),
            'description'       => $request->description,
            'short_description' => $request->short_description,
            'price'             => $request->price,
            'sale_price'        => $request->sale_price,
            'cost_price'        => $request->cost_price,
            'sku'               => $request->sku ?? 'SKU-' . strtoupper(Str::random(8)),
            'stock'             => $request->stock,
            'brand'             => $request->brand,
            'tags'              => $request->tags,
            'specifications'    => $request->specifications,
            'is_active'         => true,
            'is_approved'       => false, // needs admin approval
        ]);

        return response()->json(['message' => 'Product added, awaiting approval', 'product' => $product], 201);
    }

    public function update(Request $request, $id)
    {
        $storeId = $request->user()->store->id;
        $product = Product::where('store_id', $storeId)->findOrFail($id);
        $product->update($request->except(['store_id', 'is_approved']));
        return response()->json(['message' => 'Product updated', 'product' => $product]);
    }

    public function destroy(Request $request, $id)
    {
        $storeId = $request->user()->store->id;
        Product::where('store_id', $storeId)->findOrFail($id)->delete();
        return response()->json(['message' => 'Product deleted']);
    }

    public function uploadImages(Request $request, $id)
    {
        $storeId = $request->user()->store->id;
        $product = Product::where('store_id', $storeId)->findOrFail($id);

        $images = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path     = $image->store('products', 'public');
                $images[] = Storage::url($path);
            }
        }

        $existing = $product->images ?? [];
        $product->update(['images' => array_merge($existing, $images)]);

        return response()->json(['message' => 'Images uploaded', 'images' => $product->images]);
    }
}

class StoreOrderController extends Controller
{
    public function index(Request $request)
    {
        $storeId = $request->user()->store->id;
        $items   = OrderItem::with(['order.user', 'product'])
            ->where('store_id', $storeId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($items);
    }

    public function updateStatus(Request $request, $id)
    {
        $storeId = $request->user()->store->id;
        $item    = OrderItem::where('store_id', $storeId)->findOrFail($id);
        $item->update(['status' => $request->status]);
        return response()->json(['message' => 'Status updated']);
    }
}
