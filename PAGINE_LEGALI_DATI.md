# Pagine legali - dati e istruzioni per Claude Code

## Istruzioni per Claude Code

Questo file contiene tutto il necessario per generare e salvare le pagine legali del sito.

**Stato attuale:** Le 7 pagine sono già generate e presenti nel database (aggiornate il 7 giugno 2026). Il seeder è `database/seeders/PageSeeder.php`.

**Quando si completano i campi `[DA COMPILARE]`:**

1. Aggiornare i valori in questo file
2. Aggiornare il seeder `database/seeders/PageSeeder.php` sostituendo i placeholder
3. Rieseguire: `./vendor/bin/sail artisan db:seed --class=PageSeeder`

**Regole per l'HTML:**

- Contenuti pronti per `dangerouslySetInnerHTML` - tag semantici (`<h2>`, `<p>`, `<ul>`, `<strong>`) senza classi CSS
- Testo conforme a D.Lgs. 206/2005, GDPR Reg. UE 2016/679, D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018

---

## Contesto progetto

**Nome sito:** Yocigaci

**Tipo di business:** Ecommerce B2C di carte collezionabili TCG (Trading Card Game)

**Prodotti venduti:** Booster box, display, collezioni speciali e accessori per:

- Pokémon
- One Piece
- Magic: The Gathering
- Riftbound

**Caratteristica rilevante per le policy:** I prodotti TCG sigillati una volta aperti perdono valore e non possono essere rivenduti - questo incide su recesso e resi.

**Stack tecnico (rilevante per Privacy/Cookie):**

- Frontend: React SPA (Vite + TailwindCSS)
- Backend: Laravel 11 + Sanctum
- Pagamenti: **Stripe** (elabora i dati della carta, server in USA/UE - rilevante per trasferimento dati extra-UE, SCC già menzionate nella privacy)
- Email transazionali: **Brevo SAS** (Francia, UE)
- Analytics/tracking: nessuno
- Hosting: **Hetzner Online GmbH** (Germania, UE)

**Struttura pagine nel database:**

- Tabella: `pages`
- Campi: `id`, `slug`, `title`, `content` (HTML), `created_at`, `updated_at`
- Route pubblica: `/p/:slug` (React) → `GET /api/pages/{slug}` (Laravel)
- Route admin: `GET /api/admin/pages`, `PATCH /api/admin/pages/{slug}`

---

## Pagine da compilare

| Slug                   | Titolo                            | URL pubblico              | Stato  |
| ---------------------- | --------------------------------- | ------------------------- | ------ |
| `privacy`              | Informativa sulla Privacy         | `/p/privacy`              | Nel DB |
| `termini-e-condizioni` | Termini e Condizioni del Servizio | `/p/termini-e-condizioni` | Nel DB |
| `resi-e-rimborsi`      | Resi e Rimborsi                   | `/p/resi-e-rimborsi`      | Nel DB |
| `diritto-di-recesso`   | Diritto di Recesso                | `/p/diritto-di-recesso`   | Nel DB |
| `spedizioni`           | Informazioni sulle Spedizioni     | `/p/spedizioni`           | Nel DB |
| `recapiti`             | Recapiti                          | `/p/recapiti`             | Nel DB |
| `cookie`               | Informativa sui Cookie            | `/p/cookie`               | Nel DB |

---

## Dati da compilare

### Dati del venditore (usati in tutte le pagine)

- **Ragione sociale / Nome e cognome del titolare\*** : Yocigaci Srl
- **Forma giuridica** : Srl
- **P.IVA\*** : 03118860356
- **Codice fiscale** (se diverso da P.IVA) : 03118860356
- **Indirizzo sede legale\*** (via, CAP, città, provincia) : Via Zanichelli, 13 - 42015 Correggio (RE)
- **Email di contatto clienti** (assistenza, resi, ordini) : assistenza.yocigaci@gmail.com
- **Email legale / Titolare del trattamento GDPR** (da usare in Privacy Policy e intestazione T&C) : yocigacisrl@pec.it
- **PEC** (obbligatoria se hai partita IVA) : yocigacisrl@pec.it
- **Numero di telefono / WhatsApp** : 3713452156
- **Numero REA** (se iscritto alla Camera di Commercio) : MO - 453439

---

### Recapiti

- **Orari di assistenza** : Orari lavorativi - risposta garantita entro 24h nei giorni lavorativi
- **Canali di contatto disponibili** : Email + WhatsApp
- **Tempo medio di risposta** : entro 48 ore (giorni lavorativi)

---

### Spedizioni

