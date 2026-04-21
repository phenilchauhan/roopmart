<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $items = CartItem::with('product.store')
            ->where('user_id', $request->user()->id)
            ->get();

        $subtotal = $items->sum(fn($item) =>
            ($item->product->sale_price ?? $item->product->price) * $item->quantity
        );

        return response()->json([
            'items'    => $items,
            'subtotal' => $subtotal,
            'count'    => $items->count(),
        ]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
            'variant'    => 'nullable|array',
        ]);

        $product = Product::findOrFail($request->product_id);

        if ($product->stock < $request->quantity) {
            return response()->json(['message' => 'Insufficient stock'], 400);
        }

        $cartItem = CartItem::updateOrCreate(
            ['user_id' => $request->user()->id, 'product_id' => $request->product_id],
            ['quantity' => $request->quantity, 'variant' => $request->variant]
        );

        return response()->json(['message' => 'Added to cart', 'item' => $cartItem->load('product')]);
    }

    public function update(Request $request, $id)
    {
        $item = CartItem::where('user_id', $request->user()->id)->findOrFail($id);
        $item->update(['quantity' => $request->quantity]);
        return response()->json(['message' => 'Cart updated', 'item' => $item]);
    }

    public function remove(Request $request, $id)
    {
        CartItem::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(['message' => 'Item removed']);
    }

    public function clear(Request $request)
    {
        CartItem::where('user_id', $request->user()->id)->delete();
        return response()->json(['message' => 'Cart cleared']);
    }

    public function applyCoupon(Request $request)
    {
        $coupon = Coupon::where('code', strtoupper($request->code))->first();
        $cartTotal = $request->cart_total;

        if (!$coupon || !$coupon->isValid($cartTotal)) {
            return response()->json(['message' => 'Invalid or expired coupon'], 400);
        }

        $discount = $coupon->calculateDiscount($cartTotal);

        return response()->json([
            'message'  => 'Coupon applied successfully',
            'discount' => $discount,
            'coupon'   => $coupon,
        ]);
    }
}
