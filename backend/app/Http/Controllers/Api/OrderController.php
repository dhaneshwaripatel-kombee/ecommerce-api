<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderRequest;
use App\Models\Order;
use App\Services\OrderService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class OrderController extends Controller
{
    use ApiResponse;

    public function __construct(
        private OrderService $orderService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = (int) $request->input('per_page', 15);
        $status = $request->input('status');

        $paginated = $this->orderService->listOrders($user, $perPage, $status);

        return $this->successResponse('Orders retrieved successfully', $paginated);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = $this->orderService->getOrder($id, $request->user());

        if (! $order) {
            return $this->errorResponse('Order not found', 404);
        }

        return $this->successResponse('Order retrieved successfully', $order);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        try {
            $order = $this->orderService->createOrder($request->user(), $request->validated());
        } catch (InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse('Order created', $order, 201);
    }

    public function update(UpdateOrderRequest $request, Order $order): JsonResponse
    {
        try {
            $order = $this->orderService->updateOrder($order, $request->user(), $request->validated());
        } catch (InvalidArgumentException $e) {
            return $this->errorResponse('Order not found', 404);
        }

        return $this->successResponse('Order updated', $order);
    }

    public function destroy(Request $request, Order $order): JsonResponse
    {
        try {
            $this->orderService->deleteOrder($order, $request->user());
        } catch (InvalidArgumentException $e) {
            return $this->errorResponse('Order not found', 404);
        }

        return $this->successResponse('Order deleted', null, 200);
    }
}
