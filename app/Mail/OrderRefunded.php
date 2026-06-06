<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderRefunded extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  float  $amount   Importo di questo rimborso (non il cumulativo).
     * @param  bool   $isFull   true se con questo rimborso l'ordine risulta interamente rimborsato.
     */
    public function __construct(
        public Order $order,
        public float $amount,
        public bool $isFull,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->isFull ? 'Rimborso effettuato' : 'Rimborso parziale effettuato';

        return new Envelope(subject: $subject . ' - ' . $this->order->order_number);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.order-refunded');
    }
}
