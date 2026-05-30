<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Ordine Spedito</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
        .header { background: #1a1a2e; color: #fff; padding: 32px; text-align: center; }
        .tracking-box { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center; }
        .tracking-code { font-size: 24px; font-weight: bold; color: #15803d; letter-spacing: 2px; }
        .body { padding: 32px; }
        .footer { text-align: center; padding: 24px; color: #999; font-size: 12px; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Yocigaci</h1>
        <p style="margin: 8px 0 0;">Il tuo ordine è in arrivo!</p>
    </div>
    <div class="body">
        <p>Il tuo ordine <strong>{{ $order->order_number }}</strong> è stato spedito.</p>

        @if($order->tracking_code)
        <div class="tracking-box">
            <p style="margin: 0 0 8px; color: #666; font-size: 14px;">Codice di tracciamento</p>
            <div class="tracking-code">{{ $order->tracking_code }}</div>
        </div>
        @endif

        <p>Usa il codice di tracciamento sul sito del corriere per seguire la spedizione.</p>
        <p>Di solito le consegne avvengono entro 2–5 giorni lavorativi.</p>
    </div>
    <div class="footer">
        <p>© {{ date('Y') }} Yocigaci. Per assistenza rispondi a questa email.</p>
    </div>
</div>
</body>
</html>
