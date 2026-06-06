<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reimposta la tua password</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #ebebf2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
        .wrapper { padding: 40px 16px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #d8d8e8; }

        .header { background: #1a1a2e; padding: 36px 40px 30px; text-align: center; }
        .logo { font-size: 26px; font-weight: 900; color: #fff; letter-spacing: 4px; margin: 0; line-height: 1; }
        .header-sub { font-size: 12px; color: rgba(255,255,255,0.5); margin: 8px 0 0; letter-spacing: 1px; text-transform: uppercase; }

        .accent-bar { height: 3px; background: #e63946; }

        .body { padding: 40px 40px 36px; }
        .title { font-size: 21px; font-weight: 800; color: #1a1a2e; margin: 0 0 10px; }
        .text { color: #6b6b8a; font-size: 14px; line-height: 1.7; margin: 0 0 28px; }

        .btn-wrap { text-align: center; margin: 0 0 28px; }
        .btn { display: inline-block; background: #1a1a2e; color: #fff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 36px; border-radius: 10px; letter-spacing: 0.3px; }

        .note { background: #f5f5fa; border-radius: 10px; padding: 16px 20px; border-left: 3px solid #e63946; }
        .note p { margin: 0; color: #6b6b8a; font-size: 13px; line-height: 1.6; }
        .note strong { color: #1a1a2e; }

        .url-fallback { margin: 20px 0 0; }
        .url-fallback p { color: #9999bb; font-size: 12px; margin: 0 0 6px; }
        .url-fallback a { color: #6b6b8a; font-size: 12px; word-break: break-all; }

        .footer { background: #f5f5fa; border-top: 1px solid #e0e0ee; padding: 22px 40px; text-align: center; }
        .footer p { color: #aaaacc; font-size: 12px; margin: 0; line-height: 1.6; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="container">
        <div class="header">
            <p class="logo">YOCIGACI</p>
            <p class="header-sub">Il tuo negozio di carte</p>
        </div>
        <div class="accent-bar"></div>

        <div class="body">
            <p class="title">Reimposta la tua password</p>
            <p class="text">
                Hai richiesto di reimpostare la password del tuo account.<br>
                Clicca sul pulsante qui sotto per scegliere una nuova password.
            </p>

            <div class="btn-wrap">
                <a href="{{ $resetUrl }}" class="btn">Reimposta password</a>
            </div>

            <div class="note">
                <p>
                    <strong>Il link scade tra 60 minuti.</strong><br>
                    Se non hai richiesto il reset della password, ignora questa email — il tuo account e al sicuro.
                </p>
            </div>

            <div class="url-fallback">
                <p>Se il pulsante non funziona, copia e incolla questo link nel browser:</p>
                <a href="{{ $resetUrl }}">{{ $resetUrl }}</a>
            </div>
        </div>

        <div class="footer">
            <p>Yocigaci &mdash; questa email e stata inviata automaticamente, non rispondere.</p>
        </div>
    </div>
</div>
</body>
</html>
