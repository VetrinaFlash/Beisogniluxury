"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type R = { id: string; name: string; description: string; capacity: number; amenities: string[]; photos: string[]; available: boolean; min_nights: number; total_cents: number; nights: number };
const eur = (c: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(c / 100);
const today = () => new Date().toISOString().slice(0, 10);

export default function Booking() {
  const sp = useSearchParams();
  const [ci, setCi] = useState(sp.get("checkIn") ?? "");
  const [co, setCo] = useState(sp.get("checkOut") ?? "");
  const [guests, setGuests] = useState(sp.get("guests") ?? "2");
  const [rooms, setRooms] = useState<R[] | null>(null);
  const [sel, setSel] = useState<R | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: string } | null>(null);

  async function search(e?: React.FormEvent) {
    e?.preventDefault(); setErr(""); setSel(null); setBusy(true);
    const r = await fetch(`/api/availability?checkIn=${ci}&checkOut=${co}&guests=${guests}`);
    const j: any = await r.json(); setBusy(false);
    if (!r.ok) { setErr(j.error ?? "Errore"); setRooms(null); } else setRooms(j.rooms);
  }
  useEffect(() => { if (ci && co) search(); /* eslint-disable-next-line */ }, []);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!sel) return; setErr(""); setBusy(true);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, roomId: sel.id, checkIn: ci, checkOut: co, guests: Number(guests) }) });
    const j: any = await r.json(); setBusy(false);
    if (!r.ok) { setErr(j.error ?? "Errore"); if (r.status === 409) search(); } else setDone({ id: j.id });
  }

  if (done) return (
    <div className="panel"><div className="msg ok"><b>Richiesta inviata.</b> Codice <b>{done.id}</b>. Ti confermeremo la prenotazione a breve via email o WhatsApp. Il saldo si effettua in struttura.</div></div>
  );

  return (
    <>
      <form className="panel searchbar" style={{ background: "#fff", boxShadow: "none", maxWidth: "none" }} onSubmit={search}>
        <div><label htmlFor="a">Arrivo</label><input id="a" type="date" min={today()} value={ci} onChange={(e) => setCi(e.target.value)} required /></div>
        <div><label htmlFor="b">Partenza</label><input id="b" type="date" min={ci || today()} value={co} onChange={(e) => setCo(e.target.value)} required /></div>
        <div><label htmlFor="c">Ospiti</label><select id="c" value={guests} onChange={(e) => setGuests(e.target.value)}>{[1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}</select></div>
        <button className="btn" disabled={busy}>{busy ? "..." : "Cerca"}</button>
      </form>
      {err && <div className="msg err" style={{ marginTop: "1rem" }}>{err}</div>}
      {rooms && rooms.length === 0 && <div className="msg err" style={{ marginTop: "1rem" }}>Nessuna camera adatta al numero di ospiti. Scrivici su WhatsApp.</div>}
      {rooms && (
        <div className="res">
          {rooms.map((r) => (
            <div key={r.id} className={`row ${r.available ? "" : "off"}`}>
              <div className="ph">{r.photos[0] ? <img src={r.photos[0]} alt={r.name} /> : <span>{r.name.split(" ")[0]}</span>}</div>
              <div><h3 style={{ fontSize: "1.5rem" }}>{r.name}</h3><p style={{ color: "var(--muted)", fontSize: ".9rem" }}>{r.available ? `${r.nights} ${r.nights === 1 ? "notte" : "notti"} · max ${r.capacity} ospiti` : r.nights < r.min_nights ? `Soggiorno minimo ${r.min_nights} notti` : "Non disponibile nelle date scelte"}</p></div>
              {r.available && <div className="act" style={{ textAlign: "right" }}><div style={{ fontFamily: "var(--serif)", fontSize: "1.6rem" }}>{eur(r.total_cents)}</div><button className="btn sm" onClick={() => setSel(r)}>Scegli</button></div>}
            </div>
          ))}
        </div>
      )}
      {sel && (
        <form className="panel" style={{ marginTop: "1.5rem" }} onSubmit={send}>
          <h3 style={{ fontSize: "1.6rem" }}>I tuoi dati · {sel.name}</h3>
          <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>Nessun pagamento online: ti confermiamo noi la disponibilità.</p>
          <div className="form">
            <div className="field"><label>Nome e cognome</label><input name="name" required maxLength={100} autoComplete="name" /></div>
            <div className="field"><label>Telefono</label><input name="phone" type="tel" required autoComplete="tel" /></div>
            <div className="field full"><label>Email</label><input name="email" type="email" required autoComplete="email" /></div>
            <div className="field full"><label>Note (orario di arrivo, richieste)</label><textarea name="notes" rows={3} maxLength={1000} /></div>
            <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden />
            <div className="full"><button className="btn" disabled={busy}>{busy ? "Invio..." : `Invia richiesta · ${eur(sel.total_cents)}`}</button></div>
            <p className="full" style={{ fontSize: ".78rem", color: "var(--muted)" }}>Inviando accetti l'<a href="/privacy" style={{ textDecoration: "underline" }}>informativa privacy</a>.</p>
          </div>
        </form>
      )}
    </>
  );
}
