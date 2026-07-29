<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sppd;
use App\Models\SppdReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SppdReportController extends Controller
{
    /**
     * Store SPPD Report.
     */
    public function store(Request $request, $sppdId)
    {
        $sppd = Sppd::findOrFail($sppdId);

        if ($sppd->status !== 'active' && $sppd->status !== 'approved') {
            return response()->json(['message' => 'Laporan hanya bisa disubmit untuk SPPD yang berstatus approved atau active.'], 422);
        }

        $validated = $request->validate([
            'real_start_date' => 'required|date',
            'real_end_date' => 'required|date|after_or_equal:real_start_date',
            'report_text' => 'required|string',
            'actual_cost' => 'nullable|numeric',
            'attachment' => 'nullable|file|mimes:pdf,zip,rar|max:5120', // Max 5MB
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $attachmentPath = null;
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $attachmentPath = $file->storeAs('sppd_reports', $sppd->document_number ? str_replace('/', '_', $sppd->document_number).'.'.$file->getClientOriginalExtension() : 'temp_'.time().'.'.$file->getClientOriginalExtension(), 'public');
            }

            SppdReport::updateOrCreate(
                ['sppd_id' => $sppd->id],
                [
                    'real_start_date' => $validated['real_start_date'],
                    'real_end_date' => $validated['real_end_date'],
                    'report_text' => $validated['report_text'],
                    'actual_cost' => $validated['actual_cost'] ?? null,
                    'attachment_proof' => $attachmentPath,
                    'notes' => $validated['notes'] ?? null,
                    'submitted_by' => $request->user()->id,
                    'submitted_at' => now(),
                ]
            );

            // Update status to reported
            $sppd->status = 'reported';
            if (isset($validated['actual_cost'])) {
                $sppd->actual_budget = $validated['actual_cost'];
            }
            $sppd->save();

            DB::commit();

            return response()->json(['message' => 'Laporan Perjalanan Dinas berhasil disubmit.']);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal menyimpan laporan: '.$e->getMessage()], 500);
        }
    }

    /**
     * Validate/Close the SPPD after report is submitted. (By Kadis/Kabid)
     */
    public function validateReport(Request $request, $sppdId)
    {
        $sppd = Sppd::findOrFail($sppdId);

        if ($sppd->status !== 'reported') {
            return response()->json(['message' => 'Hanya SPPD yang berstatus dilaporkan yang bisa divalidasi.'], 422);
        }

        // Logic checks for Kadis/Kabid role should be in middleware or policies

        $sppd->status = 'closed';
        $sppd->save();

        return response()->json(['message' => 'Laporan telah divalidasi. SPPD dinyatakan selesai.']);
    }
}
