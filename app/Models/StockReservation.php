<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Stock trattenuto per una sessione Stripe Checkout in attesa di pagamento.
 *
 * pending   → stock scalato, cliente sulla pagina di pagamento
 * completed → ordine creato, lo stock resta scalato
 * released  → sessione scaduta/annullata, stock restituito
 */
class StockReservation extends Model
{
    public const PENDING = 'pending';
    public const COMPLETED = 'completed';
    public const RELEASED = 'released';

    protected $fillable = ['stripe_session_id', 'items', 'status', 'expires_at'];

    protected $casts = [
        'items' => 'array',
        'expires_at' => 'datetime',
    ];
}
