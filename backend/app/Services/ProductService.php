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

        $cacheKey = 'products_list_' . md5(json_encode(array_merge($filters, ['per_page' => $perPage, 'page' => request('page', 1)])));

        return \Illuminate\Support\Facades\Cache::tags(['products'])->remember($cacheKey, 3600, function () use ($perPage, $filters) {
            return $this->productRepository->paginate($perPage, $filters);
        });
    }

    public function getProduct(int $id): ?Product
    {
        return \Illuminate\Support\Facades\Cache::tags(['products'])->remember("product_{$id}", 3600, function () use ($id) {
            return $this->productRepository->find($id);
        });
    }

    public function createProduct(array $data): Product
    {
        $product = $this->productRepository->create($data);
        $this->clearCache();
        return $product;
    }

    public function updateProduct(Product $product, array $data): bool
    {
        $updated = $this->productRepository->update($product, $data);
        if ($updated) {
            $this->clearCache($product->id);
        }
        return $updated;
    }

    public function deleteProduct(Product $product): bool
    {
        $deleted = $this->productRepository->delete($product);
        if ($deleted) {
            $this->clearCache($product->id);
        }
        return $deleted;
    }

    private function clearCache(?int $productId = null): void
    {
        \Illuminate\Support\Facades\Cache::tags(['products'])->flush();
    }
}
