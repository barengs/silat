<?php

namespace App\Services;

use App\Models\Sppd;
use App\Models\SppdMember;
use Carbon\Carbon;

class ConflictCheckService
{
    /**
     * Check if the given dates conflict with any existing SPPD for the given user IDs.
     * Returns an array of conflicting user IDs (or empty array if no conflict).
     */
    public function getConflictingUsers(array $userIds, string $startDate, string $endDate, ?int $excludeSppdId = null): array
    {
        $start = Carbon::parse($startDate)->format('Y-m-d');
        $end = Carbon::parse($endDate)->format('Y-m-d');

        $conflicts = [];

        foreach ($userIds as $userId) {
            // Check as main requester
            $hasConflictMain = Sppd::where('user_id', $userId)
                ->whereNotIn('status', ['draft', 'rejected', 'closed'])
                ->when($excludeSppdId, fn ($q) => $q->where('id', '!=', $excludeSppdId))
                ->where(function ($q) use ($start, $end) {
                    $q->whereBetween('start_date', [$start, $end])
                        ->orWhereBetween('end_date', [$start, $end])
                        ->orWhere(function ($q2) use ($start, $end) {
                            $q2->where('start_date', '<=', $start)
                                ->where('end_date', '>=', $end);
                        });
                })->exists();

            if ($hasConflictMain) {
                $conflicts[] = $userId;

                continue;
            }

            // Check as member
            $hasConflictMember = SppdMember::where('user_id', $userId)
                ->whereHas('sppd', function ($q) use ($start, $end, $excludeSppdId) {
                    $q->whereNotIn('status', ['draft', 'rejected', 'closed'])
                        ->when($excludeSppdId, fn ($sq) => $sq->where('id', '!=', $excludeSppdId))
                        ->where(function ($sq) use ($start, $end) {
                            $sq->whereBetween('start_date', [$start, $end])
                                ->orWhereBetween('end_date', [$start, $end])
                                ->orWhere(function ($sq2) use ($start, $end) {
                                    $sq2->where('start_date', '<=', $start)
                                        ->where('end_date', '>=', $end);
                                });
                        });
                })->exists();

            if ($hasConflictMember) {
                $conflicts[] = $userId;
            }
        }

        return array_unique($conflicts);
    }
}
