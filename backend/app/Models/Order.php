<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'order_number', 'status', 'payment_status',
        'payment_method', 'payment_id', 'subtotal', 'discount',
        'shipping_charge', 'tax', 'total', 'coupon_code',
        'shipping_address', 'billing_address', 'notes',
        'estimated_delivery', 'delivered_at'
    ];

    protected $casts = [
        'shipping_address' => 'array',
        'billing_address' => 'array',
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
        'discount' => 'decimal:2',
    ];

    const STATUS = [
        'pending', 'confirmed', 'processing',
        'shipped', 'delivered', 'cancelled', 'returned', 'refunded'
    ];

    public function user()       { return $this->belongsTo(User::class); }
    public function items()      { return $this->hasMany(OrderItem::class); }
    public function payment()    { return $this->hasOne(Payment::class); }
    public function returns()    { return $this->hasMany(ReturnRequest::class); }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($order) {
            $order->order_number = 'RM' . date('Ymd') . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT);
        });
    }
}

class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 'product_id', 'store_id', 'name',
        'image', 'price', 'quantity', 'total', 'status', 'variant'
    ];

    protected $casts = ['variant' => 'array'];

    public function order()   { return $this->belongsTo(Order::class); }
    public function product() { return $this->belongsTo(Product::class); }
    public function store()   { return $this->belongsTo(Store::class); }
}

class CartItem extends Model
{
    protected $fillable = ['user_id', 'product_id', 'quantity', 'variant'];
    protected $casts = ['variant' => 'array'];

    public function product() { return $this->belongsTo(Product::class); }
    public function user()    { return $this->belongsTo(User::class); }
}

class Address extends Model
{
    protected $fillable = [
        'user_id', 'name', 'phone', 'address_line1', 'address_line2',
        'city', 'state', 'pincode', 'country', 'type', 'is_default'
    ];

    public function user() { return $this->belongsTo(User::class); }
}

class Wishlist extends Model
{
    protected $fillable = ['user_id', 'product_id'];

    public function product() { return $this->belongsTo(Product::class); }
    public function user()    { return $this->belongsTo(User::class); }
}

class Review extends Model
{
    protected $fillable = [
        'user_id', 'product_id', 'order_id', 'rating',
        'title', 'comment', 'images', 'is_verified'
    ];

    protected $casts = ['images' => 'array', 'is_verified' => 'boolean'];

    public function user()    { return $this->belongsTo(User::class); }
    public function product() { return $this->belongsTo(Product::class); }
}

class Payment extends Model
{
    protected $fillable = [
        'order_id', 'transaction_id', 'gateway', 'amount',
        'currency', 'status', 'gateway_response', 'refund_id', 'refunded_at'
    ];

    protected $casts = ['gateway_response' => 'array'];

    public function order() { return $this->belongsTo(Order::class); }
}

class Coupon extends Model
{
    protected $fillable = [
        'code', 'type', 'value', 'min_order', 'max_discount',
        'usage_limit', 'used_count', 'is_active', 'expires_at'
    ];

    protected $casts = ['is_active' => 'boolean', 'expires_at' => 'datetime'];

    public function isValid($cartTotal)
    {
        if (!$this->is_active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->usage_limit && $this->used_count >= $this->usage_limit) return false;
        if ($cartTotal < $this->min_order) return false;
        return true;
    }

    public function calculateDiscount($cartTotal)
    {
        $discount = $this->type === 'percent'
            ? ($cartTotal * $this->value / 100)
            : $this->value;

        if ($this->max_discount) {
            $discount = min($discount, $this->max_discount);
        }
        return $discount;
    }
}

class Banner extends Model
{
    protected $fillable = ['title', 'image', 'link', 'type', 'sort_order', 'is_active'];
}

class ReturnRequest extends Model
{
    protected $fillable = [
        'order_id', 'user_id', 'reason', 'description',
        'status', 'images', 'refund_amount'
    ];
    protected $casts = ['images' => 'array'];
}
