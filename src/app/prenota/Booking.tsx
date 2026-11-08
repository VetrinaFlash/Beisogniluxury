"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type R = { id: string; name: string; description: string; capacity: number; amenities: string[]; photos: string[]; available: boolean; min_nights: number; total_cents: number; nights: number };
const eur = (c: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(c / 100);
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (s: string, n: number) => iso(new Date(Date.parse(s + "T00:00:00Z") + n * 86400000));
const fmt = (s: string) => new Date(s + "T12:00:00Z").toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "long" });

export default function Booking() {
  const sp = useSearchParams();
  const today = iso(new Date());
  const [ci, setCi] = useState(sp.get("checkIn") ?? "");
  const [co, setCo] = useState(sp.get("checkOut") ?? "");
  const [guests, setGuests] = useState(sp.get("guests") ?? "2");
  const [rooms, setRooms] = useState<R[] | null>(null);
  const [sel, setSel] = useState<R | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: string; total: number } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const prefer = sp.get("room");

  async function search(e?: React.FormEvent) {
    e?.preventDefault(); setErr(""); setSel(null);
    if (!ci || !co) { setErr("Scegli le date di arrivo e partenza"); return; }
    if (co <= ci) { setErr("La partenza deve essere dopo l'arrivo"); return; }
    setBusy(true); setRooms(null);
    try {
      const r = await fetch(`/api/availability?checkIn=${ci}&checkOut=${co}&guests=${guests}`);
      const j: any = await r.json();
      if (!r.ok) { setErr(j.error ?? "Errore"); return; }
      const list: R[] = j.rooms;
      if (prefer) list.sort((a, b) => (a.id === prefer ? -1 : b.id === prefer ? 1 : 0));
      setRooms(list);
    } catch { setErr("Connessione non riuscita, riprova"); } finally { setBusy(false); }
  }
  useEffect(() => { if (ci && co) search(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { if (sel) setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60); }, [sel]);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!sel) return; setErr(""); setBusy(true);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, roomId: sel.id, checkIn: ci, checkOut: co, guests: Number(guests) }) });
      const j: any = await r.json();
      if (!r.ok) { setErr(j.error ?? "Errore"); if (r.status === 409) search(); }
      else { setDone({ id: j.id, total: j.total_cents }); window.scrollTo({ top: 0, behavior: "smooth" }); }
    } catch { setErr("Connessione non riuscita, riprova"); } finally { setBusy(false); }
  }

  if (done) return (
    <div className="panel done">
      <div className="tick">✓</div>
      <h2>Richiesta <em>inviata</em></h2>
      <p className="lead" style={{ margin: "0 auto 1.4rem" }}>Ti confermeremo la prenotazione a breve via email o WhatsApp. Il saldo di {eur(done.total)} si effettua in struttura.</p>
      <p style={{ fontSize: ".9rem", color: "var(--muted)" }}>Codice richiesta <b style={{ color: "var(--ink)", letterSpacing: ".1em" }}>{done.id}</b></p>
      <a className="btn ghost" href="/" style={{ marginTop: "1.6rem" }}>Torna al sito</a>
    </div>
  );

  return (
    <>
      <form className="panel search" onSubmit={search}>
        <div className="field"><label htmlFor="a">Arrivo</label><input id="a" type="date" min={today} value={ci} onChange={(e) => { setCi(e.target.value); if (co && co <= e.target.value) setCo(addDays(e.target.value, 1)); }} required /></div>
        <div className="field"><label htmlFor="b">Partenza</label><input id="b" type="date" min={ci ? addDays(ci, 1) : addDays(today, 1)} value={co} onChange={(e) => setCo(e.target.value)} required /></div>
        <div className="field"><label htmlFor="c">Ospiti</label><select id="c" value={guests} onChange={(e) => setGuests(e.target.value)}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
        <button className="btn" disabled={busy}>{busy && !rooms ? "Cerco…" : "Cerca"}</button>
      </form>
      {err && <div className="msg err" style={{ marginTop: "1rem" }} role="alert">{err}</div>}
      {busy && !rooms && <div className="res"><div className="skel" /><div className="skel" /></div>}
      {rooms && rooms.length === 0 && <div className="msg err" style={{ marginTop: "1rem" }}>Nessuna camera adatta al numero di ospiti. Scrivici su WhatsApp, troviamo una soluzione.</div>}
      {rooms && rooms.length > 0 && (
        <>
          <p style={{ marginTop: "1.6rem", color: "var(--muted)", fontSize: ".9rem" }}>{fmt(ci)} → {fmt(co)} · {rooms[0].nights} {rooms[0].nights === 1 ? "notte" : "notti"} · {guests} {guests === "1" ? "ospite" : "ospiti"}</p>
          <div className="res" style={{ marginTop: ".8rem" }}>
            {rooms.map((r) => (
              <div key={r.id} className={`rrow ${r.available ? "" : "off"} ${sel?.id === r.id ? "sel" : ""}`}>
                <div className="thumb">{r.photos[0] ? <img src={r.photos[0]} alt={r.name} /> : "BS"}</div>
                <div><h3>{r.name}</h3><p className="sub">{r.available ? `Fino a ${r.capacity} ospiti · ${r.amenities.slice(0, 2).join(" · ")}` : r.nights < r.min_nights ? `Soggiorno minimo ${r.min_nights} notti per queste date` : "Non disponibile nelle date scelte"}</p></div>
                {r.available && <div className="act"><div className="tot">{eur(r.total_cents)}<small>{eur(Math.round(r.total_cents / r.nights))} / notte</small></div><button className={`btn sm ${sel?.id === r.id ? "dark" : ""}`} onClick={() => setSel(r)}>{sel?.id === r.id ? "Selezionata" : "Scegli"}</button></div>}
              </div>
            ))}
          </div>
        </>
      )}
      {sel && (
        <form ref={formRef} className="panel" style={{ marginTop: "1.6rem", scrollMarginTop: 90 }} onSubmit={send}>
          <span className="eyebrow">I tuoi dati</span>
          <h3 style={{ fontSize: "2rem", marginTop: ".6rem" }}>{sel.name}</h3>
          <div className="summary"><span>{fmt(ci)} → {fmt(co)}<br />{sel.nights} {sel.nights === 1 ? "notte" : "notti"} · {guests} ospiti</span><b>{eur(sel.total_cents)}</b></div>
          <div className="form">
            <div className="field"><label htmlFor="n">Nome e cognome</label><input id="n" name="name" required maxLength={100} autoComplete="name" /></div>
            <div className="field"><label htmlFor="p">Telefono / WhatsApp</label><input id="p" name="phone" type="tel" required autoComplete="tel" placeholder="+39 …" /></div>
            <div className="field full"><label htmlFor="m">Email</label><input id="m" name="email" type="email" required autoComplete="email" /></div>
            <div className="field full"><label htmlFor="t">Note (orario di arrivo, richieste)</label><textarea id="t" name="notes" rows={3} maxLength={1000} /></div>
            <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden />
            <div className="full"><button className="btn block" disabled={busy}>{busy ? "Invio…" : "Invia richiesta di prenotazione"} <span className="arr">→</span></button></div>
            <p className="full" style={{ fontSize: ".78rem", color: "var(--muted)", textAlign: "center" }}>Nessun pagamento online: confermiamo noi la disponibilità e saldi in struttura. Inviando accetti l&apos;<a href="/privacy" className="link">informativa privacy</a>.</p>
          </div>
        </form>
      )}
    </>
  );
}
