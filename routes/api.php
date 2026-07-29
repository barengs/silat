<?php

use App\Http\Controllers\Api\ApprovalFlowController;
use App\Http\Controllers\Api\ArticleCategoryController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DivisionController;
use App\Http\Controllers\Api\GuestBookController;
use App\Http\Controllers\Api\IjazahRevisionController;
use App\Http\Controllers\Api\InstitutionController;
use App\Http\Controllers\Api\InstitutionTypeController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\Public\DocumentVerificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\SppdController;
use App\Http\Controllers\Api\SppdReportController;
use App\Http\Controllers\Api\TransportTypeController;
use App\Http\Controllers\Api\SignatureController;
use App\Http\Controllers\Api\TreasurerChangeController;
use App\Http\Controllers\Api\SchoolTransferController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VerificationController;
use Illuminate\Support\Facades\Route;

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
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Public portal — berita & pengumuman (no login required)
Route::prefix('public')->group(function () {
    Route::get('/articles', [ArticleController::class, 'indexPublic']);
    Route::get('/articles/{slug}', [ArticleController::class, 'showPublic']);
    Route::get('/categories', [ArticleCategoryController::class, 'index']);
});

// QR Code document verification (no login — for bank officers or public scan)
Route::get('/verify/doc/{token}', [DocumentVerificationController::class, 'verify']);

// Ijazah tracking by ticket number (no login — for students/parents)
Route::get('/track/ijazah/{ticket}', [IjazahRevisionController::class, 'trackPublic']);

// ─── Authenticated Routes (JWT Required) ──────────────────────────────────────

