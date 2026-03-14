<?php

namespace App\Observers;

use App\Models\Order;
use App\Models\Product;

class OrderObserver
{
    /**
     * Ensure total_price is calculated from product price * quantity before save.
     */
    public function saving(Order $order): void
    {
        $shouldRecalculate = $order->isDirty(['product_id', 'quantity'])
            || (! $order->exists && $order->product_id && $order->quantity);

        if (! $shouldRecalculate) {
            return;
        }

        $product = $order->product_id
            ? (($order->relationLoaded('product') && $order->product) ? $order->product : Product::find($order->product_id))
            : null;

        if ($product && $order->quantity > 0) {
            $order->setAttribute(
                'total_price',
                round((float) $product->price * (int) $order->quantity, 2)
            );
        }
    }
}