- **Corrieri utilizzati\*** : DHL
- **Zone di spedizione\*** : solo Italia
- **Tempi di consegna stimati\*** : indicati al momento del checkout (dipendono dal corriere e dalla destinazione)
- **Costi di spedizione\*** : calcolati dinamicamente al checkout, impostati dall'admin nel pannello di controllo
- **Soglia per spedizione gratuita** : impostabile dall'admin, mostrata al cliente durante il checkout
- **Tempi di preparazione ordine** : 1–2 giorni lavorativi dalla conferma del pagamento
- **Cosa fa il cliente in caso di pacco danneggiato o non ricevuto?** : scrivere via email entro 7 giorni dalla consegna prevista (o dalla ricezione del pacco danneggiato)
- **Spedisci prodotti sigillati con imballaggio protettivo?** : sì

---

### Resi e Rimborsi

- **Prodotti aperti (bustine, display) sono rimborsabili?\*** : NO - prodotto perde integrità, escluso per legge (art. 59 lett. e D.Lgs. 206/2005)
- **Condizioni per accettare un reso** : prodotto integro, sigillato, nella confezione originale
- **Finestra temporale per richiedere un reso\*** : 14 giorni dalla data di consegna
- **Come avviare un reso** : email a assistenza.yocigaci@gmail.com con numero ordine, descrizione prodotto, motivo e foto
- **Chi paga le spese di spedizione del reso?\*** : il cliente - salvo prodotto difettoso o errore di spedizione (in quel caso a carico di Yocigaci)
- **Tempi di rimborso\*** : entro 14 giorni dalla ricezione del prodotto restituito
- **Metodo di rimborso** : stesso metodo di pagamento usato per l'acquisto (Stripe)
- **Cosa succede se arriva un prodotto difettoso o errato?** : spese di restituzione a carico di Yocigaci + sostituzione del prodotto (se disponibile) oppure rimborso completo, a scelta del cliente

---

### Diritto di Recesso

_(Per legge il cliente ha 14 giorni per recedere senza motivazione - art. 52 D.Lgs. 206/2005)_

- **I prodotti sigillati una volta aperti sono esclusi dal recesso?\*** : sì - art. 59, comma 1, lett. e D.Lgs. 206/2005
- **Chi paga le spese di restituzione in caso di recesso?\*** : il cliente
- **Indirizzo a cui restituire i prodotti\*** : Corso Fanti, 99 - 41012 Carpi (MO)
- **Vuoi allegare il modulo di recesso standard EU?** : sì - già incluso nella pagina `/p/diritto-di-recesso`

---

### Termini e Condizioni

- **Prezzi esposti sul sito sono IVA inclusa o esclusa?\*** : IVA inclusa
- **Il sito vende solo a privati (B2C) o anche ad aziende (B2B)?** : solo B2C
- **Età minima per acquistare** : 18 anni
- **Foro competente in caso di controversia\*** : Correggio (RE) - tipicamente la città della sede legale; per i consumatori vale comunque il foro del loro domicilio (art. 66-bis D.Lgs. 206/2005)
- **Vuoi includere una clausola di riserva variazione prezzi?** : sì - già inclusa (prezzi TCG fluttuanti)

---

### Privacy Policy (GDPR - Reg. UE 2016/679)

- **Responsabile della protezione dei dati (DPO)** : no - non nominato, non ricorrono i presupposti art. 37 GDPR
- **Provider email transazionali in produzione** : Brevo SAS (Francia, UE)
- **Hosting provider** : Hetzner Online GmbH (Germania, UE) - nessun trasferimento extra-UE
- **Servizi di analytics usati** : nessuno
- **Newsletter** : no - solo email transazionali legate agli ordini
- **Per quanto tempo conservi i dati degli ordini?\*** : 10 anni (obbligo fiscale art. 2220 c.c.)
- **Per quanto tempo conservi i dati degli account utente inattivi?** : 3 anni dall'ultimo accesso
- **Nota Stripe:** Stripe Inc. (USA) elabora i pagamenti - trasferimento USA tramite SCC (Decisione CE 2021/914). Già menzionato nella privacy policy.

---

### Cookie Policy (Provv. Garante Privacy 10/06/2021)

- **Usi Google Analytics o altri strumenti di analytics?** : no
- **Usi Meta Pixel (Facebook/Instagram ads)?** : no
- **Usi altri cookie di terze parti oltre a Stripe?** : no
- **Banner cookie obbligatorio?** : no - solo cookie tecnici (sessione, autenticazione, Stripe); nessun cookie di profilazione o analytics
