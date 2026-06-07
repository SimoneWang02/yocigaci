<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preordine Confermato</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #ebebf2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
        .wrapper { padding: 40px 16px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #d8d8e8; }

        .header { background: #1a1a2e; padding: 36px 40px 30px; text-align: center; }
        .logo { font-size: 26px; font-weight: 900; color: #fff; letter-spacing: 4px; margin: 0; line-height: 1; }
        .header-sub { font-size: 12px; color: rgba(255,255,255,0.5); margin: 8px 0 0; letter-spacing: 1px; text-transform: uppercase; }

        .accent-bar { height: 3px; background: #d97706; }

        .status-wrap { padding: 28px 40px 0; }
        .badge { display: inline-block; background: #fffbeb; color: #b45309; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 100px; letter-spacing: 0.6px; border: 1px solid #fde68a; text-transform: uppercase; }

        .body { padding: 24px 40px 40px; }
        .title { font-size: 21px; font-weight: 800; color: #1a1a2e; margin: 0 0 6px; }
        .subtitle { color: #6b6b8a; font-size: 14px; line-height: 1.7; margin: 0 0 28px; }

        .notice { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; color: #92400e; font-size: 13px; line-height: 1.6; }
        .notice strong { color: #78350f; }

        table.tbl { width: 100%; border-collapse: collapse; font-size: 14px; }
        .tbl thead th { background: #f5f5fa; color: #8888aa; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 10px 12px; text-align: left; border-bottom: 1px solid #e0e0ee; }
        .tbl tbody td { padding: 13px 12px; border-bottom: 1px solid #f0f0f8; color: #2d2d4e; vertical-align: top; }
        .tbl tbody tr:last-child td { border-bottom: none; }
        .tbl .total td { background: #f5f5fa; font-weight: 800; font-size: 15px; color: #1a1a2e; padding: 15px 12px; border-top: 2px solid #1a1a2e; }
        .tbl .r { text-align: right; white-space: nowrap; }
        .release-date { font-size: 13px; color: #b45309; font-weight: 600; white-space: nowrap; }

        .info-text { color: #6b6b8a; font-size: 14px; line-height: 1.7; margin: 24px 0 0; }

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
        <span class="badge">Preordine Confermato</span>
    </div>

    <div class="body">
        <p class="title">Preordine ricevuto!</p>
        <p class="subtitle">
            Il tuo preordine <strong style="color:#1a1a2e;">{{ $order->order_number }}</strong> è confermato e il pagamento è stato ricevuto.
        </p>

        <div class="notice">
            <strong>In attesa di disponibilità</strong> - Spediremo non appena la merce sarà disponibile. Riceverai un'email di avviso.
        </div>

        <table class="tbl">
            <thead>
                <tr>
                    <th>Prodotto</th>
                    <th>Uscita prevista</th>
                    <th class="r">Qtà</th>
                    <th class="r">Prezzo</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td>{{ $item->product_snapshot['name'] }}</td>
                    <td>
                        @if(isset($item->product_snapshot['preorder_release_date']))
                            <span class="release-date">{{ \Carbon\Carbon::parse($item->product_snapshot['preorder_release_date'])->format('d/m/Y') }}</span>
                        @else
                            <span style="color:#9999bb;">-</span>
                        @endif
                    </td>
                    <td class="r">{{ $item->quantity }}</td>
                    <td class="r">€&nbsp;{{ number_format($item->total_price, 2, ',', '.') }}</td>
                </tr>
                @endforeach
                <tr class="total">
                    <td colspan="3">Totale pagato</td>
                    <td class="r">€&nbsp;{{ number_format($order->total, 2, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>

        <p class="info-text">Grazie per la tua fiducia! Riceverai un'altra email non appena il preordine sarà pronto per la spedizione.</p>
    </div>

    <div class="footer">
        <p>© {{ date('Y') }} Yocigaci &nbsp;·&nbsp; Per assistenza: <a href="mailto:{{ \App\Models\Setting::getValue('support_email', 'assistenza.yocigaci@gmail.com') }}">{{ \App\Models\Setting::getValue('support_email', 'assistenza.yocigaci@gmail.com') }}</a></p>
    </div>

</div>
</div>
</body>
</html>
