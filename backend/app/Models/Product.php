<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'image', 'parent_id', 'is_active', 'sort_order'];

    public function parent()   { return $this->belongsTo(Category::class, 'parent_id'); }
    public function children() { return $this->hasMany(Category::class, 'parent_id'); }
    public function products() { return $this->hasMany(Product::class); }
}

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'store_id', 'category_id', 'name', 'slug', 'description',
        'short_description', 'price', 'sale_price', 'cost_price',
        'sku', 'stock', 'weight', 'brand', 'tags',
        'is_active', 'is_featured', 'is_approved',
        'images', 'specifications', 'rating', 'reviews_count',
        'sold_count', 'meta_title', 'meta_description'
    ];

    protected $casts = [
        'images' => 'array',
        'specifications' => 'array',
        'tags' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_approved' => 'boolean',
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
    ];

    public function store()       { return $this->belongsTo(Store::class); }
    public function category()    { return $this->belongsTo(Category::class); }
    public function reviews()     { return $this->hasMany(Review::class); }
    public function orderItems()  { return $this->hasMany(OrderItem::class); }
    public function wishlists()   { return $this->hasMany(Wishlist::class); }
    public function cartItems()   { return $this->hasMany(CartItem::class); }

    public function getEffectivePriceAttribute()
    {
        return $this->sale_price ?? $this->price;
    }

    public function getDiscountPercentAttribute()
    {
        if ($this->sale_price && $this->price > 0) {
            return round((($this->price - $this->sale_price) / $this->price) * 100);
        }
        return 0;
    }
}

class ProductVariant extends Model
{
    protected $fillable = ['product_id', 'name', 'value', 'price_modifier', 'stock', 'sku'];
}
