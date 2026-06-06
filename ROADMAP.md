# Roadmap - Feature mancanti

## Critico

- [x] **Password reset via email** — link "Hai dimenticato la password?" nel login, flusso token → nuova password
- [ ] **Email verification alla registrazione** — conferma email prima di poter accedere
- [ ] **Codici sconto / coupon** — percentuale o importo fisso, con limite di utilizzo e scadenza
- [ ] **Tracking ordine per ospiti** — link firmato nell'email di conferma per vedere lo stato senza account

## Importante

- [ ] **Dashboard vendite admin** — fatturato per periodo, ordini per stato, prodotti piu venduti
- [ ] **Avvisi stock basso** — soglia configurabile nelle impostazioni, notifica email all'admin
- [ ] **Cancellazione ordine da parte dell'utente** — solo per ordini in stato `pending` o `paid` non ancora processati
- [ ] **SEO base** — meta description e og:title/og:image per prodotti e pagine statiche

## Legale (obbligatorio per negozio italiano)

- [ ] **Cookie consent banner** — GDPR + Garante Privacy, con accettazione granulare
- [ ] **IVA e fattura** — gestione IVA sugli ordini, generazione ricevuta/fattura PDF scaricabile
- [ ] **Checkbox T&C al checkout** — accettazione esplicita termini e condizioni prima del pagamento

## Utile

- [ ] **Wishlist** — salvataggio prodotti per acquisto futuro, persiste per utenti autenticati
- [ ] **Prodotti visti di recente** — ultime N schede prodotto visitate, in localStorage
- [ ] **Autocomplete ricerca** — suggerimenti prodotti mentre si digita
- [ ] **Export ordini CSV** — per contabilita admin
- [ ] **Sitemap XML** — generazione automatica per indicizzazione Google
