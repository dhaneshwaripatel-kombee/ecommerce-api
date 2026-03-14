<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = User::factory(50)->create();
        $products = Product::factory(200)->create();

        for ($i = 0; $i < 500; $i++) {
            $user = $users->random();
            $product = $products->random();
            $quantity = min(
                fake()->numberBetween(1, 10),
                $product->stock
            );

            if ($quantity < 1) {
                continue;
            }

            Order::query()->create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'total_price' => (float) $product->price * $quantity,
                'status' => fake()->randomElement(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
            ]);

            $product->decrement('stock', $quantity);
        }
    }
}
