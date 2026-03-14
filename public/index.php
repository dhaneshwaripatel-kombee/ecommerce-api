<?php

/**
 * Delegates to the Laravel backend (backend/public).
 * Use this when your web server document root is the repo root (e.g. Laragon).
 * Preferred: point document root to backend/public instead.
 */

$backendPublic = __DIR__ . '/../backend/public';

if (! is_dir($backendPublic) || ! file_exists($backendPublic . '/index.php')) {
    http_response_code(500);
    echo 'Backend not found. Point document root to backend/public or run: php artisan serve (from backend/).';
    exit(1);
}

chdir($backendPublic);
require $backendPublic . '/index.php';
