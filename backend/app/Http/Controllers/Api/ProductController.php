<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\Product;
use App\Services\ProductService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ProductService $productService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $filters = $request->only(['name', 'price_min', 'price_max', 'sort_price']);

        $paginated = $this->productService->listProducts($perPage, $filters);

        return $this->successResponse('Products retrieved successfully', $paginated);
    }

    public function show(int $id): JsonResponse
    {
        $product = $this->productService->getProduct($id);

        if (! $product) {
            return $this->errorResponse('Product not found', 404);
        }

        return $this->successResponse('Product retrieved successfully', $product);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->productService->createProduct($request->validated());

        return $this->successResponse('Product created', $product, 201);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $this->productService->updateProduct($product, $request->validated());
        $product->refresh();

        return $this->successResponse('Product updated', $product);
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->productService->deleteProduct($product);

        return $this->successResponse('Product deleted', null, 200);
    }
}
