# Bei Sogni Luxury – sito + prenotazioni dirette

Next.js su Cloudflare **Worker** (OpenNext), D1 (dati), R2 (foto), Web Push (PWA admin).
Prenotazione = richiesta dal sito, conferma manuale da `/admin`. Nessun pagamento online.

## Deploy (Cloudflare → Workers & Pages → Import a repository)
- Branch: `beisogniluxury`
- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx wrangler deploy`

D1 (`bei-sogni-db`) e R2 (`bei-sogni-photos`) vengono creati in automatico al primo deploy.
Tabelle, camere iniziali e chiavi (JWT, VAPID push) vengono generate dall'app al primo avvio: nessun secret da inserire a mano.

## Primo accesso
Apri `/admin` subito dopo il deploy: la prima volta chiede di scegliere la password admin (min. 10 caratteri).
Poi Notifiche → Attiva. Su iPhone: Condividi → Aggiungi a Home prima di attivare.

## Email (opzionale)
Aggiungi il secret `RESEND_API_KEY` e aggiorna `EMAIL_FROM` in `wrangler.jsonc`. Senza chiave le email vengono saltate, le push funzionano comunque.

## Dominio
Quando c'è il dominio aggiorna `SITE_URL` in `wrangler.jsonc`.

## Da completare
Testi e prezzi delle camere (segnaposto nel seed, modificabili da admin), foto reali, testo privacy da validare, versione inglese.
