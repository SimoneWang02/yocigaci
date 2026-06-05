# Pagine legali — dati e istruzioni per Claude Code

## Istruzioni per Claude Code

Questo file contiene tutto il necessario per generare e salvare le pagine legali del sito.

**Cosa fare quando i dati sono compilati:**
1. Leggere la sezione "Contesto progetto" per capire stack e struttura
2. Leggere la sezione "Dati del venditore" e tutte le sezioni successive
3. Generare il contenuto HTML per ciascuna delle 7 pagine elencate in "Pagine da compilare"
4. Salvare ogni pagina nel database tramite:
   ```
   ./vendor/bin/sail artisan tinker
   ```
   oppure aggiornando direttamente via `App\Models\Page::where('slug', '...')->update(['content' => '...', 'title' => '...'])`
5. I contenuti HTML devono essere pronti per `dangerouslySetInnerHTML` — usare tag semantici (`<h2>`, `<p>`, `<ul>`, `<strong>`) senza classi CSS
6. Il testo deve essere conforme alla legge italiana (D.Lgs. 206/2005, GDPR Reg. UE 2016/679, D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018)

---

## Contesto progetto

**Nome sito:** Yocigaci

**Tipo di business:** Ecommerce B2C di carte collezionabili TCG (Trading Card Game)

**Prodotti venduti:** Booster box, display, collezioni speciali e accessori per:
- Pokémon
- One Piece
- Magic: The Gathering
- Riftbound

**Caratteristica rilevante per le policy:** I prodotti TCG sigillati una volta aperti perdono valore e non possono essere rivenduti — questo incide su recesso e resi.

**Stack tecnico (rilevante per Privacy/Cookie):**
- Frontend: React SPA (Vite + TailwindCSS)
- Backend: Laravel 11 + Sanctum
- Pagamenti: **Stripe** (elabora i dati della carta, server in USA/UE — rilevante per trasferimento dati extra-UE)
- Email transazionali: da definire (attualmente Mailpit in sviluppo)
- Analytics/tracking: vedi sezione Cookie Policy
- Hosting: da definire

**Struttura pagine nel database:**
- Tabella: `pages`
- Campi: `id`, `slug`, `title`, `content` (HTML), `created_at`, `updated_at`
- Route pubblica: `/p/:slug` (React) → `GET /api/pages/{slug}` (Laravel)
- Route admin: `GET /api/admin/pages`, `PATCH /api/admin/pages/{slug}`

---

## Pagine da compilare

| Slug | Titolo | URL pubblico |
|---|---|---|
| `privacy` | Informativa sulla Privacy | `/p/privacy` |
| `termini-e-condizioni` | Termini e Condizioni del Servizio | `/p/termini-e-condizioni` |
| `resi-e-rimborsi` | Resi e Rimborsi | `/p/resi-e-rimborsi` |
| `diritto-di-recesso` | Diritto di Recesso | `/p/diritto-di-recesso` |
| `spedizioni` | Informazioni sulle Spedizioni | `/p/spedizioni` |
| `recapiti` | Recapiti | `/p/recapiti` |
| `cookie` | Informativa sui Cookie | `/p/cookie` |

---

## Dati da compilare

### Dati del venditore (usati in tutte le pagine)

- **Ragione sociale / Nome e cognome del titolare*** :
- **Forma giuridica** (es. ditta individuale, SRL, SNC…) :
- **P.IVA*** :
- **Codice fiscale** (se diverso da P.IVA) :
- **Indirizzo sede legale*** (via, CAP, città, provincia) :
- **Email di contatto*** :
- **PEC** (obbligatoria se hai partita IVA) :
- **Numero di telefono / WhatsApp** :
- **Numero REA** (se iscritto alla Camera di Commercio) :

---

### Recapiti

- **Orari di assistenza** (es. lun–ven 9:00–18:00) :
- **Canali di contatto disponibili** (email, WhatsApp, Instagram, altro) :
- **Tempo medio di risposta** (es. entro 24 ore) :

---

### Spedizioni

