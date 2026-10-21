<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockReservation;
use Illuminate\Support\Facades\DB;
use Stripe\Checkout\Session as StripeSession;

/**
 * Trattiene lo stock tra la creazione della sessione Stripe e il pagamento.
 *
 * Senza prenotazione, due clienti potevano avviare il checkout sull'ultimo pezzo
 * disponibile, pagare entrambi e mandare lo stock in negativo.
 */
class StockReservationService
{
    /**
     * Durata della sessione Stripe e della prenotazione. Stripe accetta expires_at
     * tra 30 minuti e 24 ore: il minuto in piu' assorbe lo scarto tra gli orologi.
     */
    public const TTL_MINUTES = 31;

    /**
     * Scala lo stock in modo atomico per gli articoli del carrello.
     * Se anche un solo articolo non e' piu' disponibile annulla tutto e risponde 422.
     *
     * @param  array<int, array<string, mixed>>  $cartItems  output di validateCartItems()
     */
    public function reserve(array $cartItems): StockReservation
    {
        // Righe duplicate dello stesso prodotto sommate; ordine fisso per id cosi'
        // checkout concorrenti bloccano i prodotti nella stessa sequenza (no deadlock).
        $items = collect($cartItems)
            ->groupBy('id')
            ->map(fn ($rows, $id) => ['product_id' => (int) $id, 'quantity' => (int) $rows->sum('quantity')])
            ->sortKeys()
            ->values()
            ->all();

        return DB::transaction(function () use ($items, $cartItems) {
            foreach ($items as $item) {
                $updated = Product::whereKey($item['product_id'])
                    ->where('stock', '>=', $item['quantity'])
                    ->decrement('stock', $item['quantity']);

                if ($updated === 0) {
                    $name = collect($cartItems)->firstWhere('id', $item['product_id'])['name'];
                    abort(422, "Stock insufficiente per \"{$name}\".");
                }
            }

            return StockReservation::create([
                'items' => $items,
                'status' => StockReservation::PENDING,
                'expires_at' => now()->addMinutes(self::TTL_MINUTES),
            ]);
        });
    }

    /**
     * Restituisce lo stock trattenuto. Idempotente: agisce solo su prenotazioni pending.
     */
    public function release(StockReservation $reservation): void
    {
        DB::transaction(function () use ($reservation) {
            $locked = StockReservation::whereKey($reservation->getKey())->lockForUpdate()->first();

            if (! $locked || $locked->status !== StockReservation::PENDING) {
                return;
            }

            foreach ($locked->items as $item) {
                Product::whereKey($item['product_id'])->increment('stock', $item['quantity']);
            }

            $locked->update(['status' => StockReservation::RELEASED]);
        });
    }

    public function forSession(StripeSession $session): ?StockReservation
    {
        $id = $session->metadata->reservation_id ?? null;

        return $id ? StockReservation::find($id) : null;
    }

    /**
     * Annulla una sessione precedente dello stesso cliente (es. torna indietro da
     * Stripe e riprova) cosi' la sua vecchia prenotazione non gli blocca l'ultimo pezzo.
     * Richiede la chiave Stripe gia' impostata.
     */
    public function cancelSession(string $sessionId): void
    {
        $reservation = StockReservation::where('stripe_session_id', $sessionId)
            ->where('status', StockReservation::PENDING)
            ->first();

        if (! $reservation) {
            return;
        }

        $session = StripeSession::retrieve($sessionId);

        if ($session->status === 'open') {
            $session = $session->expire();
        }

        // Se nel frattempo e' stata pagata lo stock spetta all'ordine: non si tocca.
        if ($session->status === 'expired') {
            $this->release($reservation);
        }
    }
}
