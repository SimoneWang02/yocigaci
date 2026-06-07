<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ordine Spedito</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #ebebf2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
        .wrapper { padding: 40px 16px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #d8d8e8; }

        .header { background: #1a1a2e; padding: 36px 40px 30px; text-align: center; }
        .logo { font-size: 26px; font-weight: 900; color: #fff; letter-spacing: 4px; margin: 0; line-height: 1; }
        .header-sub { font-size: 12px; color: rgba(255,255,255,0.5); margin: 8px 0 0; letter-spacing: 1px; text-transform: uppercase; }

        .accent-bar { height: 3px; background: #16a34a; }

        .status-wrap { padding: 28px 40px 0; }
        .badge { display: inline-block; background: #ecfdf5; color: #15803d; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 100px; letter-spacing: 0.6px; border: 1px solid #bbf7d0; text-transform: uppercase; }

        .body { padding: 24px 40px 40px; }
        .title { font-size: 21px; font-weight: 800; color: #1a1a2e; margin: 0 0 6px; }
        .subtitle { color: #6b6b8a; font-size: 14px; line-height: 1.7; margin: 0 0 8px; }

        .tracking-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 28px 24px; margin: 28px 0; text-align: center; }
        .tracking-label { font-size: 11px; font-weight: 700; color: #6b6b8a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px; }
        .tracking-code { font-size: 26px; font-weight: 900; color: #15803d; letter-spacing: 4px; margin: 0; font-variant-numeric: tabular-nums; }

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
        <span class="badge">Spedito</span>
    </div>

    <div class="body">
        <p class="title">Il tuo ordine è in arrivo!</p>
        <p class="subtitle">
            Il tuo ordine <strong style="color:#1a1a2e;">{{ $order->order_number }}</strong> è stato affidato al corriere.
        </p>

        @if($order->tracking_code)
        <div class="tracking-box">
            <p class="tracking-label">Codice di tracciamento</p>
            <p class="tracking-code">{{ $order->tracking_code }}</p>
            <a href="https://www.dhl.com/it-it/home/tracking.html?tracking-id={{ $order->tracking_code }}" style="display:inline-block;margin-top:16px;background:#15803d;color:#fff;font-size:13px;font-weight:700;text-decoration:none;padding:10px 24px;border-radius:8px;letter-spacing:0.3px;">Traccia su DHL</a>
        </div>
        <p class="info-text">Clicca il pulsante sopra per seguire la spedizione in tempo reale. Di solito le consegne avvengono entro <strong style="color:#1a1a2e;">2-5 giorni lavorativi</strong>.</p>
        @else
        <p class="info-text" style="margin-top: 16px;">Ti invieremo il codice di tracciamento non appena sarà disponibile. Di solito le consegne avvengono entro <strong style="color:#1a1a2e;">2–5 giorni lavorativi</strong>.</p>
        @endif
    </div>

    <div class="footer">
        <p>© {{ date('Y') }} Yocigaci &nbsp;·&nbsp; Per assistenza: <a href="mailto:{{ $supportEmail }}">{{ $supportEmail }}</a></p>
    </div>

</div>
</div>
</body>
</html>
