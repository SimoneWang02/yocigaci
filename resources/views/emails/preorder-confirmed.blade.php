<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Preordine Confermato</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
        .header { background: #1a1a2e; color: #fff; padding: 32px; text-align: center; }
        .banner { background: #f59e0b; color: #fff; padding: 16px 32px; text-align: center; font-weight: bold; }
        .body { padding: 32px; }
        .order-number { font-size: 20px; font-weight: bold; color: #1a1a2e; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { text-align: left; padding: 8px; background: #f0f0f0; font-size: 12px; text-transform: uppercase; color: #666; }
        td { padding: 12px 8px; border-bottom: 1px solid #eee; }
        .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #1a1a2e; }
        .footer { text-align: center; padding: 24px; color: #999; font-size: 12px; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Yocigaci</h1>
        <p style="margin: 8px 0 0;">Preordine Confermato!</p>
    </div>
    <div class="banner">Preordine in attesa di disponibilità</div>
    <div class="body">
        <p class="order-number">Ordine {{ $order->order_number }}</p>
        <p>Grazie per il tuo preordine! Il pagamento è stato ricevuto. Spediremo non appena la merce sarà disponibile.</p>

        <table>
            <tr>
                <th>Prodotto</th>
                <th>Uscita prevista</th>
                <th>Qtà</th>
                <th>Prezzo</th>
            </tr>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product_snapshot['name'] }}</td>
                <td>{{ isset($item->product_snapshot['preorder_release_date']) ? \Carbon\Carbon::parse($item->product_snapshot['preorder_release_date'])->format('d/m/Y') : '-' }}</td>
                <td>{{ $item->quantity }}</td>
                <td>€ {{ number_format($item->total_price, 2, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="3">Totale pagato</td>
                <td>€ {{ number_format($order->total, 2, ',', '.') }}</td>
            </tr>
        </table>

        <p>Riceverai un'altra email quando il preordine sarà pronto per la spedizione.</p>
    </div>
    <div class="footer">
        <p>© {{ date('Y') }} Yocigaci. Per assistenza scrivi a <a href="mailto:assistenza-yocigaci@gmail.com" style="color: #999;">assistenza-yocigaci@gmail.com</a></p>
    </div>
</div>
</body>
</html>
