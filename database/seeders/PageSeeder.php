<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'slug'    => 'privacy',
                'title'   => 'Informativa sulla Privacy',
                'content' => <<<'HTML'
<p><em>Ultimo aggiornamento: 7 giugno 2026</em></p>

<p>La presente informativa descrive le modalità di trattamento dei dati personali degli utenti che navigano su <strong>yocigaci.com</strong> e acquistano prodotti offerti da Yocigaci Srl, ai sensi del Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018.</p>

<h2>1. Titolare del trattamento</h2>
<p>
  <strong>Yocigaci Srl</strong><br>
  Codice Fiscale: 03118860356<br>
  P.IVA: <strong>[DA COMPILARE]</strong><br>
  Sede legale: <strong>[DA COMPILARE]</strong><br>
  REA: <strong>[DA COMPILARE]</strong><br>
  Email: <strong>[DA COMPILARE]</strong><br>
  PEC: <strong>[DA COMPILARE]</strong>
</p>
<p>Non è stato nominato un Responsabile della Protezione dei Dati (DPO), non ricorrendone i presupposti ai sensi dell'art. 37 GDPR.</p>

<h2>2. Categorie di dati trattati e finalità</h2>

<h3>2.1 Registrazione e gestione account</h3>
<p>Al momento della registrazione raccogliamo nome, cognome, indirizzo email e password (memorizzata in forma hash). La base giuridica è l'esecuzione di un contratto (art. 6.1.b GDPR). I dati vengono conservati finché l'account è attivo; in caso di inattività superiore a 3 anni provvederemo alla cancellazione previo avviso all'interessato.</p>

<h3>2.2 Ordini e acquisti</h3>
<p>Per processare gli ordini trattiamo: dati anagrafici, indirizzo di spedizione, email e cronologia ordini. La base giuridica è l'esecuzione di un contratto (art. 6.1.b GDPR) e l'adempimento di obblighi legali (art. 6.1.c GDPR, obblighi fiscali ai sensi dell'art. 2220 c.c.). I dati degli ordini vengono conservati per 10 anni.</p>

<h3>2.3 Pagamenti: Stripe Inc.</h3>
<p>I pagamenti vengono elaborati da <strong>Stripe Inc.</strong> (USA). Yocigaci Srl non memorizza mai i dati della carta di credito o debito. Stripe opera in qualità di responsabile del trattamento ai sensi dell'art. 28 GDPR. Il trasferimento di dati verso gli USA avviene sulla base delle Clausole Contrattuali Standard (SCC) approvate dalla Commissione Europea con Decisione 2021/914. Per l'informativa completa di Stripe si rinvia a <strong>stripe.com/it/privacy</strong>.</p>

<h3>2.4 Email transazionali: Brevo</h3>
<p>Le email di conferma ordine, spedizione e rimborso vengono inviate tramite <strong>Brevo SAS</strong> (Francia, UE), che opera come responsabile del trattamento. L'indirizzo email non viene utilizzato per finalità di marketing senza consenso esplicito.</p>

<h3>2.5 Dati di navigazione</h3>
<p>I server registrano automaticamente log tecnici (indirizzo IP, browser, pagine visitate) per finalità di sicurezza e diagnostica. Tali dati vengono conservati per un massimo di 30 giorni e non vengono incrociati con dati identificativi.</p>

<h2>3. Hosting</h2>
<p>Il sito è ospitato su server di <strong>Hetzner Online GmbH</strong> (Germania, UE). Tutti i dati personali sono trattati all'interno dell'Unione Europea.</p>

<h2>4. Cookie</h2>
<p>Il sito utilizza esclusivamente cookie tecnici necessari al funzionamento del servizio. Non vengono utilizzati cookie di profilazione o analytics. Per maggiori dettagli si rinvia all'<a href="/p/cookie">Informativa sui Cookie</a>.</p>

<h2>5. Comunicazione a terzi</h2>
<p>I dati personali non vengono ceduti a terzi per finalità commerciali. Vengono comunicati ai seguenti soggetti nella misura strettamente necessaria:</p>
<ul>
  <li>Corrieri e vettori per la gestione delle spedizioni</li>
  <li>Stripe Inc. per l'elaborazione dei pagamenti</li>
  <li>Brevo SAS per l'invio di email transazionali</li>
  <li>Hetzner Online GmbH quale hosting provider</li>
  <li>Autorità pubbliche e organi giudiziari, ove richiesto dalla normativa vigente</li>
</ul>

<h2>6. Diritti dell'interessato</h2>
<p>Ai sensi degli artt. 15–22 GDPR, l'interessato ha il diritto di:</p>
<ul>
  <li>accedere ai propri dati personali (art. 15)</li>
  <li>ottenere la rettifica di dati inesatti (art. 16)</li>
  <li>ottenere la cancellazione ("diritto all'oblio") (art. 17)</li>
  <li>richiedere la limitazione del trattamento (art. 18)</li>
  <li>opporsi al trattamento (art. 21)</li>
  <li>richiedere la portabilità dei dati (art. 20)</li>
  <li>revocare il consenso in qualsiasi momento, senza pregiudicare la liceità del trattamento anteriore alla revoca</li>
  <li>proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it)</li>
