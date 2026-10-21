<?php

namespace App\Console\Commands;

use App\Models\StockReservation;
use App\Services\OrderFulfillmentService;
use App\Services\StockReservationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

class ReleaseExpiredStockReservations extends Command
{
    protected $signature = 'stock:release-expired';

    protected $description = 'Riconcilia con Stripe le prenotazioni di stock scadute: restituisce lo stock delle sessioni non pagate e crea gli ordini pagati mancanti';

    /**
     * Rete di sicurezza indipendente dai webhook: se checkout.session.expired non
     * arriva (endpoint non configurato o consegna fallita) lo stock non resta bloccato.
     */
    public function handle(StockReservationService $reservations, OrderFulfillmentService $fulfillment): int
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        $released = 0;
        $fulfilled = 0;

        StockReservation::where('status', StockReservation::PENDING)
            ->where('expires_at', '<', now())
            // lazyById e non each(): le righe cambiano stato durante il ciclo e la
            // paginazione per offset ne salterebbe alcune.
            ->lazyById()
            ->each(function (StockReservation $reservation) use ($reservations, $fulfillment, &$released, &$fulfilled) {
                try {
                    // Sessione Stripe mai creata (es. processo interrotto a meta').
                    if (! $reservation->stripe_session_id) {
                        $reservations->release($reservation);
                        $released++;

                        return;
                    }

                    $session = StripeSession::retrieve($reservation->stripe_session_id);

                    if ($session->status === 'expired') {
                        $reservations->release($reservation);
                        $released++;
                    } elseif ($session->status === 'complete' && $session->payment_status === 'paid') {
                        // Pagata ma il cliente non e' tornato sul sito: crea l'ordine ora.
                        $fulfillment->fulfillFromSession($session);
                        $fulfilled++;
                    }
                    // Ancora 'open' (scarto tra orologi) o pagamento asincrono in corso: prossimo giro.
                } catch (\Throwable $e) {
                    Log::error('Riconciliazione prenotazione stock fallita.', [
                        'reservation_id' => $reservation->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            });

        $this->info("Prenotazioni rilasciate: {$released}, ordini completati: {$fulfilled}.");

        return self::SUCCESS;
    }
}
