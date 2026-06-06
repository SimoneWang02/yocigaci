<?php

namespace App\Services;

use App\Mail\OrderRefunded;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Stripe\Refund;
use Stripe\Stripe;

class RefundService
{
    /** Motivi accettati dall'API Stripe per un rimborso. */
    public const STRIPE_REASONS = ['duplicate', 'fraudulent', 'requested_by_customer'];

    /**
     * Emette un rimborso su Stripe per l'ordine indicato.
     *
     * Passando $amount = null rimborsa l'intero importo ancora rimborsabile.
     * Idempotente lato Stripe: un doppio click sullo stesso importo non genera
     * due rimborsi grazie alla idempotency key.
     *
     * @throws \RuntimeException se l'ordine non e' rimborsabile
     * @throws \Stripe\Exception\ApiErrorException se Stripe rifiuta il rimborso
     */
    public function issueRefund(Order $order, ?float $amount = null, ?string $reason = null): Refund
    {
        if (! $order->stripe_payment_intent_id || $order->stripe_payment_status !== 'succeeded') {
            throw new \RuntimeException('Questo ordine non ha un pagamento Stripe rimborsabile.');
        }

        $refundable = $order->refundableAmount();

        if ($refundable <= 0) {
            throw new \RuntimeException('Questo ordine e\' gia\' stato rimborsato per intero.');
        }

        $amount = $amount === null ? $refundable : round($amount, 2);

        if ($amount <= 0 || $amount > $refundable) {
            throw new \RuntimeException("L'importo del rimborso deve essere tra 0,01 e {$refundable} €.");
        }

        $amountCents = (int) round($amount * 100);

        Stripe::setApiKey(config('services.stripe.secret'));

        $params = [
            'payment_intent' => $order->stripe_payment_intent_id,
            'amount' => $amountCents,
        ];

        if ($reason && in_array($reason, self::STRIPE_REASONS, true)) {
            $params['reason'] = $reason;
        }

        $refund = Refund::create($params, [
            // Protegge dal doppio invio dello stesso rimborso (es. doppio click).
            'idempotency_key' => "refund-{$order->id}-{$amountCents}",
        ]);

        // Aggiornamento ottimistico: riflette subito il rimborso in admin senza
        // attendere il webhook. applyRefund e' idempotente (dedup sul cumulato),
        // quindi il successivo charge.refunded non duplichera' l'email.
        $cumulative = round((float) $order->refunded_amount + $amount, 2);
        $this->applyRefund($order, $cumulative, $cumulative >= (float) $order->total, $reason);

        return $refund;
    }

    /**
     * Applica a un ordine lo stato di rimborso, in modo idempotente.
     *
     * Chiamato sia dall'emissione manuale (admin) sia dal webhook charge.refunded
     * (che intercetta anche i rimborsi fatti dalla dashboard Stripe), che passano
     * entrambi il totale cumulativo rimborsato. La riga viene bloccata in lock per
     * rendere atomico il confronto col cumulato gia' salvato: cosi' update ottimistico
     * e webhook non mandano due email per lo stesso rimborso.
     *
     * Lo stock NON viene ripristinato in automatico: ci pensa l'admin a mano.
     */
    public function applyRefund(Order $order, float $cumulativeRefunded, bool $fullyRefunded, ?string $reason = null): void
    {
        $cumulativeRefunded = round($cumulativeRefunded, 2);

        $shouldNotify = false;
        $newlyRefunded = 0.0;

        DB::transaction(function () use ($order, $cumulativeRefunded, $fullyRefunded, $reason, &$shouldNotify, &$newlyRefunded) {
            $locked = Order::whereKey($order->getKey())->lockForUpdate()->first();
            $previous = (float) $locked->refunded_amount;

            // Cumulato non cresciuto: webhook fuori ordine o gia' applicato.
            if ($cumulativeRefunded <= $previous) {
                return;
            }

            $newlyRefunded = round($cumulativeRefunded - $previous, 2);

            $locked->refunded_amount = $cumulativeRefunded;
            $locked->status = $fullyRefunded ? 'refunded' : 'partially_refunded';

            if ($fullyRefunded && $locked->refunded_at === null) {
                $locked->refunded_at = now();
            }
            if ($reason && ! $locked->refund_reason) {
                $locked->refund_reason = $reason;
            }

            $locked->save();

            // Mantiene allineata l'istanza del chiamante (controller / webhook) usando
            // gli attributi grezzi: setRawAttributes evita la doppia codifica del JSON
            // (es. shipping_address), a differenza di fill()/forceFill().
            $order->setRawAttributes($locked->getAttributes(), true);
            $shouldNotify = true;
        });

        // Email a ogni rimborso reale, parziale o totale.
        if ($shouldNotify && ($email = $order->recipientEmail())) {
            Mail::to($email)->queue(new OrderRefunded($order, $newlyRefunded, $fullyRefunded));
        }
    }
}