- **Corrieri utilizzati*** (es. BRT, GLS, SDA, Poste Italiane) :
- **Zone di spedizione*** (solo Italia? Europa? Tutto il mondo?) :
- **Tempi di consegna stimati*** (es. 2–5 giorni lavorativi) :
- **Costi di spedizione per fascia di peso/importo*** :
- **Soglia per spedizione gratuita** (es. gratis sopra €50, oppure mai gratuita) :
- **Tempi di preparazione ordine** (es. ordini spediti entro 1–2 giorni lavorativi) :
- **Cosa fa il cliente in caso di pacco danneggiato o non ricevuto?** (es. scrivere entro X giorni a ...) :
- **Spedisci prodotti sigillati con imballaggio protettivo?** (sì/no) :

---

### Resi e Rimborsi

- **Prodotti aperti (bustine, display) sono rimborsabili?*** (per TCG la risposta standard è NO — prodotto perde integrità) :
- **Condizioni per accettare un reso** (es. prodotto integro, sigillato, nella confezione originale) :
- **Finestra temporale per richiedere un reso*** (es. 14 giorni dalla consegna) :
- **Come avviare un reso** (es. email a info@...) :
- **Chi paga le spese di spedizione del reso?*** (cliente o Yocigaci) :
- **Tempi di rimborso*** (es. entro 14 giorni dalla ricezione del reso) :
- **Metodo di rimborso** (stessa modalità di pagamento usata / credito shop / altro) :
- **Cosa succede se arriva un prodotto difettoso o errato?** (spese a carico vostro? sostituzione?) :

---

### Diritto di Recesso

*(Per legge il cliente ha 14 giorni per recedere senza motivazione — art. 52 D.Lgs. 206/2005)*

- **I prodotti sigillati una volta aperti sono esclusi dal recesso?*** (art. 59 lett. e — risposta tipica TCG: sì) :
- **Chi paga le spese di restituzione in caso di recesso?*** (di default le paga il cliente) :
- **Indirizzo a cui restituire i prodotti*** :
- **Vuoi allegare il modulo di recesso standard EU?** (sì/no — obbligatorio metterlo a disposizione) :

---

### Termini e Condizioni

- **Prezzi esposti sul sito sono IVA inclusa o esclusa?*** :
- **Il sito vende solo a privati (B2C) o anche ad aziende (B2B)?** :
- **Età minima per acquistare** (es. 18 anni, oppure nessun limite) :
- **Foro competente in caso di controversia*** (tipicamente la città della sede legale) :
- **Vuoi includere una clausola di riserva variazione prezzi?** (i prezzi TCG fluttuano — consigliato: sì) :

---

### Privacy Policy (GDPR — Reg. UE 2016/679)

- **Responsabile della protezione dei dati (DPO)** — hai nominato un DPO? (per piccole aziende tipicamente no) :
- **Provider email transazionali in produzione** (es. Mailgun, Brevo, SendGrid) :
- **Hosting provider** (es. Hetzner, OVH, DigitalOcean — rilevante per localizzazione server) :
- **Servizi di analytics usati** (es. Google Analytics 4, Plausible, nessuno) :
- **Newsletter** — raccogli email per marketing? (sì/no) :
- **Per quanto tempo conservi i dati degli ordini?*** (default consigliato: 10 anni per obbligo fiscale art. 2220 c.c.) :
- **Per quanto tempo conservi i dati degli account utente inattivi?** (es. 3 anni dall'ultimo accesso) :
- **Nota Stripe:** Stripe Inc. (USA) elabora i pagamenti — i dati vengono trasferiti negli USA tramite Standard Contractual Clauses (SCC). Questo va menzionato nella privacy policy.

---

### Cookie Policy (Provv. Garante Privacy 10/06/2021)

- **Usi Google Analytics o altri strumenti di analytics?** (sì/no — se sì, quale) :
- **Usi Meta Pixel (Facebook/Instagram ads)?** (sì/no) :
- **Usi altri cookie di terze parti oltre a Stripe?** :
- **Nota:** I cookie tecnici (sessione, autenticazione, carrello) non richiedono consenso. Il banner è obbligatorio solo se usi cookie di profilazione o analytics. Indicare qui se si vuole implementare il banner.
