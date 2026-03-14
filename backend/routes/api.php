<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('logout', [AuthController::class, 'logout']);

        Route::apiResource('products', ProductController::class);
        Route::apiResource('orders', OrderController::class)->except(['update']);
        Route::patch('orders/{order}', [OrderController::class, 'update'])->name('orders.update');
    });
});
