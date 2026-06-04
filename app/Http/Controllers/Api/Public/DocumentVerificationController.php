<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\DocumentApproval;
use Illuminate\Http\JsonResponse;

class DocumentVerificationController extends Controller
{
    /**
     * Verify a document by its QR verification token.
     * This is a public endpoint — no authentication required.
     *
     * @param string $token The unique QR verification token
     * @return JsonResponse
     */
    public function verify(string $token): JsonResponse
    {
        $approval = DocumentApproval::with(['document', 'user'])
            ->byToken($token)
            ->first();

        if (! $approval) {
            return response()->json([
                'valid'   => false,
                'message' => 'Token verifikasi tidak ditemukan. Dokumen tidak terdaftar dalam sistem.',
            ], 404);
        }

        $document = $approval->document;

        if (! $document) {
            return response()->json([
                'valid'   => false,
                'message' => 'Dokumen terkait tidak ditemukan atau telah dihapus.',
            ], 404);
        }

        // Determine document type and build info
        $docInfo = $this->buildDocumentInfo($approval, $document);

        return response()->json([
            'valid'   => true,
            'message' => 'Dokumen ini SAH dan tercatat dalam sistem Dinas Pendidikan Kabupaten Pamekasan.',
            'data'    => $docInfo,
        ]);
    }

    /**
     * Build a structured info response based on the document type.
     */
    private function buildDocumentInfo(DocumentApproval $approval, $document): array
    {
        $documentType = class_basename($approval->document_type);

        $info = [
            'document_type'    => $this->getDocumentTypeLabel($documentType),
            'document_number'  => null,
            'status'           => $document->status ?? 'unknown',
            'institution'      => null,
            'issued_at'        => $approval->acted_at?->format('d F Y'),
            'approved_by'      => $approval->user?->name ?? 'Sistem',
            'approved_by_nip'  => $approval->user?->nip ?? '-',
            'verification_at'  => now()->format('d F Y H:i:s'),
        ];

        switch ($documentType) {
            case 'Sppd':
                $document->load(['user', 'institution']);
                $info['document_number'] = $document->document_number;
                $info['institution']     = $document->institution?->name;
                $info['details'] = [
                    'nama_pegawai' => $document->user?->name,
                    'nip'          => $document->user?->nip,
                    'tujuan'       => $document->destination,
                    'maksud'       => $document->purpose,
                    'tanggal'      => $document->start_date?->format('d/m/Y') . ' s/d ' . $document->end_date?->format('d/m/Y'),
                ];
                break;

            case 'TreasurerChange':
                $document->load(['institution', 'submittedBy']);
                $info['document_number'] = $document->reference_number;
                $info['institution']     = $document->institution?->name;
                $info['details'] = [
                    'jenis_perubahan'  => $this->getChangeTypeLabel($document->change_type),
                    'bendahara_lama'   => $document->old_treasurer_name,
                    'bendahara_baru'   => $document->new_treasurer_name,
                    'diajukan_oleh'    => $document->submittedBy?->name,
                ];
                break;

            case 'IjazahRevision':
                $document->load(['institution']);
                $info['document_number'] = $document->ticket_number ?? $document->id;
                $info['institution']     = $document->institution?->name;
                $info['details'] = [
                    'nama_siswa'    => $document->student_name ?? '-',
                    'jenis_revisi'  => $document->revision_type ?? '-',
                ];
                break;

            default:
                $info['document_number'] = $document->id;
                break;
        }

        return $info;
    }

    /**
     * Get human-readable document type label.
     */
    private function getDocumentTypeLabel(string $className): string
    {
        return match ($className) {
            'Sppd'             => 'Surat Perintah Perjalanan Dinas (SPPD)',
            'TreasurerChange'  => 'Surat Rekomendasi Perubahan Bendahara',
            'IjazahRevision'   => 'Surat Revisi Ijazah',
            default            => 'Dokumen Resmi',
        };
    }

    /**
     * Get human-readable change type label.
     */
    private function getChangeTypeLabel(?string $type): string
    {
        return match ($type) {
            'bendahara' => 'Pergantian Bendahara',
            'rekening'  => 'Perubahan Rekening',
            'both'      => 'Pergantian Bendahara & Rekening',
            default     => '-',
        };
    }
}