</ul>
<p>Per esercitare i propri diritti scrivere a: <strong>[DA COMPILARE]</strong></p>
HTML,
            ],

            [
                'slug'    => 'termini-e-condizioni',
                'title'   => 'Termini e Condizioni del Servizio',
                'content' => <<<'HTML'
<p><em>Ultimo aggiornamento: 7 giugno 2026</em></p>

<p>I presenti Termini e Condizioni regolano l'utilizzo del sito <strong>yocigaci.com</strong> e la vendita di prodotti tramite esso, ai sensi del D.Lgs. 206/2005 (Codice del Consumo) e del D.Lgs. 70/2003 (commercio elettronico).</p>

<h2>1. Venditore</h2>
<p>
  <strong>Yocigaci Srl</strong><br>
  Codice Fiscale: 03118860356<br>
  P.IVA: <strong>[DA COMPILARE]</strong><br>
  Sede legale: <strong>[DA COMPILARE]</strong><br>
  Email: <strong>[DA COMPILARE]</strong><br>
  PEC: <strong>[DA COMPILARE]</strong>
</p>

<h2>2. Oggetto e accettazione</h2>
<p>Il sito Yocigaci offre la vendita al dettaglio di prodotti TCG (Trading Card Game) sigillati e accessori per i giochi: Pokémon, One Piece, Magic: The Gathering e Riftbound. L'utilizzo del sito e l'effettuazione di un ordine implicano l'accettazione integrale dei presenti Termini e Condizioni.</p>

<h2>3. Requisiti dell'acquirente</h2>
<p>Il sito è riservato a consumatori finali (B2C) di età pari o superiore a 18 anni. Effettuando un ordine l'utente dichiara di avere la capacità giuridica di stipulare contratti vincolanti.</p>

<h2>4. Prezzi e disponibilità</h2>
<p>Tutti i prezzi indicati sul sito sono espressi in Euro (<strong>IVA inclusa</strong>) e si riferiscono al singolo prodotto, escluse le spese di spedizione che vengono calcolate e mostrate durante il processo d'ordine.</p>
<p>Il mercato delle carte collezionabili è soggetto a fluttuazioni di prezzo significative e rapide. Yocigaci Srl si riserva il diritto di modificare i prezzi in qualsiasi momento senza preavviso. Il prezzo vincolante è quello indicato al momento della conferma dell'ordine.</p>
<p>La disponibilità dei prodotti è aggiornata in tempo reale; tuttavia, in caso di esaurimento delle scorte successivo alla conferma dell'ordine, Yocigaci Srl si impegna a contattare il cliente entro 2 giorni lavorativi per proporre un'alternativa o procedere al rimborso integrale.</p>

<h2>5. Processo d'ordine e conclusione del contratto</h2>
<p>Il contratto di vendita si perfeziona nel momento in cui Yocigaci Srl invia la conferma d'ordine via email. L'inserimento del prodotto nel carrello e la trasmissione dell'ordine costituiscono una proposta d'acquisto irrevocabile da parte del cliente; Yocigaci Srl si riserva la facoltà di non accettare l'ordine, ad esempio in caso di errori di prezzo o indisponibilità del prodotto.</p>

<h2>6. Pagamento</h2>
<p>I pagamenti vengono elaborati in modo sicuro tramite <strong>Stripe</strong>. Sono accettate le principali carte di credito e debito (Visa, Mastercard, American Express) e altri metodi disponibili al momento del checkout. I dati della carta non vengono memorizzati da Yocigaci Srl.</p>

<h2>7. Spedizioni e consegna</h2>
<p>Per le informazioni complete su corrieri, tempi e costi di consegna si rinvia alla pagina <a href="/p/spedizioni">Informazioni sulle Spedizioni</a>.</p>

<h2>8. Diritto di recesso e resi</h2>
<p>Per le informazioni sul diritto di recesso si rinvia alla pagina <a href="/p/diritto-di-recesso">Diritto di Recesso</a>. Per la procedura di reso e rimborso si rinvia alla pagina <a href="/p/resi-e-rimborsi">Resi e Rimborsi</a>.</p>

<h2>9. Garanzia legale di conformità</h2>
<p>Yocigaci Srl garantisce che i prodotti venduti sono conformi alla descrizione e privi di difetti ai sensi degli artt. 128–135 D.Lgs. 206/2005. In caso di prodotto non conforme il cliente ha diritto a riparazione, sostituzione, riduzione del prezzo o risoluzione del contratto.</p>

<h2>10. Proprietà intellettuale</h2>
<p>Tutti i contenuti del sito (testi, immagini, loghi) sono di proprietà di Yocigaci Srl o dei rispettivi titolari. È vietata qualsiasi riproduzione o utilizzo non autorizzato. I marchi Pokémon, One Piece, Magic: The Gathering e Riftbound appartengono ai rispettivi titolari.</p>

<h2>11. Limitazione di responsabilità</h2>
<p>Yocigaci Srl non è responsabile per danni indiretti, perdite di profitto o interruzioni del servizio derivanti dall'utilizzo del sito, salvo i casi di dolo o colpa grave. La responsabilità massima di Yocigaci Srl è in ogni caso limitata al valore dell'ordine in oggetto.</p>

<h2>12. Risoluzione delle controversie</h2>
<p>Per qualsiasi controversia relativa a ordini effettuati su yocigaci.com è competente il giudice del luogo di residenza o domicilio del consumatore, ai sensi dell'art. 66-bis D.Lgs. 206/2005. In via alternativa, le controversie possono essere risolte tramite la piattaforma ODR della Commissione Europea all'indirizzo <strong>ec.europa.eu/consumers/odr</strong>.</p>
<p>Si applica la legge italiana.</p>
HTML,
            ],

            [
                'slug'    => 'resi-e-rimborsi',
                'title'   => 'Resi e Rimborsi',
                'content' => <<<'HTML'
<p><em>Ultimo aggiornamento: 7 giugno 2026</em></p>

<h2>1. Prodotti non rimborsabili: TCG aperti</h2>
<p>I prodotti TCG sigillati (booster box, display, buste, collezioni speciali) una volta aperti <strong>non possono essere restituiti né rimborsati</strong>. L'apertura del sigillo altera irreversibilmente il valore del prodotto e ne rende impossibile la rivendita. Questo limite si applica indipendentemente dal contenuto delle buste.</p>
<p>L'esclusione si fonda sull'art. 59, comma 1, lett. e del D.Lgs. 206/2005, che consente di escludere il diritto di recesso per beni che per loro natura non possono essere restituiti o rischiano di deteriorarsi rapidamente.</p>

<h2>2. Condizioni per accettare un reso</h2>
<p>Sono accettati resi esclusivamente per prodotti che rispettino tutte le seguenti condizioni:</p>
<ul>
  <li>Il prodotto è <strong>integro e sigillato</strong> nella confezione originale</li>
  <li>Il prodotto non è stato aperto, utilizzato o danneggiato dal cliente</li>
  <li>La richiesta di reso viene effettuata entro <strong>14 giorni dalla data di consegna</strong></li>
</ul>

<h2>3. Come avviare un reso</h2>
<p>Per avviare una richiesta di reso inviare una email a <strong>[DA COMPILARE]</strong> con:</p>
<ul>
  <li>Numero dell'ordine</li>
  <li>Descrizione del prodotto da restituire</li>
  <li>Motivo del reso</li>
  <li>Foto del prodotto (obbligatorie per resi per difetto o errore di spedizione)</li>
</ul>
<p>Risponderemo entro 2 giorni lavorativi con le istruzioni per la restituzione.</p>

<h2>4. Spese di spedizione del reso</h2>
<p>Le spese di spedizione per la restituzione del prodotto sono a carico del cliente, salvo il caso in cui il reso sia dovuto a un nostro errore (prodotto difettoso, prodotto errato rispetto all'ordine). In tal caso le spese di restituzione sono a carico di Yocigaci Srl.</p>

<h2>5. Rimborso</h2>
<p>Una volta ricevuto e verificato il prodotto restituito, procederemo al rimborso entro <strong>14 giorni</strong>. Il rimborso viene effettuato tramite lo stesso metodo di pagamento utilizzato per l'acquisto (es. stessa carta o conto PayPal/Stripe).</p>

<h2>6. Prodotto difettoso o errato</h2>
<p>Se hai ricevuto un prodotto con difetti di produzione o un prodotto diverso da quello ordinato:</p>
<ul>
  <li>Contattaci entro 7 giorni dalla consegna all'indirizzo <strong>[DA COMPILARE]</strong></li>
  <li>Allega foto chiare del prodotto e dell'imballo ricevuto</li>
  <li>Le spese di restituzione sono interamente a carico di Yocigaci Srl</li>
  <li>A scelta del cliente procederemo alla <strong>sostituzione</strong> con lo stesso prodotto (se disponibile) o al <strong>rimborso completo</strong></li>
</ul>
HTML,
            ],

            [
                'slug'    => 'diritto-di-recesso',
                'title'   => 'Diritto di Recesso',
                'content' => <<<'HTML'
<p><em>Ultimo aggiornamento: 7 giugno 2026</em></p>

<h2>1. Diritto di recesso</h2>
<p>Ai sensi dell'art. 52 del D.Lgs. 206/2005 (Codice del Consumo), il consumatore ha il diritto di recedere dal contratto di vendita entro <strong>14 giorni</strong> dalla data di ricezione del prodotto, senza necessità di fornire alcuna motivazione.</p>

<h2>2. Esclusioni: prodotti sigillati aperti</h2>
<p>Il diritto di recesso <strong>non si applica</strong> ai prodotti TCG sigillati (booster box, display, buste, collezioni speciali) che siano stati aperti dall'acquirente. Tale esclusione è prevista dall'art. 59, comma 1, lett. e del D.Lgs. 206/2005, che esclude il recesso per i <em>"beni che per loro natura non possono essere restituiti o rischiano di deteriorarsi o alterarsi rapidamente"</em>.</p>
<p>I prodotti TCG sigillati, una volta aperti, perdono irreversibilmente il loro valore commerciale e non possono essere rimessi in vendita.</p>

<h2>3. Come esercitare il recesso</h2>
<p>Per esercitare il diritto di recesso il consumatore deve comunicare la propria decisione prima della scadenza del termine di 14 giorni inviando:</p>
<ul>
  <li>Una email a <strong>[DA COMPILARE]</strong></li>
  <li>Oppure compilando e inviando il modulo standard di recesso riportato in fondo a questa pagina</li>
</ul>
<p>La comunicazione deve contenere il numero dell'ordine e l'indicazione dei prodotti per cui si intende esercitare il recesso.</p>

<h2>4. Restituzione del prodotto</h2>
<p>Dopo aver comunicato il recesso, il consumatore deve restituire i prodotti entro <strong>14 giorni</strong> al seguente indirizzo:</p>
<p><strong>[DA COMPILARE: indirizzo di restituzione]</strong></p>
<p>I prodotti devono essere restituiti integri, sigillati e nella confezione originale. Le spese di restituzione sono a carico del consumatore.</p>

<h2>5. Rimborso</h2>
<p>Yocigaci Srl rimborserà tutti i pagamenti ricevuti dal consumatore, incluse le eventuali spese di spedizione standard originali, entro <strong>14 giorni</strong> dalla ricezione del prodotto restituito. Il rimborso viene effettuato tramite lo stesso metodo di pagamento utilizzato per l'acquisto.</p>

<h2>6. Modulo di recesso standard</h2>
<p>In conformità all'Allegato I, Parte B del D.Lgs. 206/2005, si mette a disposizione il seguente modulo standard:</p>
<p><em>(Compilare e restituire il presente modulo solo se si desidera recedere dal contratto)</em></p>
<p>
  Destinatario: <strong>Yocigaci Srl</strong>, <strong>[DA COMPILARE: indirizzo]</strong>, <strong>[DA COMPILARE: email]</strong><br><br>
  Con la presente io/noi (*) notifichiamo il recesso dal contratto di vendita dei seguenti beni/servizi (*):<br><br>
  Ordinati il .............. / ricevuti il ..............<br><br>
  Nome del/dei consumatore/i: ..............<br><br>
  Indirizzo del/dei consumatore/i: ..............<br><br>
  Firma del/dei consumatore/i (solo se il presente modulo è notificato in versione cartacea): ..............<br><br>
  Data: ..............
</p>
<p><em>(*) Cancellare la dicitura inutile.</em></p>
HTML,
            ],

            [
                'slug'    => 'spedizioni',
                'title'   => 'Informazioni sulle Spedizioni',
                'content' => <<<'HTML'
<p><em>Ultimo aggiornamento: 7 giugno 2026</em></p>

<h2>1. Zone di spedizione</h2>
<p>Al momento Yocigaci spedisce esclusivamente in <strong>Italia</strong> (penisola, Sardegna e Sicilia). Le spedizioni verso isole minori e zone remote potrebbero richiedere tempi aggiuntivi.</p>

<h2>2. Corrieri</h2>
<p>Le spedizioni vengono affidate a corrieri nazionali selezionati. Il corriere utilizzato per ogni spedizione viene comunicato nella email di conferma spedizione insieme al codice di tracking.</p>

<h2>3. Tempi di preparazione</h2>
<p>Gli ordini vengono preparati e consegnati al corriere entro <strong>1–2 giorni lavorativi</strong> dalla conferma del pagamento. I giorni festivi e i weekend non sono considerati giorni lavorativi.</p>
<p>In periodi di alta domanda (uscite di nuovi set, pre-ordini, festività) i tempi di preparazione potrebbero allungarsi; in tal caso verrà fornita comunicazione preventiva sul sito.</p>

<h2>4. Costi e tempi di consegna</h2>
<p>Il costo di spedizione viene calcolato automaticamente in base all'ordine e mostrato prima della conferma dell'acquisto. <strong>La spedizione è gratuita</strong> per ordini che superano la soglia indicata durante il checkout.</p>
<p>I tempi di consegna stimati dal corriere sono indicati durante il processo d'ordine e dipendono dalla destinazione.</p>

<h2>5. Imballaggio</h2>
<p>I prodotti vengono spediti con imballo protettivo adeguato per preservare l'integrità delle confezioni sigillate durante il trasporto.</p>

<h2>6. Pacco non ricevuto o danneggiato</h2>
<p>Se il pacco non arriva entro i tempi stimati o viene consegnato visibilmente danneggiato:</p>
<ul>
  <li>Contattaci entro <strong>7 giorni</strong> dalla data di consegna prevista (o dalla consegna del pacco danneggiato) scrivendo a <strong>[DA COMPILARE]</strong></li>
  <li>In caso di pacco danneggiato, <strong>non rifiutare la consegna</strong> ma accetta con riserva scritta al corriere e fotografa immediatamente l'imballo e il contenuto</li>
  <li>Allega le foto alla email di segnalazione</li>
</ul>
<p>Apriremo una pratica con il corriere e ti aggiorneremo entro 2 giorni lavorativi sulla procedura da seguire.</p>

<h2>7. Responsabilità durante il trasporto</h2>
<p>Il rischio di perdita o danneggiamento dei prodotti si trasferisce al consumatore nel momento in cui il bene entra nel possesso fisico del destinatario o di un terzo designato dal consumatore, ai sensi dell'art. 63 D.Lgs. 206/2005.</p>
HTML,
            ],

            [
                'slug'    => 'recapiti',
                'title'   => 'Recapiti',
                'content' => <<<'HTML'
<h2>Yocigaci Srl</h2>
<p>
  Codice Fiscale: 03118860356<br>
  P.IVA: <strong>[DA COMPILARE]</strong><br>
  Sede legale: <strong>[DA COMPILARE]</strong><br>
  REA: <strong>[DA COMPILARE]</strong><br>
  PEC: <strong>[DA COMPILARE]</strong>
</p>

<h2>Assistenza clienti</h2>
<p>Per domande su ordini, prodotti, spedizioni o resi puoi contattarci tramite:</p>
<ul>
  <li><strong>Email:</strong> <strong>[DA COMPILARE]</strong></li>
  <li><strong>WhatsApp:</strong> <strong>[DA COMPILARE]</strong></li>
</ul>
<p>Rispondiamo entro <strong>24 ore</strong> nei giorni lavorativi.</p>

<h2>Segnalazioni e reclami</h2>
<p>Per reclami formali o per esercitare i diritti previsti dal Codice del Consumo (reso, recesso, garanzia) scrivere a <strong>[DA COMPILARE]</strong> indicando il numero dell'ordine e la natura del problema.</p>

<h2>Risoluzione alternativa delle controversie (ODR)</h2>
<p>In caso di controversia non risolta in via amichevole, il consumatore può ricorrere alla piattaforma europea per la risoluzione online delle controversie all'indirizzo <strong>ec.europa.eu/consumers/odr</strong>.</p>
HTML,
            ],

            [
                'slug'    => 'cookie',
                'title'   => 'Informativa sui Cookie',
                'content' => <<<'HTML'
<p><em>Ultimo aggiornamento: 7 giugno 2026</em></p>

<p>La presente informativa descrive l'utilizzo dei cookie su <strong>yocigaci.com</strong>, in conformità al Provvedimento del Garante per la protezione dei dati personali del 10 giugno 2021 e al D.Lgs. 196/2003.</p>

<h2>1. Cosa sono i cookie</h2>
<p>I cookie sono piccoli file di testo che i siti web salvano sul dispositivo dell'utente. Vengono utilizzati per far funzionare il sito correttamente, ricordare le preferenze dell'utente e, nel caso di cookie di terze parti, raccogliere informazioni statistiche o di profilazione.</p>

<h2>2. Cookie utilizzati da questo sito</h2>
<p>Yocigaci utilizza <strong>esclusivamente cookie tecnici</strong>, necessari al funzionamento del servizio. Non vengono utilizzati cookie di profilazione, cookie analytics o altri cookie non essenziali.</p>

<h3>Cookie tecnici di sessione e autenticazione</h3>
<p>Questi cookie sono indispensabili per:</p>
<ul>
  <li>Mantenere la sessione dell'utente autenticato</li>
  <li>Conservare il contenuto del carrello durante la navigazione</li>
  <li>Garantire la sicurezza delle richieste (protezione CSRF)</li>
</ul>
<p>Questi cookie vengono eliminati al termine della sessione di navigazione o entro pochi giorni.</p>

<h3>Cookie tecnici di Stripe</h3>
<p>Quando l'utente accede alla pagina di pagamento, <strong>Stripe</strong> può impostare cookie tecnici necessari per il corretto funzionamento del modulo di pagamento e per la prevenzione delle frodi. Questi cookie non vengono utilizzati per finalità di profilazione pubblicitaria. Per maggiori informazioni si rinvia alla <strong>Cookie Policy di Stripe</strong> su stripe.com.</p>

<h2>3. Cookie di profilazione e analytics</h2>
<p>Questo sito <strong>non utilizza</strong> cookie di profilazione, Google Analytics, Meta Pixel o altri strumenti di tracciamento comportamentale.</p>

<h2>4. Consenso</h2>
<p>I cookie tecnici non richiedono il consenso dell'utente ai sensi del Provvedimento Garante del 10 giugno 2021. Non è pertanto visualizzato un banner di consenso ai cookie.</p>

<h2>5. Come disabilitare i cookie</h2>
<p>L'utente può configurare il proprio browser per rifiutare tutti i cookie o per ricevere una notifica prima che un cookie venga salvato. Si avverte che la disabilitazione dei cookie tecnici potrebbe compromettere il corretto funzionamento del sito (es. impossibilità di effettuare acquisti o mantenere la sessione).</p>
<p>Istruzioni per i principali browser:</p>
<ul>
  <li><strong>Chrome:</strong> Impostazioni → Privacy e sicurezza → Cookie e altri dati dei siti</li>
  <li><strong>Firefox:</strong> Impostazioni → Privacy e sicurezza → Cookie e dati dei siti</li>
  <li><strong>Safari:</strong> Preferenze → Privacy → Gestisci dati sito web</li>
  <li><strong>Edge:</strong> Impostazioni → Cookie e autorizzazioni sito</li>
</ul>

<h2>6. Aggiornamenti</h2>
<p>La presente informativa potrà essere aggiornata in caso di modifica dei servizi o della normativa applicabile. La data dell'ultimo aggiornamento è indicata in cima alla pagina.</p>
HTML,
            ],
        ];

        foreach ($pages as $page) {
            Page::updateOrCreate(
                ['slug' => $page['slug']],
                ['title' => $page['title'], 'content' => $page['content']]
            );
        }
    }
}
