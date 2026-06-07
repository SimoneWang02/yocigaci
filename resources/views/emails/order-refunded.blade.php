<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $isFull ? 'Rimborso Effettuato' : 'Rimborso Parziale Effettuato' }}</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #ebebf2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
        .wrapper { padding: 40px 16px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #d8d8e8; }

        .header { background: #1a1a2e; padding: 36px 40px 30px; text-align: center; }
        .logo { font-size: 26px; font-weight: 900; color: #fff; letter-spacing: 4px; margin: 0; line-height: 1; }
        .header-sub { font-size: 12px; color: rgba(255,255,255,0.5); margin: 8px 0 0; letter-spacing: 1px; text-transform: uppercase; }

        .accent-bar { height: 3px; background: #0369a1; }

        .status-wrap { padding: 28px 40px 0; }
        .badge { display: inline-block; background: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 100px; letter-spacing: 0.6px; border: 1px solid #bfdbfe; text-transform: uppercase; }

        .body { padding: 24px 40px 40px; }
        .title { font-size: 21px; font-weight: 800; color: #1a1a2e; margin: 0 0 6px; }
        .subtitle { color: #6b6b8a; font-size: 14px; line-height: 1.7; margin: 0 0 8px; }

        .refund-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 28px 24px; margin: 28px 0; text-align: center; }
        .refund-label { font-size: 11px; font-weight: 700; color: #6b6b8a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px; }
        .refund-amount { font-size: 36px; font-weight: 900; color: #1d4ed8; margin: 0; font-variant-numeric: tabular-nums; }
        .refund-partial { margin: 10px 0 0; color: #6b6b8a; font-size: 13px; }
        .refund-partial strong { color: #1a1a2e; }

        .info-text { color: #6b6b8a; font-size: 14px; line-height: 1.7; margin: 0; }

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
        <span class="badge">{{ $isFull ? 'Rimborso Completo' : 'Rimborso Parziale' }}</span>
    </div>

    <div class="body">
        <p class="title">Rimborso elaborato</p>
        <p class="subtitle">
            Abbiamo elaborato un rimborso per il tuo ordine <strong style="color:#1a1a2e;">{{ $order->order_number }}</strong>.
        </p>

        <div class="refund-box">
            <p class="refund-label">Importo rimborsato</p>
            <p class="refund-amount">€&nbsp;{{ number_format($amount, 2, ',', '.') }}</p>
            @unless($isFull)
            <p class="refund-partial">
                Totale rimborsato finora: <strong>€&nbsp;{{ number_format((float) $order->refunded_amount, 2, ',', '.') }}</strong>
                su €&nbsp;{{ number_format((float) $order->total, 2, ',', '.') }}
            </p>
            @endunless
        </div>

        <p class="info-text">L'accredito comparirà sul metodo di pagamento usato per l'acquisto, di norma entro <strong style="color:#1a1a2e;">5–10 giorni lavorativi</strong> a seconda della tua banca.</p>
    </div>

    <div class="footer">
        <p>© {{ date('Y') }} Yocigaci &nbsp;·&nbsp; Per assistenza: <a href="mailto:{{ \App\Models\Setting::getValue('support_email', 'assistenza.yocigaci@gmail.com') }}">{{ \App\Models\Setting::getValue('support_email', 'assistenza.yocigaci@gmail.com') }}</a></p>
    </div>

</div>
</div>
</body>
</html>
