<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'store'])
            ->where('is_active', true)
            ->where('is_approved', true);

        // Filters
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->brand) {
            $query->where('brand', $request->brand);
        }
        if ($request->min_price) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->max_price) {
            $query->where('price', '<=', $request->max_price);
        }
        if ($request->rating) {
            $query->where('rating', '>=', $request->rating);
        }

        // Sorting
        switch ($request->sort) {
            case 'price_asc':  $query->orderBy('price', 'asc'); break;
            case 'price_desc': $query->orderBy('price', 'desc'); break;
            case 'rating':     $query->orderBy('rating', 'desc'); break;
            case 'newest':     $query->orderBy('created_at', 'desc'); break;
            case 'popular':    $query->orderBy('sold_count', 'desc'); break;
            default:           $query->orderBy('is_featured', 'desc')->orderBy('created_at', 'desc');
        }

        $products = $query->paginate($request->per_page ?? 20);

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'store', 'reviews.user'])
            ->where('is_active', true)
            ->where('is_approved', true)
            ->findOrFail($id);

        // Related products
        $related = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $id)
            ->where('is_active', true)
            ->where('is_approved', true)
            ->limit(8)
            ->get();

        return response()->json([
            'product' => $product,
            'related' => $related,
        ]);
    }

    public function categories()
    {
        $categories = Category::with('children')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json($categories);
    }

    public function byCategory($id)
    {
        $category = Category::findOrFail($id);
        $products = Product::where('category_id', $id)
            ->where('is_active', true)
            ->where('is_approved', true)
            ->paginate(20);

        return response()->json(['category' => $category, 'products' => $products]);
    }

    public function search(Request $request)
    {
        $query = $request->q;
        $products = Product::with(['category', 'store'])
            ->where('is_active', true)
            ->where('is_approved', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('description', 'LIKE', "%{$query}%")
                  ->orWhere('brand', 'LIKE', "%{$query}%")
                  ->orWhere('tags', 'LIKE', "%{$query}%");
            })
            ->paginate(20);

        return response()->json($products);
    }

    public function featured()
    {
        $products = Product::where('is_featured', true)
            ->where('is_active', true)
            ->where('is_approved', true)
            ->limit(12)
            ->get();

        return response()->json($products);
    }

    public function deals()
    {
        $products = Product::whereNotNull('sale_price')
            ->where('is_active', true)
            ->where('is_approved', true)
            ->orderByRaw('((price - sale_price) / price) DESC')
            ->limit(20)
            ->get();

        return response()->json($products);
    }

    public function newArrivals()
    {
        $products = Product::where('is_active', true)
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->limit(16)
            ->get();

        return response()->json($products);
    }
}
