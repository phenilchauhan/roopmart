<?php
// ===================== STORE MODEL =====================
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    protected $fillable = [
        'user_id', 'name', 'slug', 'description', 'logo',
        'banner', 'phone', 'email', 'address', 'city',
        'state', 'pincode', 'gst_number', 'pan_number',
        'bank_account', 'ifsc_code', 'status', 'rating'
    ];

    public function user()     { return $this->belongsTo(User::class); }
    public function products() { return $this->hasMany(Product::class); }
    public function orders()   { return $this->hasManyThrough(OrderItem::class, Product::class); }
}
