<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    // Paytm credentials from .env
    private $merchantId;
    private $merchantKey;
    private $website;
    private $channelId;
    private $industryType;
    private $callbackUrl;

    public function __construct()
    {
        $this->merchantId   = config('paytm.merchant_id');
        $this->merchantKey  = config('paytm.merchant_key');
        $this->website      = config('paytm.website');
        $this->channelId    = config('paytm.channel_id');
        $this->industryType = config('paytm.industry_type');
        $this->callbackUrl  = config('paytm.callback_url');
    }

    public function initiate(Request $request)
    {
        $request->validate(['order_id' => 'required|exists:orders,id']);

        $order = Order::where('user_id', $request->user()->id)->findOrFail($request->order_id);

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Order already paid'], 400);
        }

        $params = [
            'MID'             => $this->merchantId,
            'ORDER_ID'        => $order->order_number,
            'CUST_ID'         => $request->user()->id,
            'TXN_AMOUNT'      => number_format($order->total, 2, '.', ''),
            'CHANNEL_ID'      => $this->channelId,
            'WEBSITE'         => $this->website,
            'INDUSTRY_TYPE_ID'=> $this->industryType,
            'CALLBACK_URL'    => $this->callbackUrl,
            'EMAIL'           => $request->user()->email,
            'MOBILE_NO'       => $request->user()->phone ?? '',
        ];

        $checksum = $this->generateChecksum($params, $this->merchantKey);
        $params['CHECKSUMHASH'] = $checksum;

        return response()->json([
            'merchant_id' => $this->merchantId,
            'order_id'    => $order->order_number,
            'amount'      => $order->total,
            'checksum'    => $checksum,
            'params'      => $params,
            'payment_url' => config('paytm.environment') === 'production'
                ? 'https://securegw.paytm.in/theia/processTransaction'
                : 'https://securegw-stage.paytm.in/theia/processTransaction',
        ]);
    }

    public function callback(Request $request)
    {
        $data = $request->all();

        Log::info('Paytm Callback', $data);

        $orderId  = $data['ORDERID'] ?? null;
        $txnId    = $data['TXNID'] ?? null;
        $status   = $data['STATUS'] ?? null;
        $amount   = $data['TXNAMOUNT'] ?? null;
        $checksum = $data['CHECKSUMHASH'] ?? null;

        // Verify checksum
        $verified = $this->verifyChecksum($data, $this->merchantKey, $checksum);

        if (!$verified) {
            return response()->json(['message' => 'Checksum verification failed'], 400);
        }

        $order = Order::where('order_number', $orderId)->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if ($status === 'TXN_SUCCESS') {
            $order->update([
                'payment_status' => 'paid',
                'payment_id'     => $txnId,
                'status'         => 'confirmed',
            ]);

            Payment::create([
                'order_id'         => $order->id,
                'transaction_id'   => $txnId,
                'gateway'          => 'paytm',
                'amount'           => $amount,
                'currency'         => 'INR',
                'status'           => 'success',
                'gateway_response' => $data,
            ]);
        } elseif ($status === 'TXN_FAILURE') {
            $order->update(['payment_status' => 'failed']);

            Payment::create([
                'order_id'         => $order->id,
                'transaction_id'   => $txnId,
                'gateway'          => 'paytm',
                'amount'           => $amount,
                'currency'         => 'INR',
                'status'           => 'failed',
                'gateway_response' => $data,
            ]);
        }

        // Redirect to frontend
        $frontendUrl = config('app.frontend_url');
        return redirect("{$frontendUrl}/payment/result?order={$orderId}&status={$status}");
    }

    public function status(Request $request)
    {
        $order = Order::where('order_number', $request->order)->first();
        return response()->json([
            'order_number'   => $order->order_number,
            'payment_status' => $order->payment_status,
            'order_status'   => $order->status,
        ]);
    }

    // ---- Checksum Helpers ----
    private function generateChecksum($params, $key)
    {
        $str = implode('|', array_values($params));
        return hash_hmac('sha256', $str, $key);
    }

    private function verifyChecksum($params, $key, $checksum)
    {
        $received = $checksum;
        unset($params['CHECKSUMHASH']);
        $str = implode('|', array_values($params));
        $generated = hash_hmac('sha256', $str, $key);
        return $received === $generated;
    }
}
