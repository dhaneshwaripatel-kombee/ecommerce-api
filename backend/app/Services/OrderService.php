<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use App\Repositories\OrderRepository;
use App\Repositories\ProductRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use InvalidArgumentException;

class OrderService
{
    private const PER_PAGE_MIN = 1;

    private const PER_PAGE_MAX = 100;

    private const PER_PAGE_DEFAULT = 15;

    public function __construct(
        private OrderRepository $orderRepository,
        private ProductRepository $productRepository
    ) {}

    /**
     * List orders for the given user with optional status filter and pagination.
     */
    public function listOrders(User $user, int $perPage = self::PER_PAGE_DEFAULT, ?string $status = null): LengthAwarePaginator
    {
        $perPage = min(max($perPage, self::PER_PAGE_MIN), self::PER_PAGE_MAX);

        return $this->orderRepository->paginateForUser($user, $perPage, $status);
    }

    public function getOrder(int $id, User $user): ?Order
    {
        return $this->orderRepository->findForUser($id, $user);
    }

    /**
     * Create order: fetch product price, calculate total_price, validate stock, decrease stock.
     *
     * @throws InvalidArgumentException
     */
    public function createOrder(User $user, array $data): Order
    {
        $product = $this->productRepository->find($data['product_id']);
        if (! $product) {
            throw new InvalidArgumentException('Product not found.');
        }

        $quantity = (int) $data['quantity'];
        if ($quantity <= 0) {
            throw new InvalidArgumentException('Quantity must be positive.');
        }

        if ($product->stock < $quantity) {
            throw new InvalidArgumentException('Insufficient stock.');
        }

        $totalPrice = (float) $product->price * $quantity;

        $order = $this->orderRepository->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => $quantity,
            'total_price' => $totalPrice,
            'status' => $data['status'] ?? 'pending',
        ]);

        $product->decrement('stock', $quantity);

        return $order->load('product');
    }

    /**
     * Update order. Ensures the order belongs to the user.
     *
     * @throws InvalidArgumentException when order does not belong to user
     */
    public function updateOrder(Order $order, User $user, array $data): Order
    {
        if ($order->user_id !== $user->id) {
            throw new InvalidArgumentException('Order not found.');
        }

        $this->orderRepository->update($order, $data);
        $order->refresh()->load('product');

        return $order;
    }

    /**
     * Delete order. Ensures the order belongs to the user.
     *
     * @throws InvalidArgumentException when order does not belong to user
     */
    public function deleteOrder(Order $order, User $user): void
    {
        if ($order->user_id !== $user->id) {
            throw new InvalidArgumentException('Order not found.');
        }

        $this->orderRepository->delete($order);
    }
}
