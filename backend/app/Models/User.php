<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'role',
        'avatar', 'is_active', 'email_verified_at'
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    // Roles: user, store, admin
    public function isAdmin() { return $this->role === 'admin'; }
    public function isStore() { return $this->role === 'store'; }
    public function isUser()  { return $this->role === 'user'; }

    public function store()     { return $this->hasOne(Store::class); }
    public function orders()    { return $this->hasMany(Order::class); }
    public function cart()      { return $this->hasMany(CartItem::class); }
    public function wishlist()  { return $this->hasMany(Wishlist::class); }
    public function addresses() { return $this->hasMany(Address::class); }
    public function reviews()   { return $this->hasMany(Review::class); }
}
