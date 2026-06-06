<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>{{ $isFull ? 'Rimborso effettuato' : 'Rimborso parziale effettuato' }}</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
        .header { background: #1a1a2e; color: #fff; padding: 32px; text-align: center; }
        .refund-box { background: #f0f9ff; border: 2px solid #38bdf8; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center; }
        .refund-amount { font-size: 28px; font-weight: bold; color: #0369a1; }
        .cumulative { margin: 8px 0 0; color: #666; font-size: 13px; }
        .body { padding: 32px; }
        .footer { text-align: center; padding: 24px; color: #999; font-size: 12px; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Yocigaci</h1>
        <p style="margin: 8px 0 0;">{{ $isFull ? 'Rimborso effettuato' : 'Rimborso parziale effettuato' }}</p>
    </div>
    <div class="body">
        <p>Abbiamo elaborato un rimborso per il tuo ordine <strong>{{ $order->order_number }}</strong>.</p>

        <div class="refund-box">
            <p style="margin: 0 0 8px; color: #666; font-size: 14px;">Importo rimborsato</p>
            <div class="refund-amount">€ {{ number_format($amount, 2, ',', '.') }}</div>
            @unless($isFull)
                <p class="cumulative">
                    Totale rimborsato finora: € {{ number_format((float) $order->refunded_amount, 2, ',', '.') }}
                    su € {{ number_format((float) $order->total, 2, ',', '.') }}
                </p>
            @endunless
        </div>

        <p>L'accredito comparirà sul metodo di pagamento usato per l'acquisto, di norma entro 5–10 giorni lavorativi a seconda della tua banca.</p>
    </div>
    <div class="footer">
        <p>© {{ date('Y') }} Yocigaci. Per assistenza scrivi a <a href="mailto:assistenza-yocigaci@gmail.com" style="color: #999;">assistenza-yocigaci@gmail.com</a></p>
    </div>
</div>
</body>
</html>
