<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes — SIMTAG Disdik Pamekasan
|--------------------------------------------------------------------------
| Base URL: /api
|
| Auth: JWT Bearer token
| Guard: api (jwt driver)
| Permissions: Spatie Permission (guard_name = 'api')
|
*/

// ─── Public Routes (No Auth Required) ─────────────────────────────────────────

// Auth endpoints
Route::prefix('auth')->group(function () {
    Route::post('/login',           [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);
});

// Public portal — berita & pengumuman (no login required)
Route::prefix('public')->group(function () {
    Route::get('/articles',         [\App\Http\Controllers\Api\Public\PublicArticleController::class, 'index']);
    Route::get('/articles/{slug}',  [\App\Http\Controllers\Api\Public\PublicArticleController::class, 'show']);
});

// QR Code document verification (no login — for bank officers or public scan)
Route::get('/verify/doc/{token}',   [\App\Http\Controllers\Api\Public\DocumentVerificationController::class, 'verify']);

// Ijazah tracking by ticket number (no login — for students/parents)
Route::get('/track/ijazah/{ticket}', [\App\Http\Controllers\Api\Public\IjazahTrackingController::class, 'track']);


// ─── Authenticated Routes (JWT Required) ──────────────────────────────────────

Route::middleware('jwt.auth')->group(function () {

    // Auth management
    Route::prefix('auth')->group(function () {
        Route::post('/logout',  [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/me',       [AuthController::class, 'me']);
    });

    // Dashboard stats (role-aware, returns appropriate data per role)
    Route::get('/dashboard', [\App\Http\Controllers\Api\DashboardController::class, 'index']);

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/',          [\App\Http\Controllers\Api\NotificationController::class, 'index']);
        Route::patch('/{id}/read',[\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
        Route::post('/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllRead']);
    });

    // ── User Management (permission gated) ─────────────────────────────────
    Route::prefix('users')->middleware('permission:users.view')->group(function () {
        Route::get('/export', [\App\Http\Controllers\Api\UserController::class, 'export']);
        Route::get('/template', [\App\Http\Controllers\Api\UserController::class, 'template']);
        Route::post('/import', [\App\Http\Controllers\Api\UserController::class, 'import']);
        Route::get('/',          [\App\Http\Controllers\Api\UserController::class, 'index']);
        Route::get('/{id}',      [\App\Http\Controllers\Api\UserController::class, 'show']);
        Route::post('/',         [\App\Http\Controllers\Api\UserController::class, 'store'])->middleware('permission:users.create');
        Route::put('/{id}',      [\App\Http\Controllers\Api\UserController::class, 'update'])->middleware('permission:users.edit');
        Route::delete('/{id}',   [\App\Http\Controllers\Api\UserController::class, 'destroy'])->middleware('permission:users.delete');
        Route::patch('/{id}/toggle-active', [\App\Http\Controllers\Api\UserController::class, 'toggleActive'])->middleware('permission:users.toggle-active');
        Route::post('/{id}/assign-role',    [\App\Http\Controllers\Api\UserController::class, 'assignRole'])->middleware('permission:users.assign-role');
    });

    // ── Profile (own account) ───────────────────────────────────────────────
    Route::prefix('profile')->group(function () {
        Route::get('/',            [\App\Http\Controllers\Api\ProfileController::class, 'show']);
        Route::put('/',            [\App\Http\Controllers\Api\ProfileController::class, 'update']);
        Route::post('/photo',      [\App\Http\Controllers\Api\ProfileController::class, 'uploadPhoto']);
        Route::post('/password',   [\App\Http\Controllers\Api\ProfileController::class, 'changePassword']);
        Route::post('/signature',  [\App\Http\Controllers\Api\ProfileController::class, 'uploadSignature']);
    });

    // ── Roles & Permissions ─────────────────────────────────────────────────
    Route::middleware('permission:roles.view')->group(function () {
        Route::get('/roles/permissions-matrix', [\App\Http\Controllers\Api\RoleController::class, 'permissionsMatrix']);
        Route::apiResource('roles',       \App\Http\Controllers\Api\RoleController::class);
        Route::apiResource('permissions', \App\Http\Controllers\Api\PermissionController::class)->only(['index']);
    });

    // ── Institutions ────────────────────────────────────────────────────────
    Route::apiResource('institutions', \App\Http\Controllers\Api\InstitutionController::class);
    Route::get('/institutions/search', [\App\Http\Controllers\Api\InstitutionController::class, 'search']);

    // ── Divisions ───────────────────────────────────────────────────────────
    Route::apiResource('divisions', \App\Http\Controllers\Api\DivisionController::class);

    // ── System Settings ─────────────────────────────────────────────────────
    Route::prefix('settings')->middleware('permission:settings.view')->group(function () {
        Route::get('/',              [\App\Http\Controllers\Api\SettingController::class, 'index']);
        Route::put('/',              [\App\Http\Controllers\Api\SettingController::class, 'update'])->middleware('permission:settings.edit');
        Route::post('/logo',         [\App\Http\Controllers\Api\SettingController::class, 'uploadLogo'])->middleware('permission:settings.edit');
    });

    // ── Approval Flow Config ────────────────────────────────────────────────
    Route::prefix('approval-flows')->middleware('permission:approval-flows.view')->group(function () {
        Route::get('/',              [\App\Http\Controllers\Api\ApprovalFlowController::class, 'index']);
        Route::put('/{module}',      [\App\Http\Controllers\Api\ApprovalFlowController::class, 'update'])->middleware('permission:approval-flows.edit');
    });

    // ── Master Data ─────────────────────────────────────────────────────────
    Route::apiResource('transport-types', \App\Http\Controllers\Api\TransportTypeController::class);
    Route::get('/article-categories', [\App\Http\Controllers\Api\ArticleCategoryController::class, 'index']);
    Route::apiResource('article-categories', \App\Http\Controllers\Api\ArticleCategoryController::class)->middleware('permission:article-categories.manage');

    // ── RBAC & Master Data Management ───────────────────────────────────────────────
    Route::apiResource('institutions', \App\Http\Controllers\Api\InstitutionController::class);
    Route::apiResource('divisions', \App\Http\Controllers\Api\DivisionController::class);

    Route::prefix('guest-book')->group(function () {
        Route::get('/',              [\App\Http\Controllers\Api\GuestBookController::class, 'index'])->middleware('permission:guest-book.view');
        Route::post('/',             [\App\Http\Controllers\Api\GuestBookController::class, 'store'])->middleware('permission:guest-book.create');
        Route::get('/report',        [\App\Http\Controllers\Api\GuestBookController::class, 'report'])->middleware('permission:guest-book.report');
        Route::get('/export',        [\App\Http\Controllers\Api\GuestBookController::class, 'export'])->middleware('permission:guest-book.view');
        Route::get('/agencies/search', [\App\Http\Controllers\Api\GuestBookController::class, 'searchAgencies'])->middleware('permission:guest-book.create');
        Route::get('/{id}',          [\App\Http\Controllers\Api\GuestBookController::class, 'show'])->middleware('permission:guest-book.view');
        Route::patch('/{id}/checkout', [\App\Http\Controllers\Api\GuestBookController::class, 'checkout'])->middleware('permission:guest-book.create');
    });

    // ── SPPD ────────────────────────────────────────────────────────────────
    Route::prefix('sppd')->group(function () {
        Route::get('/',              [\App\Http\Controllers\Api\SppdController::class, 'index']);
        Route::post('/',             [\App\Http\Controllers\Api\SppdController::class, 'store'])->middleware('permission:sppd.create');
        Route::get('/{id}',          [\App\Http\Controllers\Api\SppdController::class, 'show']);
        Route::put('/{id}',          [\App\Http\Controllers\Api\SppdController::class, 'update'])->middleware('permission:sppd.edit');
        Route::delete('/{id}',       [\App\Http\Controllers\Api\SppdController::class, 'destroy'])->middleware('permission:sppd.delete');
        Route::post('/{id}/submit',  [\App\Http\Controllers\Api\SppdController::class, 'submit'])->middleware('permission:sppd.submit');
        Route::post('/{id}/approve', [\App\Http\Controllers\Api\SppdController::class, 'approve'])->middleware('permission:sppd.approve');
        Route::post('/{id}/reject',  [\App\Http\Controllers\Api\SppdController::class, 'reject'])->middleware('permission:sppd.reject');
        Route::post('/{id}/verify',  [\App\Http\Controllers\Api\SppdController::class, 'verify'])->middleware('permission:sppd.verify');
        Route::get('/{id}/pdf',      [\App\Http\Controllers\Api\SppdController::class, 'downloadPdf'])->middleware('permission:sppd.print');
        // Laporan Perjalanan Dinas
        Route::post('/{id}/report',  [\App\Http\Controllers\Api\SppdReportController::class, 'store'])->middleware('permission:sppd.report-upload');
        Route::get('/{id}/report',   [\App\Http\Controllers\Api\SppdReportController::class, 'show']);
    });

    // ── Revisi Ijazah ───────────────────────────────────────────────────────
    Route::prefix('ijazah')->group(function () {
        Route::get('/',              [\App\Http\Controllers\Api\IjazahRevisionController::class, 'index']);
        Route::post('/',             [\App\Http\Controllers\Api\IjazahRevisionController::class, 'store'])->middleware('permission:ijazah.create');
        Route::get('/{id}',          [\App\Http\Controllers\Api\IjazahRevisionController::class, 'show']);
        Route::put('/{id}',          [\App\Http\Controllers\Api\IjazahRevisionController::class, 'update'])->middleware('permission:ijazah.edit');
        Route::delete('/{id}',       [\App\Http\Controllers\Api\IjazahRevisionController::class, 'destroy'])->middleware('permission:ijazah.delete');
        Route::post('/{id}/submit',  [\App\Http\Controllers\Api\IjazahRevisionController::class, 'submit'])->middleware('permission:ijazah.submit');
        Route::post('/{id}/verify',  [\App\Http\Controllers\Api\IjazahRevisionController::class, 'verify'])->middleware('permission:ijazah.verify');
        Route::post('/{id}/approve', [\App\Http\Controllers\Api\IjazahRevisionController::class, 'approve'])->middleware('permission:ijazah.approve');
        Route::post('/{id}/reject',  [\App\Http\Controllers\Api\IjazahRevisionController::class, 'reject'])->middleware('permission:ijazah.reject');
        Route::post('/{id}/notify-pickup', [\App\Http\Controllers\Api\IjazahRevisionController::class, 'notifyPickup'])->middleware('permission:ijazah.notify-pickup');
    });

    // ── Perubahan Bendahara / Rekening ──────────────────────────────────────
    Route::prefix('treasurer')->group(function () {
        Route::get('/',              [\App\Http\Controllers\Api\TreasurerChangeController::class, 'index']);
        Route::post('/',             [\App\Http\Controllers\Api\TreasurerChangeController::class, 'store'])->middleware('permission:treasurer.create');
        Route::get('/{id}',          [\App\Http\Controllers\Api\TreasurerChangeController::class, 'show']);
        Route::put('/{id}',          [\App\Http\Controllers\Api\TreasurerChangeController::class, 'update'])->middleware('permission:treasurer.edit');
        Route::delete('/{id}',       [\App\Http\Controllers\Api\TreasurerChangeController::class, 'destroy'])->middleware('permission:treasurer.delete');
        Route::post('/{id}/submit',  [\App\Http\Controllers\Api\TreasurerChangeController::class, 'submit'])->middleware('permission:treasurer.submit');
        Route::post('/{id}/verify',  [\App\Http\Controllers\Api\TreasurerChangeController::class, 'verify'])->middleware('permission:treasurer.verify');
        Route::post('/{id}/approve', [\App\Http\Controllers\Api\TreasurerChangeController::class, 'approve'])->middleware('permission:treasurer.approve');
        Route::post('/{id}/reject',  [\App\Http\Controllers\Api\TreasurerChangeController::class, 'reject'])->middleware('permission:treasurer.reject');
        Route::get('/{id}/pdf',      [\App\Http\Controllers\Api\TreasurerChangeController::class, 'downloadPdf'])->middleware('permission:treasurer.download');
    });

    // ── Portal Berita (CMS — authenticated) ────────────────────────────────
    Route::prefix('articles')->group(function () {
        Route::get('/',              [\App\Http\Controllers\Api\ArticleController::class, 'index'])->middleware('permission:articles.view');
        Route::post('/',             [\App\Http\Controllers\Api\ArticleController::class, 'store'])->middleware('permission:articles.create');
        Route::get('/{id}',          [\App\Http\Controllers\Api\ArticleController::class, 'show'])->middleware('permission:articles.view');
        Route::put('/{id}',          [\App\Http\Controllers\Api\ArticleController::class, 'update'])->middleware('permission:articles.edit');
        Route::delete('/{id}',       [\App\Http\Controllers\Api\ArticleController::class, 'destroy'])->middleware('permission:articles.delete');
        Route::post('/{id}/publish', [\App\Http\Controllers\Api\ArticleController::class, 'publish'])->middleware('permission:articles.publish');
        Route::post('/upload-image', [\App\Http\Controllers\Api\ArticleController::class, 'uploadImage'])->middleware('permission:articles.create');
    });

    // ── Reports ─────────────────────────────────────────────────────────────
    Route::prefix('reports')->group(function () {
        Route::get('/sppd',      [\App\Http\Controllers\Api\ReportController::class, 'sppd'])->middleware('permission:reports.sppd');
        Route::get('/ijazah',    [\App\Http\Controllers\Api\ReportController::class, 'ijazah'])->middleware('permission:reports.ijazah');
        Route::get('/treasurer', [\App\Http\Controllers\Api\ReportController::class, 'treasurer'])->middleware('permission:reports.treasurer');
        Route::get('/guest-book',[\App\Http\Controllers\Api\ReportController::class, 'guestBook'])->middleware('permission:reports.guest-book');
    });

});
