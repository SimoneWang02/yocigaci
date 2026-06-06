<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Ordine Confermato</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
        .header { background: #1a1a2e; color: #fff; padding: 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .body { padding: 32px; }
        .order-number { font-size: 20px; font-weight: bold; color: #1a1a2e; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { text-align: left; padding: 8px; background: #f0f0f0; font-size: 12px; text-transform: uppercase; color: #666; }
        td { padding: 12px 8px; border-bottom: 1px solid #eee; }
        .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #1a1a2e; }
        .address-box { background: #f9f9f9; border-radius: 6px; padding: 16px; margin-top: 24px; }
        .footer { text-align: center; padding: 24px; color: #999; font-size: 12px; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Yocigaci</h1>
        <p style="margin: 8px 0 0;">Il tuo ordine è confermato!</p>
    </div>
    <div class="body">
        <p class="order-number">Ordine {{ $order->order_number }}</p>
        <p>Grazie per il tuo acquisto. Il tuo ordine è stato ricevuto e verrà preparato a breve.</p>
        @if($order->delivery_method === 'pickup')
        <p>Riceverai una email non appena il tuo ordine sarà pronto per il ritiro in negozio.</p>
        @else
        <p>Riceverai una email con il numero di tracking non appena il tuo ordine verrà spedito.</p>
        @endif

        <table>
            <tr>
                <th>Prodotto</th>
                <th>Qtà</th>
                <th>Prezzo</th>
            </tr>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product_snapshot['name'] }}</td>
                <td>{{ $item->quantity }}</td>
                <td>€ {{ number_format($item->total_price, 2, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr>
                <td colspan="2">Spedizione</td>
                <td>{{ $order->shipping_cost > 0 ? '€ ' . number_format($order->shipping_cost, 2, ',', '.') : 'Gratuita' }}</td>
            </tr>
            <tr class="total-row">
                <td colspan="2">Totale</td>
                <td>€ {{ number_format($order->total, 2, ',', '.') }}</td>
            </tr>
        </table>

        @if($order->delivery_method === 'pickup')
        <div class="address-box">
            <strong>Ritiro in negozio</strong>
            <p style="margin: 8px 0 0;">Ti contatteremo quando l'ordine sarà pronto.</p>
        </div>
        @elseif(!empty($order->shipping_address))
        <div class="address-box">
            <strong>Indirizzo di spedizione</strong>
            <p style="margin: 8px 0 0;">
                {{ $order->shipping_address['full_name'] }}<br>
                {{ $order->shipping_address['address_line1'] }}<br>
                @if(!empty($order->shipping_address['address_line2']))
                    {{ $order->shipping_address['address_line2'] }}<br>
                @endif
                {{ $order->shipping_address['postal_code'] }} {{ $order->shipping_address['city'] }} ({{ $order->shipping_address['province'] }})<br>
                {{ $order->shipping_address['country'] }}
            </p>
        </div>
        @endif
    </div>
    <div class="footer">
        <p>© {{ date('Y') }} Yocigaci. Per assistenza scrivi a <a href="mailto:assistenza-yocigaci@gmail.com" style="color: #999;">assistenza-yocigaci@gmail.com</a></p>
    </div>
</div>
</body>
</html>
