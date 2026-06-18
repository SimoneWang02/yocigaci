# Security Audit — yocigaci

Data: 2026-06-18
Stack: Laravel (API) + React (SPA), pagamenti Stripe.

Esito generale: basi solide (prezzi calcolati server-side, nessuna SQL injection,
IDOR su indirizzi/ordini gestito, webhook Stripe con verifica firma, `.env` non
tracciato, password hashate, anti-enumerazione su reset password). Di seguito i
punti da sistemare, in ordine di priorità.

---

## 🔴 ALTA

### 1. Nessun rate limiting sull'API (eccetto login) — ✅ RISOLTO
`bootstrap/app.php` non applicava `throttle` al gruppo `api`. Solo `login` aveva
un rate limit manuale. Erano quindi forzabili senza limiti:

- `POST /coupons/validate` → enumerazione brute-force dei codici coupon validi
- `POST /orders/track` → enumerazione ordini (vedi #2)
- `POST /auth/forgot-password` → email bombing
- `POST /auth/register` → creazione massiva di account
- `POST /checkout/create-session` → spam di sessioni/coupon Stripe

**Fix applicato:** throttle globale `throttle:api` sul gruppo API + limiti più
stringenti dedicati sulle route sensibili (auth, tracking, coupon, checkout).

### 2. Enumerazione ordini via tracking pubblico — ✅ RISOLTO
`app/Models/Order.php` genera numeri d'ordine sequenziali e prevedibili
(`ORD-2026-0001`, `-0002`, …). `OrderTrackingController` è pubblico e senza rate
limit: chi conosce l'email di un cliente poteva iterare i numeri e scoprirne
ordini, stato, metodo di consegna e tracking. Esponeva anche il volume di vendite.

**Fix applicato:**
1. Rate limit dedicato e restrittivo sull'endpoint di tracking (`throttle:tracking`).
   La risposta resta indistinguibile tra "ordine inesistente" ed "email non
   corrispondente" (già corretto in precedenza).
2. Numeri d'ordine resi imprevedibili: da `ORD-YYYY-NNNN` progressivo a
   `ORD-YYYY-XXXXXXXX` con 8 caratteri casuali (alfabeto di 31 simboli senza
   caratteri ambigui → ~8,5×10¹¹ combinazioni). Vedi `App\Models\Order::generateOrderNumber()`.
3. Backfill degli ordini esistenti: migration
   `2026_06_18_000001_randomize_existing_order_numbers` che rigenera solo i numeri
   ancora nel vecchio formato sequenziale.

> ⚠️ Deploy: il codice va deployato **prima** di eseguire `php artisan migrate`
> (la migration usa `Order::generateOrderNumber()`). Gli ordini esistenti
> cambieranno numero: le email di conferma già inviate citeranno il vecchio
> riferimento (impatto trascurabile, in produzione ci sono solo 2 ordini di test).

### 3. `APP_DEBUG=true` / `APP_ENV=local` — ✅ VERIFICATO OK IN PRODUZIONE
Nel `.env` locale i valori sono `APP_DEBUG=true` e `APP_ENV=local` (corretto in
sviluppo). Con `shouldRenderJsonWhen(api/*)`, in produzione questi valori
esporrebbero stack trace dettagliati nelle risposte API.

**Verifica (2026-06-18, via SSH su `/var/www/yocigaci`):** la `.env` di produzione
ha `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://yocigaci.com`,
`LOG_LEVEL=error`. Anche la config cachata a runtime conferma `debug=false`,
`env=production`. Nessuna azione necessaria.

---

## 🟡 MEDIA

### 4. Breakout `</script>` nei JSON-LD prerenderizzati
`resources/views/prerender/*.blade.php` usano
`{!! json_encode(..., JSON_UNESCAPED_SLASHES) !!}` dentro
`<script type="application/ld+json">`. Un valore contenente `</script>`
(es. nome prodotto/categoria) chiude il tag → XSS. Dati oggi gestiti solo da
admin, ma è difesa-in-profondità importante.

**Fix consigliato:** aggiungere
`JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT` al `json_encode`.

### 5. `{!! $page->content !!}` HTML non sanificato
`resources/views/prerender/page.blade.php` renderizza HTML grezzo dal contenuto
pagina. Admin-only oggi, ma stored XSS se un account admin è compromesso o se il
campo diventa editabile altrove.

**Fix consigliato:** sanificare l'HTML (es. HTMLPurifier) o documentare il rischio.

### 6. Mass assignment di `role` su `User`
`app/Models/User.php` ha `role` in `$fillable`. Oggi non sfruttabile (register
forza `'customer'`, non c'è update profilo), ma è una mina latente: un futuro
`$user->update($request->...)` darebbe privilege escalation.

**Fix consigliato:** rimuovere `role` da `$fillable` e assegnarlo esplicitamente.

---

## 🟢 BASSA

### 7. CORS con pattern `localhost` + credenziali
`config/cors.php` ha `allowed_origins_patterns => ['#^http://localhost(:\d+)?$#']`
con `supports_credentials => true`. Comodo in dev, da rimuovere in produzione.

### 8. Token Sanctum senza scadenza
`config/sanctum.php` ha `expiration => null`. Valutare una scadenza per i Bearer
token.

### 9. Coupon `used_count` non transazionale
L'`usage_limit` è verificato a validazione ma `used_count` è incrementato solo a
fulfillment: sotto concorrenza un coupon a uso limitato può essere speso oltre il
limite.
