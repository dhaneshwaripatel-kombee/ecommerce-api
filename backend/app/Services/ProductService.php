<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductService
{
    private const PER_PAGE_MIN = 1;

    private const PER_PAGE_MAX = 100;

    private const PER_PAGE_DEFAULT = 15;

    public function __construct(
        private ProductRepository $productRepository
    ) {}

    /**
     * List products with filtering and pagination.
     *
     * @param  array{name?: string, price_min?: float, price_max?: float}  $filters
     */
    public function listProducts(int $perPage = self::PER_PAGE_DEFAULT, array $filters = []): LengthAwarePaginator
    {
        $perPage = min(max($perPage, self::PER_PAGE_MIN), self::PER_PAGE_MAX);
        $filters = array_filter($filters, fn ($v) => $v !== null && $v !== '');

        return $this->productRepository->paginate($perPage, $filters);
    }

    public function getProduct(int $id): ?Product
    {
        return $this->productRepository->find($id);
    }

    public function createProduct(array $data): Product
    {
        return $this->productRepository->create($data);
    }

    public function updateProduct(Product $product, array $data): bool
    {
        return $this->productRepository->update($product, $data);
    }

    public function deleteProduct(Product $product): bool
    {
        return $this->productRepository->delete($product);
    }
}
