<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ordine Confermato</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #ebebf2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
        .wrapper { padding: 40px 16px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #d8d8e8; }

        .header { background: #1a1a2e; padding: 36px 40px 30px; text-align: center; }
        .logo { font-size: 26px; font-weight: 900; color: #fff; letter-spacing: 4px; margin: 0; line-height: 1; }
        .header-sub { font-size: 12px; color: rgba(255,255,255,0.5); margin: 8px 0 0; letter-spacing: 1px; text-transform: uppercase; }

        .accent-bar { height: 3px; background: #e63946; }

        .status-wrap { padding: 28px 40px 0; }
        .badge { display: inline-block; background: #ecfdf5; color: #15803d; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 100px; letter-spacing: 0.6px; border: 1px solid #bbf7d0; text-transform: uppercase; }

        .body { padding: 24px 40px 40px; }
        .title { font-size: 21px; font-weight: 800; color: #1a1a2e; margin: 0 0 6px; }
        .subtitle { color: #6b6b8a; font-size: 14px; line-height: 1.7; margin: 0 0 28px; }

        table.tbl { width: 100%; border-collapse: collapse; font-size: 14px; }
        .tbl thead th { background: #f5f5fa; color: #8888aa; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 10px 12px; text-align: left; border-bottom: 1px solid #e0e0ee; }
        .tbl tbody td { padding: 13px 12px; border-bottom: 1px solid #f0f0f8; color: #2d2d4e; vertical-align: top; }
        .tbl tbody tr:last-child td { border-bottom: none; }
        .tbl .muted td { color: #8888aa; }
        .tbl .total td { background: #f5f5fa; font-weight: 800; font-size: 15px; color: #1a1a2e; padding: 15px 12px; border-top: 2px solid #1a1a2e; }
        .tbl .r { text-align: right; white-space: nowrap; }

        .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9999bb; margin: 28px 0 10px; }
        .address-card { background: #f5f5fa; border-radius: 10px; padding: 18px 20px; border-left: 3px solid #1a1a2e; }
        .address-card p { margin: 0; color: #2d2d4e; font-size: 14px; line-height: 1.8; }
        .address-name { font-weight: 700; color: #1a1a2e; display: block; margin-bottom: 2px; }

        .footer { background: #f5f5fa; border-top: 1px solid #e0e0ee; padding: 22px 40px; text-align: center; }
        .footer p { color: #aaaacc; font-size: 12px; margin: 0; line-height: 1.6; }
        .footer a { color: #8888aa; text-decoration: none; }
    </style>
</head>
<body>
<div class="wrapper">
<div class="container">

    <div class="header">
        <p class="logo">YOCIGACI</p>
        <p class="header-sub">Trading Card Games &amp; Collectibles</p>
    </div>
    <div class="accent-bar"></div>

    <div class="status-wrap">
        <span class="badge">Ordine Confermato</span>
    </div>

    <div class="body">
        <p class="title">Grazie per il tuo ordine!</p>
        <p class="subtitle">
            Il tuo ordine <strong style="color:#1a1a2e;">{{ $order->order_number }}</strong> è stato ricevuto e verrà preparato a breve.
            @if($order->delivery_method === 'pickup')
            Ti avviseremo via email non appena sarà pronto per il ritiro in negozio.
            @else
            Ti invieremo il codice di tracciamento non appena il pacco sarà affidato al corriere.
            @endif
        </p>

        <table class="tbl">
            <thead>
                <tr>
                    <th>Prodotto</th>
                    <th class="r">Qtà</th>
                    <th class="r">Prezzo</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td>{{ $item->product_snapshot['name'] }}</td>
                    <td class="r">{{ $item->quantity }}</td>
                    <td class="r">€&nbsp;{{ number_format($item->total_price, 2, ',', '.') }}</td>
                </tr>
                @endforeach
                <tr class="muted">
                    <td colspan="2">Spedizione</td>
                    <td class="r">{{ $order->shipping_cost > 0 ? '€ ' . number_format($order->shipping_cost, 2, ',', '.') : 'Gratuita' }}</td>
                </tr>
                <tr class="total">
                    <td colspan="2">Totale</td>
                    <td class="r">€&nbsp;{{ number_format($order->total, 2, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>

        @if($order->delivery_method === 'pickup')
        <p class="section-label">Modalità di ritiro</p>
        <div class="address-card">
            <p><span class="address-name">Ritiro in negozio</span>Ti contatteremo quando l'ordine sarà pronto per essere ritirato.</p>
        </div>
        @elseif(!empty($order->shipping_address))
        <p class="section-label">Indirizzo di spedizione</p>
        <div class="address-card">
            <p>
                <span class="address-name">{{ $order->shipping_address['full_name'] }}</span>
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
        <p>© {{ date('Y') }} Yocigaci &nbsp;·&nbsp; Per assistenza: <a href="mailto:assistenza-yocigaci@gmail.com">assistenza-yocigaci@gmail.com</a></p>
    </div>

</div>
</div>
</body>
</html>
