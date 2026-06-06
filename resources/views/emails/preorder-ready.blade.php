<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Preordine Pronto</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
        .header { background: #1a1a2e; color: #fff; padding: 32px; text-align: center; }
        .banner { background: #22c55e; color: #fff; padding: 16px 32px; text-align: center; font-weight: bold; }
        .body { padding: 32px; }
        .footer { text-align: center; padding: 24px; color: #999; font-size: 12px; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Yocigaci</h1>
    </div>
    <div class="banner">Il tuo preordine è pronto!</div>
    <div class="body">
        <p>Ottima notizia! Il tuo preordine <strong>{{ $order->order_number }}</strong> è arrivato e verrà spedito a breve.</p>
        <p>Riceverai un'email con il codice di tracciamento non appena il pacco sarà consegnato al corriere.</p>
        <p>Grazie per la pazienza!</p>
    </div>
    <div class="footer">
        <p>© {{ date('Y') }} Yocigaci. Per assistenza scrivi a <a href="mailto:assistenza-yocigaci@gmail.com" style="color: #999;">assistenza-yocigaci@gmail.com</a></p>
    </div>
</div>
</body>
</html>
