<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with('items.product')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    public function show(Request $request, $id)
    {
        $order = Order::with(['items.product', 'items.store', 'payment'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json($order);
    }

    public function place(Request $request)
    {
        $request->validate([
            'shipping_address'   => 'required|array',
            'payment_method'     => 'required|in:paytm,cod,card',
            'coupon_code'        => 'nullable|string',
        ]);

        $user = $request->user();
        $cartItems = CartItem::with('product')->where('user_id', $user->id)->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        return DB::transaction(function () use ($request, $user, $cartItems) {
            $subtotal = 0;
            $orderItems = [];

            foreach ($cartItems as $item) {
                $product = $item->product;
                if ($product->stock < $item->quantity) {
                    throw new \Exception("Insufficient stock for {$product->name}");
                }
                $price     = $product->sale_price ?? $product->price;
                $total     = $price * $item->quantity;
                $subtotal += $total;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'store_id'   => $product->store_id,
                    'name'       => $product->name,
                    'image'      => $product->images[0] ?? null,
                    'price'      => $price,
                    'quantity'   => $item->quantity,
                    'total'      => $total,
                    'variant'    => $item->variant,
                    'status'     => 'pending',
                ];

                $product->decrement('stock', $item->quantity);
                $product->increment('sold_count', $item->quantity);
            }

            $discount       = 0;
            $couponCode     = null;
            if ($request->coupon_code) {
                $coupon = Coupon::where('code', strtoupper($request->coupon_code))->first();
                if ($coupon && $coupon->isValid($subtotal)) {
                    $discount   = $coupon->calculateDiscount($subtotal);
                    $couponCode = $coupon->code;
                    $coupon->increment('used_count');
                }
            }

            $shippingCharge = $subtotal > 500 ? 0 : 49;
            $tax            = round(($subtotal - $discount) * 0.18, 2);
            $total          = $subtotal - $discount + $shippingCharge + $tax;

            $order = Order::create([
                'user_id'          => $user->id,
                'status'           => 'pending',
                'payment_status'   => 'pending',
                'payment_method'   => $request->payment_method,
                'subtotal'         => $subtotal,
                'discount'         => $discount,
                'shipping_charge'  => $shippingCharge,
                'tax'              => $tax,
                'total'            => $total,
                'coupon_code'      => $couponCode,
                'shipping_address' => $request->shipping_address,
                'billing_address'  => $request->billing_address ?? $request->shipping_address,
                'notes'            => $request->notes,
            ]);

            foreach ($orderItems as &$item) {
                $item['order_id'] = $order->id;
            }
            OrderItem::insert($orderItems);

            CartItem::where('user_id', $user->id)->delete();

            return response()->json([
                'message' => 'Order placed successfully',
                'order'   => $order->load('items'),
            ], 201);
        });
    }

    public function cancel(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json(['message' => 'Order cannot be cancelled at this stage'], 400);
        }

        $order->update(['status' => 'cancelled']);

        // Restore stock
        foreach ($order->items as $item) {
            $item->product->increment('stock', $item->quantity);
        }

        return response()->json(['message' => 'Order cancelled successfully']);
    }

    public function returnRequest(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);

        if ($order->status !== 'delivered') {
            return response()->json(['message' => 'Only delivered orders can be returned'], 400);
        }

        \App\Models\ReturnRequest::create([
            'order_id'      => $order->id,
            'user_id'       => $request->user()->id,
            'reason'        => $request->reason,
            'description'   => $request->description,
            'status'        => 'pending',
        ]);

        return response()->json(['message' => 'Return request submitted successfully']);
    }
}
