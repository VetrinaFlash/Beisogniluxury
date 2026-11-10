import { eur } from "./dates";
import { POLICY } from "./i18n";
import { BRAND, fullAddress } from "./brand";

export const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const fmt = (s: string, en: boolean) => new Date(s + "T12:00:00Z").toLocaleDateString(en ? "en-GB" : "it-IT", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

function shell(body: string) {
  return `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;padding:28px;background:#f7f3ec;color:#13283a">
  <div style="font-size:26px;letter-spacing:.04em">${BRAND.name}<span style="display:block;font:600 10px Arial,sans-serif;letter-spacing:.3em;color:#2c6d9b;margin-top:4px">B&amp;B · POSITANO</span></div>
  <div style="font:15px/1.6 Arial,sans-serif;margin-top:22px">${body}</div>
  <p style="font:12px/1.6 Arial,sans-serif;color:#6b7781;margin-top:28px;border-top:1px solid #e3dccf;padding-top:14px">${BRAND.fullName} · ${fullAddress}<br>${BRAND.phone} · ${BRAND.email} · CIN ${BRAND.cin}</p></div>`;
}

type Bk = { id: string; guest_name: string; room_name: string; check_in: string; check_out: string; total_cents: number; guests: number; lang?: string };

export function guestEmail(kind: "received" | "confirmed" | "rejected", b: Bk) {
  const en = b.lang === "en";
  const name = esc(b.guest_name);
  const stay = `<b>${esc(b.room_name)}</b><br>${fmt(b.check_in, en)} → ${fmt(b.check_out, en)}<br>${b.guests} ${en ? "guests" : "ospiti"} · ${eur(b.total_cents)} (${en ? "breakfast included" : "colazione inclusa"})`;
  const box = `<p style="background:#fff;border-radius:10px;padding:14px 16px">${stay}</p>`;
  const wa = `https://wa.me/${BRAND.whatsapp}`;
  if (kind === "received") return {
    subject: en ? `Booking request received ${b.id} – ${BRAND.fullName}` : `Richiesta ricevuta ${b.id} – ${BRAND.fullName}`,
    html: shell(`<p>${en ? `Dear ${name}, thank you! We have received your request:` : `Gentile ${name}, grazie! Abbiamo ricevuto la tua richiesta:`}</p>${box}<p>${en ? "We will confirm availability shortly. Request code" : "Ti confermeremo la disponibilità a breve. Codice richiesta"}: <b>${b.id}</b></p><p style="font-size:13px;color:#6b7781">${en ? POLICY.en : POLICY.it}</p>`),
  };
  if (kind === "confirmed") return {
    subject: en ? `Booking confirmed ${b.id} – ${BRAND.fullName}` : `Prenotazione confermata ${b.id} – ${BRAND.fullName}`,
    html: shell(`<p>${en ? `Dear ${name}, your booking is <b>confirmed</b>!` : `Gentile ${name}, la tua prenotazione è <b>confermata</b>!`}</p>${box}<p>${en ? `Self check-in from ${BRAND.checkIn}, check-out by ${BRAND.checkOut}. Arriving by ferry? Get off at Piazza dei Mulini. For anything, message us on <a href="${wa}">WhatsApp</a>.` : `Self check-in dalle ${BRAND.checkIn}, check-out entro le ${BRAND.checkOut}. Arrivi in traghetto? Scendi a Piazza dei Mulini. Per qualsiasi cosa scrivici su <a href="${wa}">WhatsApp</a>.`}</p><p style="font-size:13px;color:#6b7781">${en ? POLICY.en : POLICY.it}</p>`),
  };
  return {
    subject: en ? `Request ${b.id} – dates not available` : `Richiesta ${b.id} – date non disponibili`,
    html: shell(`<p>${en ? `Dear ${name}, unfortunately we can't confirm the requested dates.` : `Gentile ${name}, purtroppo non riusciamo a confermare le date richieste.`}</p>${box}<p>${en ? `Message us on <a href="${wa}">WhatsApp</a> and we'll look for an alternative together.` : `Scrivici su <a href="${wa}">WhatsApp</a>: cerchiamo insieme un'alternativa.`}</p>`),
  };
}

export function ownerEmail(b: Bk & { guest_email: string; guest_phone: string; notes: string }) {
  return {
    subject: `Nuova richiesta ${b.id} – ${b.guest_name}`,
    html: shell(`<p>Nuova richiesta di prenotazione${b.lang === "en" ? " (ospite in inglese)" : ""}:</p><p style="background:#fff;border-radius:10px;padding:14px 16px"><b>${esc(b.guest_name)}</b><br>${esc(b.guest_email)} · ${esc(b.guest_phone)}<br><br><b>${esc(b.room_name)}</b><br>${fmt(b.check_in, false)} → ${fmt(b.check_out, false)} · ${b.guests} ospiti · ${eur(b.total_cents)}${b.notes ? `<br><br>“${esc(b.notes)}”` : ""}</p><p>Confermala dal pannello: /admin</p>`),
  };
}
