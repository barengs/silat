<?php

namespace App\Notifications;

use App\Models\GuestBook;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class GuestArrivalNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $guestBook;

    /**
     * Create a new notification instance.
     */
    public function __construct(GuestBook $guestBook)
    {
        $this->guestBook = $guestBook;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Tamu Baru Tiba',
            'message' => "Tamu bernama {$this->guestBook->guest_name} dari instansi ".($this->guestBook->agency->name ?? '-')." telah tiba untuk menemui divisi Anda dengan keperluan: {$this->guestBook->purpose}",
            'guest_book_id' => $this->guestBook->id,
            'check_in_time' => $this->guestBook->check_in_time,
        ];
    }
}