Route::middleware('jwt.auth')->group(function () {

    // Auth management
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/me', [AuthController::class, 'me']);
    });

    // Dashboard stats (role-aware, returns appropriate data per role)
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/unread', [NotificationController::class, 'unread']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
    });

    // ── User Management (permission gated) ─────────────────────────────────
    Route::prefix('users')->middleware('permission:users.view')->group(function () {
        Route::get('/export', [UserController::class, 'export']);
        Route::get('/template', [UserController::class, 'template']);
        Route::post('/import', [UserController::class, 'import']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api');
        Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('auth:api');

        Route::get('/', [UserController::class, 'index']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::post('/', [UserController::class, 'store'])->middleware('permission:users.create');
        Route::put('/{id}', [UserController::class, 'update'])->middleware('permission:users.edit');
        Route::delete('/{id}', [UserController::class, 'destroy'])->middleware('permission:users.delete');
        Route::patch('/{id}/toggle-active', [UserController::class, 'toggleActive'])->middleware('permission:users.toggle-active');
        Route::post('/{id}/assign-role', [UserController::class, 'assignRole'])->middleware('permission:users.assign-role');
    });

    // ── Profile (own account) ───────────────────────────────────────────────
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::post('/photo', [ProfileController::class, 'uploadPhoto']);
        Route::post('/password', [ProfileController::class, 'changePassword']);
        Route::post('/signature', [ProfileController::class, 'uploadSignature']);
    });

    // ── Roles & Permissions ─────────────────────────────────────────────────
    Route::middleware('permission:roles.view')->group(function () {
        Route::get('/roles/permissions-matrix', [RoleController::class, 'permissionsMatrix']);
        Route::apiResource('roles', RoleController::class);
        Route::apiResource('permissions', PermissionController::class)->only(['index']);
    });

    // ── Institutions ────────────────────────────────────────────────────────
    Route::get('/institutions/template', [InstitutionController::class, 'template']);
    Route::post('/institutions/import', [InstitutionController::class, 'import']);
    Route::apiResource('institutions', InstitutionController::class);
    Route::get('/institutions/search', [InstitutionController::class, 'search']);
    Route::get('/institution-types', [InstitutionTypeController::class, 'index'])->middleware('permission:institution-types.view');
    Route::post('/institution-types', [InstitutionTypeController::class, 'store'])->middleware('permission:institution-types.create');
    Route::put('/institution-types/{id}', [InstitutionTypeController::class, 'update'])->middleware('permission:institution-types.edit');
    Route::delete('/institution-types/{id}', [InstitutionTypeController::class, 'destroy'])->middleware('permission:institution-types.delete');

    // ── Divisions ───────────────────────────────────────────────────────────
    Route::get('/divisions/template', [DivisionController::class, 'template']);
    Route::post('/divisions/import', [DivisionController::class, 'import']);
    Route::apiResource('divisions', DivisionController::class);

    // ── System Settings ─────────────────────────────────────────────────────
    Route::prefix('settings')->middleware('permission:settings.view')->group(function () {
        Route::get('/', [SettingController::class, 'index']);
        Route::put('/', [SettingController::class, 'update'])->middleware('permission:settings.edit');
        Route::post('/logo', [SettingController::class, 'uploadLogo'])->middleware('permission:settings.edit');
    });

    // ── Approval Flow Config ────────────────────────────────────────────────
    Route::prefix('approval-flows')->middleware('permission:approval-flows.view')->group(function () {
        Route::get('/', [ApprovalFlowController::class, 'index']);
        Route::put('/{module}', [ApprovalFlowController::class, 'update'])->middleware('permission:approval-flows.edit');
    });

    // ── Master Data ─────────────────────────────────────────────────────────
    Route::apiResource('transport-types', TransportTypeController::class);

    // ── Ijazah Revisions ────────────────────────────────────────────────────
    Route::prefix('ijazah-revisions')->group(function () {
        Route::get('/', [IjazahRevisionController::class, 'index']);
        Route::post('/', [IjazahRevisionController::class, 'store']);
        Route::get('/{id}', [IjazahRevisionController::class, 'show']);
        Route::post('/{id}/approve', [IjazahRevisionController::class, 'approve']);
        Route::post('/{id}/reject', [IjazahRevisionController::class, 'reject']);
        Route::post('/{id}/mark-ready', [IjazahRevisionController::class, 'markReadyForPickup']);
        Route::post('/{id}/mark-completed', [IjazahRevisionController::class, 'markCompleted']);
    });
    // ── Article Categories (Auth & Manage) ──────────────────────────────────
    Route::get('/article-categories', [ArticleCategoryController::class, 'index']);
    Route::post('/article-categories', [ArticleCategoryController::class, 'store'])->middleware('permission:article-categories.manage');
    Route::put('/article-categories/{id}', [ArticleCategoryController::class, 'update'])->middleware('permission:article-categories.manage');
    Route::delete('/article-categories/{id}', [ArticleCategoryController::class, 'destroy'])->middleware('permission:article-categories.manage');



    Route::prefix('guest-book')->group(function () {
        Route::get('/', [GuestBookController::class, 'index'])->middleware('permission:guest-book.view');
        Route::post('/', [GuestBookController::class, 'store'])->middleware('permission:guest-book.create');
        Route::get('/report', [GuestBookController::class, 'report'])->middleware('permission:guest-book.report');
        Route::get('/export', [GuestBookController::class, 'export'])->middleware('permission:guest-book.view');
        Route::get('/agencies/search', [GuestBookController::class, 'searchAgencies'])->middleware('permission:guest-book.create');
        Route::get('/{id}', [GuestBookController::class, 'show'])->middleware('permission:guest-book.view');
        Route::put('/{id}', [GuestBookController::class, 'update'])->middleware('permission:guest-book.edit');
        Route::delete('/{id}', [GuestBookController::class, 'destroy'])->middleware('permission:guest-book.delete');
        Route::patch('/{id}/visit', [GuestBookController::class, 'visit'])->middleware('permission:guest-book.create');
        Route::patch('/{id}/checkout', [GuestBookController::class, 'checkout'])->middleware('permission:guest-book.create');
    });

    // ── SPPD ────────────────────────────────────────────────────────────────
    Route::prefix('sppd')->group(function () {
        Route::get('/reference-data', [SppdController::class, 'referenceData']);
        Route::get('/search-members', [SppdController::class, 'searchMembers']);
        Route::get('/', [SppdController::class, 'index']);
        Route::post('/', [SppdController::class, 'store'])->middleware('permission:sppd.create');
        Route::get('/{id}', [SppdController::class, 'show']);
        Route::put('/{id}', [SppdController::class, 'update'])->middleware('permission:sppd.edit');
        Route::delete('/{id}', [SppdController::class, 'destroy'])->middleware('permission:sppd.delete');
        Route::post('/{id}/submit', [SppdController::class, 'submit'])->middleware('permission:sppd.submit');
        Route::post('/{id}/approve', [SppdController::class, 'approve']);
        Route::post('/{id}/reject', [SppdController::class, 'reject']);
        Route::post('/{id}/verify', [SppdController::class, 'verify'])->middleware('permission:sppd.verify');
        Route::get('/{id}/pdf', [SppdController::class, 'downloadPdf'])->middleware('permission:sppd.print');
        // Laporan Perjalanan Dinas
        Route::post('/{id}/report', [SppdReportController::class, 'store'])->middleware('permission:sppd.report-upload');
        Route::get('/{id}/report', [SppdReportController::class, 'show']);
        Route::post('/{id}/validate-report', [SppdReportController::class, 'validateReport']);
    });

    // ── Revisi Ijazah ───────────────────────────────────────────────────────
    Route::prefix('ijazah')->group(function () {
        Route::get('/', [IjazahRevisionController::class, 'index']);
        Route::post('/', [IjazahRevisionController::class, 'store'])->middleware('permission:ijazah.create');
        Route::get('/{id}', [IjazahRevisionController::class, 'show']);
        Route::put('/{id}', [IjazahRevisionController::class, 'update'])->middleware('permission:ijazah.edit');
        Route::delete('/{id}', [IjazahRevisionController::class, 'destroy'])->middleware('permission:ijazah.delete');
        Route::post('/{id}/submit', [IjazahRevisionController::class, 'submit'])->middleware('permission:ijazah.submit');
        Route::post('/{id}/verify', [IjazahRevisionController::class, 'verify'])->middleware('permission:ijazah.verify');
        Route::post('/{id}/approve', [IjazahRevisionController::class, 'approve'])->middleware('permission:ijazah.approve');
        Route::post('/{id}/reject', [IjazahRevisionController::class, 'reject'])->middleware('permission:ijazah.reject');
        Route::post('/{id}/notify-pickup', [IjazahRevisionController::class, 'notifyPickup'])->middleware('permission:ijazah.notify-pickup');
    });

    // ── Perubahan Bendahara / Rekening ──────────────────────────────────────
    Route::prefix('treasurer')->group(function () {
        Route::get('/', [TreasurerChangeController::class, 'index']);
        Route::post('/', [TreasurerChangeController::class, 'store'])->middleware('permission:treasurer.create');
        // Static routes must be declared BEFORE /{id} wildcard
        Route::get('/current-info', [TreasurerChangeController::class, 'currentTreasurer']);
        Route::get('/{id}', [TreasurerChangeController::class, 'show']);
        Route::put('/{id}', [TreasurerChangeController::class, 'update'])->middleware('permission:treasurer.edit');
        Route::delete('/{id}', [TreasurerChangeController::class, 'destroy'])->middleware('permission:treasurer.delete');
        Route::post('/{id}/submit', [TreasurerChangeController::class, 'submit'])->middleware('permission:treasurer.submit');
        Route::post('/{id}/verify', [TreasurerChangeController::class, 'verify'])->middleware('permission:treasurer.verify');
        Route::post('/{id}/approve', [TreasurerChangeController::class, 'approve'])->middleware('permission:treasurer.approve');
        Route::post('/{id}/reject', [TreasurerChangeController::class, 'reject'])->middleware('permission:treasurer.reject');
        Route::get('/{id}/pdf', [TreasurerChangeController::class, 'downloadPdf'])->middleware('permission:treasurer.download');
    });


    // ── Pindah Sekolah ──────────────────────────────────────────────────────
    Route::prefix('school-transfers')->group(function () {
        Route::get('/', [SchoolTransferController::class, 'index']);
        Route::post('/', [SchoolTransferController::class, 'store'])->middleware('permission:school-transfers.create');
        Route::get('/{id}', [SchoolTransferController::class, 'show']);
        Route::put('/{id}', [SchoolTransferController::class, 'update'])->middleware('permission:school-transfers.edit');
        Route::delete('/{id}', [SchoolTransferController::class, 'destroy'])->middleware('permission:school-transfers.delete');
        Route::post('/{id}/submit', [SchoolTransferController::class, 'submit'])->middleware('permission:school-transfers.submit');
        Route::post('/{id}/approve', [SchoolTransferController::class, 'approve'])->middleware('permission:school-transfers.approve');
        Route::post('/{id}/reject', [SchoolTransferController::class, 'reject'])->middleware('permission:school-transfers.reject');
        Route::get('/{id}/pdf', [SchoolTransferController::class, 'downloadPdf'])->middleware('permission:school-transfers.print');
    });

    // ── Portal Berita (CMS — authenticated) ────────────────────────────────
    Route::prefix('articles')->group(function () {
        Route::get('/', [ArticleController::class, 'index'])->middleware('permission:articles.view');
        Route::post('/', [ArticleController::class, 'store'])->middleware('permission:articles.create');
        Route::get('/{id}', [ArticleController::class, 'show'])->middleware('permission:articles.view');
        Route::put('/{id}', [ArticleController::class, 'update'])->middleware('permission:articles.edit');
        Route::delete('/{id}', [ArticleController::class, 'destroy'])->middleware('permission:articles.delete');
        Route::post('/{id}/publish', [ArticleController::class, 'publish'])->middleware('permission:articles.publish');
        Route::post('/upload-image', [ArticleController::class, 'uploadImage'])->middleware('permission:articles.create');
    });

    // ── Reports ─────────────────────────────────────────────────────────────
    Route::prefix('reports')->group(function () {
        Route::get('/sppd', [ReportController::class, 'sppd'])->middleware('permission:reports.sppd');
        Route::get('/ijazah', [ReportController::class, 'ijazah'])->middleware('permission:reports.ijazah');
        Route::get('/treasurer', [ReportController::class, 'treasurer'])->middleware('permission:reports.treasurer');
        Route::get('/guest-book', [ReportController::class, 'guestBook'])->middleware('permission:reports.guest-book');
    });

    // ── Signature Vault (Tanda Tangan Pejabat) ──────────────────────────────
    Route::prefix('signatures')->middleware('permission:settings.manage')->group(function () {
        Route::get('/', [SignatureController::class, 'index']);
        Route::get('/active-signer', [SignatureController::class, 'getActiveSigner']);
        Route::post('/{userId}/upload', [SignatureController::class, 'upload']);
        Route::delete('/{userId}', [SignatureController::class, 'delete']);
    });

    // ── Document Verification Queue (Antrean Verifikasi) ───────────────────
    Route::get('/verifikasi/antrean', [VerificationController::class, 'index'])->middleware('permission:verifikasi.view');

});
