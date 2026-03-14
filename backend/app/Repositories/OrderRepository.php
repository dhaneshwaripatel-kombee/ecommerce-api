<?php

namespace App\Repositories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OrderRepository
{
    public function __construct(
        private Order $model
    ) {}

    public function paginateForUser(User $user, int $perPage = 15, ?string $status = null): LengthAwarePaginator
    {
        $query = $this->model->newQuery()->where('user_id', $user->id)->with('product');

        if ($status !== null && $status !== '') {
            $query->where('status', $status);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function find(int $id): ?Order
    {
        return $this->model->with(['product', 'user'])->find($id);
    }

    public function findForUser(int $id, User $user): ?Order
    {
        return $this->model->with('product')->where('user_id', $user->id)->find($id);
    }

    public function create(array $data): Order
    {
        return $this->model->create($data);
    }

    public function update(Order $order, array $data): bool
    {
        return $order->update($data);
    }

    public function delete(Order $order): bool
    {
        return $order->delete();
    }
}
