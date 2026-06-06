# Roadmap - Feature mancanti

## Critico

- [x] **Password reset via email** — link "Hai dimenticato la password?" nel login, flusso token → nuova password
- [ ] **Codici sconto / coupon** — percentuale o importo fisso, con limite di utilizzo e scadenza

## Importante

- [ ] **Dashboard vendite admin** — fatturato per periodo, ordini per stato, prodotti piu venduti
- [ ] **SEO base** — meta description e og:title/og:image per prodotti e pagine statiche

## Legale (obbligatorio per negozio italiano)

- [x] **Cookie Policy** — pagina `/p/cookie` gia presente nel seeder e linkata nel footer
- [ ] **IVA e fattura** — gestione IVA sugli ordini, generazione ricevuta/fattura PDF scaricabile
- [x] **Checkbox T&C al checkout** — accettazione esplicita termini e condizioni prima del pagamento

## Utile

- [ ] **Wishlist** — salvataggio prodotti per acquisto futuro, persiste per utenti autenticati
- [ ] **Prodotti visti di recente** — ultime N schede prodotto visitate, in localStorage
- [x] **Autocomplete ricerca** — suggerimenti prodotti mentre si digita
- [ ] **Export ordini CSV** — per contabilita admin
- [x] **Sitemap XML** — generazione automatica per indicizzazione Google
