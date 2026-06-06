<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Ordine Pronto al Ritiro</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
        .header { background: #1a1a2e; color: #fff; padding: 32px; text-align: center; }
        .pickup-box { background: #faf5ff; border: 2px solid #8b5cf6; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center; }
        .body { padding: 32px; }
        .footer { text-align: center; padding: 24px; color: #999; font-size: 12px; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Yocigaci</h1>
        <p style="margin: 8px 0 0;">Il tuo ordine è pronto!</p>
    </div>
    <div class="body">
        <p>Il tuo ordine <strong>{{ $order->order_number }}</strong> è arrivato in negozio ed è pronto per essere ritirato.</p>

        <div class="pickup-box">
            <p style="margin: 0 0 8px; color: #666; font-size: 14px;">Puoi passare a ritirarlo quando vuoi</p>
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #6d28d9;">Ritiro in negozio</p>
        </div>

        <p>Ti aspettiamo! Porta con te la conferma d'ordine o questo numero:</p>
        <p style="font-size: 20px; font-weight: bold; letter-spacing: 1px; text-align: center;">{{ $order->order_number }}</p>
    </div>
    <div class="footer">
        <p>&copy; {{ date('Y') }} Yocigaci. Per assistenza scrivi a <a href="mailto:assistenza-yocigaci@gmail.com" style="color: #999;">assistenza-yocigaci@gmail.com</a></p>
    </div>
</div>
</body>
</html>
