<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PickupReady extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Il tuo ordine è pronto al ritiro - ' . $this->order->order_number);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.pickup-ready',
            with: ['supportEmail' => Setting::getValue('support_email', 'assistenza.yocigaci@gmail.com')],
        );
    }
}
