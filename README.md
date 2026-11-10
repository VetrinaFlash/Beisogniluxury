# Venus Inn B&B Positano – sito + prenotazioni dirette

Next.js su Cloudflare **Worker** (OpenNext), D1 (`venus-inn-db`), R2 (`venus-inn-photos`), Web Push (PWA admin).
Sito in italiano (`/`) e inglese (`/en`). Prenotazione = richiesta dal sito, conferma manuale da `/admin`. Nessun pagamento online.

Dati del cliente in `src/lib/brand.ts`, testi in `src/lib/i18n.ts`.

## Deploy
Cloudflare → Workers → Import repository, branch `main` (o `beisogniluxury`).
Build: `npx opennextjs-cloudflare build` · Deploy: `npx wrangler deploy`.
Database, bucket, tabelle, camere, prezzi stagionali e chiavi push vengono creati da soli.

## Primo accesso
`/admin` → scegli la password (min. 10 caratteri). Poi Sito → "Copia foto e video" per portare le immagini dal vecchio sito su R2.

## Email (opzionale)
Secret `RESEND_API_KEY` e `EMAIL_FROM` in `wrangler.jsonc`.
