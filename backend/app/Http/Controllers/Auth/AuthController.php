<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone'    => 'nullable|string|max:15',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'phone'    => $request->phone,
            'role'     => 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    public function storeRegister(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'         => 'required|string|max:255',
            'email'        => 'required|string|email|unique:users',
            'password'     => 'required|string|min:8|confirmed',
            'phone'        => 'required|string|max:15',
            'store_name'   => 'required|string|max:255',
            'gst_number'   => 'nullable|string|max:20',
            'pan_number'   => 'nullable|string|max:10',
            'store_address'=> 'required|string',
            'city'         => 'required|string',
            'state'        => 'required|string',
            'pincode'      => 'required|string|max:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'phone'    => $request->phone,
            'role'     => 'store',
        ]);

        Store::create([
            'user_id'     => $user->id,
            'name'        => $request->store_name,
            'slug'        => Str::slug($request->store_name) . '-' . $user->id,
            'gst_number'  => $request->gst_number,
            'pan_number'  => $request->pan_number,
            'address'     => $request->store_address,
            'city'        => $request->city,
            'state'       => $request->state,
            'pincode'     => $request->pincode,
            'status'      => 'pending', // admin must approve
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Store registration successful. Awaiting admin approval.',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Account is banned'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user'    => $user->load('store'),
            'token'   => $token,
            'role'    => $user->role,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('store', 'addresses'));
    }

    public function forgotPassword(Request $request)
    {
        // Send reset email logic
        return response()->json(['message' => 'Password reset link sent to your email']);
    }

    public function resetPassword(Request $request)
    {
        // Reset password logic
        return response()->json(['message' => 'Password reset successful']);
    }
}
