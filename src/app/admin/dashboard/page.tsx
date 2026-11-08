"use client";
import { useCallback, useEffect, useState } from "react";

type B = { id: string; room_id: string; room_name: string; check_in: string; check_out: string; guests: number; guest_name: string; guest_email: string; guest_phone: string; notes: string; total_cents: number; status: string; created_at: string };
type Rm = { id: string; name: string; description: string; base_price_cents: number; min_nights: number; photos: string; active: number };
type Bl = { id: number; room_id: string; from_date: string; to_date: string; reason: string };
const eur = (c: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(c / 100);
const LBL: Record<string, string> = { pending: "Da confermare", confirmed: "Confermata", rejected: "Rifiutata", cancelled: "Annullata" };

export default function Dashboard() {
  const [tab, setTab] = useState<"req" | "cal" | "rooms" | "push">("req");
  const [bk, setBk] = useState<B[]>([]);
  const [rooms, setRooms] = useState<Rm[]>([]);
  const [blocks, setBlocks] = useState<Bl[]>([]);
  const [msg, setMsg] = useState("");
  const [pushOn, setPushOn] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/bookings");
    if (r.status === 401) { location.href = "/admin"; return; }
    const j: any = await r.json(); setBk(j.bookings); setBlocks(j.blocks);
    const rr: any = await (await fetch("/api/admin/rooms")).json(); setRooms(rr.rooms);
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);
  useEffect(() => { if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").then(async (reg) => setPushOn(!!(await reg.pushManager.getSubscription()))).catch(() => {}); }, []);

  async function setStatus(id: string, status: string) {
    const r = await fetch("/api/admin/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    const j: any = await r.json(); setMsg(r.ok ? "" : j.error); load();
  }
  async function enablePush() {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setMsg("Permesso notifiche negato"); return; }
      const reg = await navigator.serviceWorker.ready;
      const { publicKey } = (await (await fetch("/api/admin/push")).json()) as { publicKey: string };
      const pad = "=".repeat((4 - (publicKey.length % 4)) % 4);
      const raw = atob((publicKey + pad).replace(/-/g, "+").replace(/_/g, "/"));
      const key = Uint8Array.from(raw, (c) => c.charCodeAt(0));
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }));
      await fetch("/api/admin/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub.toJSON()) });
      setPushOn(true); setMsg("Notifiche attivate su questo dispositivo");
    } catch { setMsg("Impossibile attivare le notifiche. Su iPhone aggiungi prima il sito alla schermata Home."); }
  }
  async function logout() { await fetch("/api/admin/login", { method: "DELETE" }); location.href = "/admin"; }

  const pending = bk.filter((b) => b.status === "pending").length;
  return (
    <div className="admin">
      <div className="atop"><div className="wrap"><b className="logo">Bei Sogni · Admin</b><button className="btn sm ghost" style={{ color: "#fff", borderColor: "#fff" }} onClick={logout}>Esci</button></div></div>
      <div className="wrap">
        <div className="tabs">
          {([["req", `Richieste${pending ? ` (${pending})` : ""}`], ["cal", "Calendario"], ["rooms", "Camere"], ["push", "Notifiche"]] as const).map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}
        </div>
        {msg && <div className="msg err" style={{ marginBottom: "1rem" }}>{msg}</div>}

        {tab === "req" && (bk.length === 0 ? <p>Nessuna prenotazione ancora.</p> : bk.map((b) => (
          <div className="bk" key={b.id}>
            <div className="top"><div><b style={{ fontSize: "1.05rem" }}>{b.guest_name}</b> <span style={{ color: "var(--muted)" }}>#{b.id}</span></div><span className={`badge ${b.status}`}>{LBL[b.status]}</span></div>
            <div>{b.room_name} · {b.check_in} → {b.check_out} · {b.guests} ospiti · <b>{eur(b.total_cents)}</b></div>
            <div style={{ fontSize: ".9rem" }}><a href={`tel:${b.guest_phone}`}>{b.guest_phone}</a> · <a href={`https://wa.me/${b.guest_phone.replace(/[^\d]/g, "")}`}>WhatsApp</a> · {b.guest_email}</div>
            {b.notes && <div style={{ fontSize: ".9rem", color: "var(--muted)" }}>“{b.notes}”</div>}
            <div className="acts">
              {b.status !== "confirmed" && <button className="btn sm" onClick={() => setStatus(b.id, "confirmed")}>Conferma</button>}
              {b.status === "pending" && <button className="btn sm ghost" onClick={() => setStatus(b.id, "rejected")}>Rifiuta</button>}
              {b.status === "confirmed" && <button className="btn sm ghost" onClick={() => confirm("Annullare la prenotazione?") && setStatus(b.id, "cancelled")}>Annulla</button>}
            </div>
          </div>
        )))}

        {tab === "cal" && <Calendar bk={bk} rooms={rooms} blocks={blocks} reload={load} setMsg={setMsg} />}
        {tab === "rooms" && rooms.map((r) => <RoomEditor key={r.id} r={r} reload={load} setMsg={setMsg} />)}

        {tab === "push" && (
          <div className="panel" style={{ display: "grid", gap: "1rem" }}>
            <h3 style={{ fontSize: "1.5rem" }}>Notifiche push</h3>
            <p>Ricevi un avviso sul telefono a ogni nuova richiesta. Su iPhone: Condividi → “Aggiungi a Home”, apri l'app dalla Home e poi attiva qui.</p>
            <button className="btn" onClick={enablePush} disabled={pushOn}>{pushOn ? "Attive su questo dispositivo" : "Attiva notifiche"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Calendar({ bk, rooms, blocks, reload, setMsg }: { bk: B[]; rooms: Rm[]; blocks: Bl[]; reload: () => void; setMsg: (s: string) => void }) {
  const days = Array.from({ length: 42 }, (_, i) => new Date(Date.now() + i * 86400000).toISOString().slice(0, 10));
  const cell = (rid: string, d: string) => {
    const x = bk.find((b) => b.room_id === rid && ["pending", "confirmed"].includes(b.status) && d >= b.check_in && d < b.check_out);
    if (x) return x.status === "pending" ? "p" : "c";
    return blocks.some((b) => b.room_id === rid && d >= b.from_date && d < b.to_date) ? "b" : "";
  };
  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch("/api/admin/blocks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    if (!r.ok) setMsg(((await r.json()) as any).error); else { setMsg(""); (e.target as HTMLFormElement).reset(); reload(); }
  }
  return (
    <>
      <div className="cal"><table><thead><tr><th className="name">Camera</th>{days.map((d) => <th key={d}>{d.slice(8)}</th>)}</tr></thead>
        <tbody>{rooms.map((r) => <tr key={r.id}><td className="name">{r.name}</td>{days.map((d) => <td key={d} className={cell(r.id, d)} />)}</tr>)}</tbody></table></div>
      <p style={{ fontSize: ".8rem", margin: ".6rem 0 1.4rem", color: "var(--muted)" }}>Giallo: da confermare · Verde: confermata · Grigio: bloccata</p>
      <form className="panel form" onSubmit={add}>
        <h3 className="full" style={{ fontSize: "1.4rem" }}>Blocca date (manutenzione, prenotazione da altri portali)</h3>
        <div className="field"><label>Camera</label><select name="roomId">{rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
        <div className="field"><label>Motivo</label><input name="reason" /></div>
        <div className="field"><label>Dal</label><input type="date" name="from" required /></div>
        <div className="field"><label>Al (partenza)</label><input type="date" name="to" required /></div>
        <div className="full"><button className="btn sm">Blocca</button></div>
      </form>
      {blocks.map((b) => (
        <div key={b.id} className="bk" style={{ marginTop: ".8rem" }}><div className="top"><span>{rooms.find((r) => r.id === b.room_id)?.name} · {b.from_date} → {b.to_date} {b.reason && `· ${b.reason}`}</span>
          <button className="btn sm ghost" onClick={async () => { await fetch("/api/admin/blocks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id }) }); reload(); }}>Rimuovi</button></div></div>
      ))}
    </>
  );
}

function RoomEditor({ r, reload, setMsg }: { r: Rm; reload: () => void; setMsg: (s: string) => void }) {
  const [photos, setPhotos] = useState<string[]>(JSON.parse(r.photos));
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/rooms", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, name: f.get("name"), description: f.get("description"), base_price_cents: Math.round(Number(f.get("price")) * 100), min_nights: Number(f.get("min")), photos, active: f.get("active") ? 1 : 0 }) });
    setMsg(res.ok ? "" : ((await res.json()) as any).error); reload();
  }
  async function up(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/admin/photos", { method: "POST", body: fd }); const j: any = await res.json();
    if (res.ok) setPhotos((p) => [...p, j.url]); else setMsg(j.error);
  }
  return (
    <form className="panel form" style={{ marginBottom: "1rem" }} onSubmit={save}>
      <div className="field"><label>Nome</label><input name="name" defaultValue={r.name} /></div>
      <div className="field"><label>Prezzo base / notte (€)</label><input name="price" type="number" step="0.01" min="0" defaultValue={r.base_price_cents / 100} /></div>
      <div className="field full"><label>Descrizione</label><textarea name="description" rows={3} defaultValue={r.description} /></div>
      <div className="field"><label>Soggiorno minimo (notti)</label><input name="min" type="number" min="1" defaultValue={r.min_nights} /></div>
      <div className="field"><label><input type="checkbox" name="active" defaultChecked={!!r.active} style={{ width: "auto", marginRight: ".4rem" }} />Visibile sul sito</label></div>
      <div className="full" style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
        {photos.map((p) => <div key={p} style={{ position: "relative" }}><img src={p} alt="" style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 8 }} /><button type="button" onClick={() => setPhotos(photos.filter((x) => x !== p))} style={{ position: "absolute", top: 2, right: 2, border: 0, borderRadius: 99, width: 22, height: 22, cursor: "pointer" }}>×</button></div>)}
        <label className="btn sm ghost" style={{ cursor: "pointer" }}>+ Foto<input type="file" accept="image/*" hidden onChange={up} /></label>
      </div>
      <div className="full"><button className="btn sm">Salva</button></div>
    </form>
  );
}

