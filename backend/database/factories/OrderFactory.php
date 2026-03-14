<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $product = Product::query()->inRandomOrder()->first();
        $quantity = fake()->numberBetween(1, $product ? min($product->stock, 10) : 5);
        $unitPrice = $product ? (float) $product->price : fake()->randomFloat(2, 5, 100);

        return [
            'user_id' => User::factory(),
            'product_id' => $product?->id ?? Product::factory(),
            'quantity' => $quantity,
            'total_price' => $unitPrice * $quantity,
            'status' => fake()->randomElement(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
        ];
    }

    /**
     * Create order for existing user and product (for seeder).
     */
    public function forExisting(User $user, Product $product): static
    {
        $quantity = fake()->numberBetween(1, min($product->stock, 20));
        $totalPrice = (float) $product->price * $quantity;

        return $this->state(fn () => [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => $quantity,
            'total_price' => $totalPrice,
            'status' => fake()->randomElement(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
        ]);
    }
}
