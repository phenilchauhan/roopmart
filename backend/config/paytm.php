<?php

return [
    'merchant_id'   => env('PAYTM_MERCHANT_ID'),
    'merchant_key'  => env('PAYTM_MERCHANT_KEY'),
    'website'       => env('PAYTM_WEBSITE', 'WEBSTAGING'),
    'channel_id'    => env('PAYTM_CHANNEL_ID', 'WEB'),
    'industry_type' => env('PAYTM_INDUSTRY_TYPE', 'Retail'),
    'environment'   => env('PAYTM_ENVIRONMENT', 'sandbox'),
    'callback_url'  => env('PAYTM_CALLBACK_URL'),
];
