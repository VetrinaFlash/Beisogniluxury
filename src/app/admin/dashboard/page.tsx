"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icons";

type B = { id: string; room_id: string; room_name: string; check_in: string; check_out: string; guests: number; guest_name: string; guest_email: string; guest_phone: string; notes: string; total_cents: number; status: string; created_at: string };
type Rm = { id: string; name: string; description: string; capacity: number; base_price_cents: number; min_nights: number; photos: string; active: number };
type Bl = { id: number; room_id: string; from_date: string; to_date: string; reason: string };
type Se = { id: number; room_id: string; from_date: string; to_date: string; price_cents: number; min_nights: number | null };
type Tab = "req" | "cal" | "rooms" | "site" | "push";

const eur = (c: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(c / 100);
const d = (s: string) => new Date(s + "T12:00:00Z").toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
const nights = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const LBL: Record<string, string> = { pending: "Da confermare", confirmed: "Confermata", rejected: "Rifiutata", cancelled: "Annullata" };
const TABS: [Tab, string, string][] = [["req", "Richieste", "inbox"], ["cal", "Calendario", "cal"], ["rooms", "Camere", "bed"], ["site", "Sito", "sliders"], ["push", "Notifiche", "bell"]];

async function api(url: string, method = "GET", body?: unknown) {
  const r = await fetch(url, { method, headers: body instanceof FormData || !body ? undefined : { "Content-Type": "application/json" }, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined });
  if (r.status === 401) { location.href = "/admin"; throw new Error("auth"); }
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error ?? "Errore");
  return j;
}

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("req");
  const [bk, setBk] = useState<B[] | null>(null);
  const [rooms, setRooms] = useState<Rm[]>([]);
  const [blocks, setBlocks] = useState<Bl[]>([]);
  const [toast, setToast] = useState<{ t: string; err?: boolean } | null>(null);
  const say = useCallback((t: string, err = false) => { setToast({ t, err }); setTimeout(() => setToast(null), 3200); }, []);

  const load = useCallback(async () => {
    try {
      const [j, rr] = await Promise.all([api("/api/admin/bookings"), api("/api/admin/rooms")]);
      setBk(j.bookings); setBlocks(j.blocks); setRooms(rr.rooms);
    } catch (e) { if ((e as Error).message !== "auth") say((e as Error).message, true); }
  }, [say]);
  useEffect(() => {
    load();
    const t = setInterval(() => { if (document.visibilityState === "visible") load(); }, 30000);
    const v = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", v);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", v); };
  }, [load]);
  useEffect(() => { if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {}); }, []);

  const pending = bk?.filter((b) => b.status === "pending").length ?? 0;
  async function logout() { await fetch("/api/admin/login", { method: "DELETE" }); location.href = "/admin"; }

  return (
    <div className="admin">
      <div className="atop"><div className="wrap">
        <div className="logo">Bei Sogni<small>Gestione</small></div>
        <div className="anav">{TABS.map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}{k === "req" && pending > 0 && <span className="cnt">{pending}</span>}</button>)}</div>
        <div style={{ display: "flex", gap: ".4rem" }}>
          <a className="btn sm light" href="/" target="_blank" rel="noopener">Sito</a>
          <button className="btn sm light" onClick={logout}>Esci</button>
        </div>
      </div></div>

      <div className="wrap abody">
        {bk === null ? <div className="skel" /> : (
          <>
            {tab === "req" && <Requests bk={bk} reload={load} say={say} />}
            {tab === "cal" && <Calendar bk={bk} rooms={rooms} blocks={blocks} reload={load} say={say} />}
            {tab === "rooms" && <Rooms rooms={rooms} reload={load} say={say} />}
            {tab === "site" && <SiteTab say={say} />}
            {tab === "push" && <PushTab say={say} />}
          </>
        )}
      </div>

      <nav className="tabbar">{TABS.map(([k, l, ic]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => { setTab(k); window.scrollTo({ top: 0 }); }}><Icon n={ic} />{l}{k === "req" && pending > 0 && <span className="cnt">{pending}</span>}</button>)}</nav>
      {toast && <div className={`toast ${toast.err ? "err" : ""}`} role="status">{toast.t}</div>}
    </div>
  );
}

function Requests({ bk, reload, say }: { bk: B[]; reload: () => void; say: (t: string, e?: boolean) => void }) {
  const [f, setF] = useState<"pending" | "upcoming" | "all" | "closed">("pending");
  const [busy, setBusy] = useState("");
  const today = iso(Date.now());
  const in7 = iso(Date.now() + 7 * 86400000);
  const month = today.slice(0, 7);
  const kpi = useMemo(() => ({
    pending: bk.filter((b) => b.status === "pending").length,
    arrivals: bk.filter((b) => b.status === "confirmed" && b.check_in >= today && b.check_in <= in7).length,
    inHouse: bk.filter((b) => b.status === "confirmed" && b.check_in <= today && b.check_out > today).length,
    revenue: bk.filter((b) => b.status === "confirmed" && b.check_in.slice(0, 7) === month).reduce((s, b) => s + b.total_cents, 0),
  }), [bk, today, in7, month]);
  const list = bk.filter((b) =>
    f === "pending" ? b.status === "pending" :
    f === "upcoming" ? b.status === "confirmed" && b.check_out > today :
    f === "closed" ? ["rejected", "cancelled"].includes(b.status) || (b.status === "confirmed" && b.check_out <= today) : true
  ).sort((a, b) => f === "upcoming" ? a.check_in.localeCompare(b.check_in) : b.created_at.localeCompare(a.created_at));

  async function setStatus(b: B, status: string) {
    if (status === "cancelled" && !confirm(`Annullare la prenotazione di ${b.guest_name}?`)) return;
    if (status === "rejected" && !confirm(`Rifiutare la richiesta di ${b.guest_name}? Riceverà un'email.`)) return;
    setBusy(b.id);
    try { await api("/api/admin/bookings", "PATCH", { id: b.id, status }); say(status === "confirmed" ? "Prenotazione confermata" : "Aggiornata"); reload(); }
    catch (e) { say((e as Error).message, true); } finally { setBusy(""); }
  }
  const wa = (b: B, text: string) => `https://wa.me/${b.guest_phone.replace(/[^\d]/g, "").replace(/^(?!39)(3\d{8,9})$/, "39$1")}?text=${encodeURIComponent(text)}`;

  return (
    <>
      <div className="atitle"><h1>Richieste</h1></div>
      <div className="kpis">
        <div className={`kpi ${kpi.pending ? "hl" : ""}`}><span>Da confermare</span><b>{kpi.pending}</b></div>
        <div className="kpi"><span>Arrivi 7 giorni</span><b>{kpi.arrivals}</b></div>
        <div className="kpi"><span>Ospiti ora</span><b>{kpi.inHouse}</b></div>
        <div className="kpi"><span>Confermato nel mese</span><b>{eur(kpi.revenue)}</b></div>
      </div>
      <div className="chips">{([["pending", "Da confermare"], ["upcoming", "Prossimi soggiorni"], ["closed", "Archivio"], ["all", "Tutte"]] as const).map(([k, l]) => <button key={k} className={f === k ? "on" : ""} onClick={() => setF(k)}>{l}</button>)}</div>
      {list.length === 0 ? <div className="empty"><b>{f === "pending" ? "Tutto in ordine" : "Niente da mostrare"}</b>{f === "pending" ? "Nessuna richiesta in attesa. Le nuove arrivano anche come notifica." : "Nessuna prenotazione in questa vista."}</div> :
        list.map((b) => (
          <div className={`bk ${b.status}`} key={b.id}>
            <div className="top">
              <div><div className="who">{b.guest_name}</div><div className="code">#{b.id} · ricevuta {new Date(b.created_at.replace(" ", "T") + "Z").toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div></div>
              <span className={`badge ${b.status}`}>{LBL[b.status]}</span>
            </div>
            <div className="dates">
              <div><span>Camera</span><b>{b.room_name}</b></div>
              <div><span>Arrivo</span><b>{d(b.check_in)}</b></div>
              <div><span>Partenza</span><b>{d(b.check_out)}</b></div>
              <div><span>Notti · ospiti</span><b>{nights(b.check_in, b.check_out)} · {b.guests}</b></div>
              <div><span>Totale</span><b>{eur(b.total_cents)}</b></div>
            </div>
            {b.notes && <div className="note">“{b.notes}”</div>}
            <div className="contact">
              <a className="pill wa" href={wa(b, `Buongiorno ${b.guest_name}, la contattiamo dal Bei Sogni Luxury per la sua richiesta #${b.id}.`)} target="_blank" rel="noopener">WhatsApp</a>
              <a className="pill" href={`tel:${b.guest_phone}`}><Icon n="phone" size={14} /> {b.guest_phone}</a>
              <a className="pill" href={`mailto:${b.guest_email}`}><Icon n="mail" size={14} /> {b.guest_email}</a>
            </div>
            <div className="acts">
              {b.status === "pending" && <><button className="btn sm" disabled={busy === b.id} onClick={() => setStatus(b, "confirmed")}>Conferma</button><button className="btn sm ghost" disabled={busy === b.id} onClick={() => setStatus(b, "rejected")}>Rifiuta</button></>}
              {b.status === "confirmed" && b.check_out > today && <button className="btn sm ghost" disabled={busy === b.id} onClick={() => setStatus(b, "cancelled")}>Annulla prenotazione</button>}
              {["rejected", "cancelled"].includes(b.status) && <button className="btn sm ghost" disabled={busy === b.id} onClick={() => setStatus(b, "pending")}>Riapri</button>}
            </div>
          </div>
        ))}
    </>
  );
}

function Calendar({ bk, rooms, blocks, reload, say }: { bk: B[]; rooms: Rm[]; blocks: Bl[]; reload: () => void; say: (t: string, e?: boolean) => void }) {
  const [start, setStart] = useState(0);
  const today = iso(Date.now());
  const days = Array.from({ length: 35 }, (_, i) => iso(Date.now() + (start + i) * 86400000));
  const at = (rid: string, day: string) => {
    const x = bk.find((b) => b.room_id === rid && ["pending", "confirmed"].includes(b.status) && day >= b.check_in && day < b.check_out);
    if (x) return { c: x.status === "pending" ? "p" : "c", s: day === x.check_in, e: iso(Date.parse(day) + 86400000) === x.check_out, t: `${x.guest_name} · ${LBL[x.status]}` };
    const y = blocks.find((b) => b.room_id === rid && day >= b.from_date && day < b.to_date);
    if (y) return { c: "b", s: day === y.from_date, e: iso(Date.parse(day) + 86400000) === y.to_date, t: y.reason || "Bloccata" };
    return null;
  };
  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const f = Object.fromEntries(new FormData(form));
    try { await api("/api/admin/blocks", "POST", f); form.reset(); say("Date bloccate"); reload(); } catch (er) { say((er as Error).message, true); }
  }
  async function del(id: number) { try { await api("/api/admin/blocks", "DELETE", { id }); say("Blocco rimosso"); reload(); } catch (er) { say((er as Error).message, true); } }
  return (
    <>
      <div className="atitle"><h1>Calendario</h1>
        <div className="calnav"><button className="btn sm ghost" onClick={() => setStart(Math.max(0, start - 28))} disabled={start === 0}>←</button><button className="btn sm ghost" onClick={() => setStart(0)}>Oggi</button><button className="btn sm ghost" onClick={() => setStart(start + 28)}>→</button></div>
      </div>
      <div className="cal"><table>
        <thead><tr><th className="name">{new Date(days[0] + "T12:00:00Z").toLocaleDateString("it-IT", { month: "long", year: "numeric" })}</th>{days.map((x) => { const wd = new Date(x + "T12:00:00Z").getUTCDay(); return <th key={x} className={`${x === today ? "today" : ""} ${wd === 0 || wd === 6 ? "we" : ""}`}>{"DLMMGVS"[wd]}<br />{+x.slice(8)}</th>; })}</tr></thead>
        <tbody>{rooms.map((r) => <tr key={r.id}><td className="name">{r.name}</td>{days.map((x) => { const c = at(r.id, x); return <td key={x} className={c ? `${c.c} ${c.s ? "s" : ""} ${c.e ? "e" : ""}` : ""} title={c?.t}>{c && <span />}</td>; })}</tr>)}</tbody>
      </table></div>
      <div className="legend"><span><i style={{ background: "#efc768" }} />Da confermare</span><span><i style={{ background: "#6aa37a" }} />Confermata</span><span><i style={{ background: "#c9bcaa" }} />Bloccata</span></div>
      <div className="grid2">
        <form className="card" onSubmit={add}>
          <h3>Blocca date</h3>
          <p style={{ fontSize: ".85rem", color: "var(--muted)", marginBottom: ".8rem" }}>Per manutenzione o prenotazioni prese da Booking, telefono, ecc.</p>
          <div className="form" style={{ marginTop: 0 }}>
            <div className="field full"><label>Camera</label><select name="roomId">{rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
            <div className="field"><label>Dal</label><input type="date" name="from" required /></div>
            <div className="field"><label>Al (giorno di partenza)</label><input type="date" name="to" required /></div>
            <div className="field full"><label>Nota</label><input name="reason" placeholder="Es. Booking – Rossi" /></div>
            <div className="full"><button className="btn sm">Blocca</button></div>
          </div>
        </form>
        <div className="card">
          <h3>Date bloccate</h3>
          {blocks.filter((b) => b.to_date > today).length === 0 ? <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>Nessun blocco attivo.</p> :
            blocks.filter((b) => b.to_date > today).map((b) => <div className="rowx" key={b.id}><span><b>{rooms.find((r) => r.id === b.room_id)?.name}</b><br />{d(b.from_date)} → {d(b.to_date)}{b.reason && ` · ${b.reason}`}</span><button className="btn sm ghost" onClick={() => del(b.id)}>Rimuovi</button></div>)}
        </div>
      </div>
    </>
  );
}

function Rooms({ rooms, reload, say }: { rooms: Rm[]; reload: () => void; say: (t: string, e?: boolean) => void }) {
  const [seasons, setSeasons] = useState<Se[]>([]);
  const loadS = useCallback(async () => { try { setSeasons((await api("/api/admin/seasons")).seasons); } catch { /* */ } }, []);
  useEffect(() => { loadS(); }, [loadS]);
  async function addRoom() {
    const name = prompt("Nome della nuova camera"); if (!name) return;
    try { await api("/api/admin/rooms", "POST", { name }); say("Camera creata"); reload(); } catch (e) { say((e as Error).message, true); }
  }
  async function addSeason(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const f = Object.fromEntries(new FormData(form));
    try { await api("/api/admin/seasons", "POST", { roomId: f.roomId, from: f.from, to: f.to, price: Number(f.price), minNights: Number(f.min) || undefined }); form.reset(); say("Prezzo stagionale aggiunto"); loadS(); } catch (er) { say((er as Error).message, true); }
  }
  return (
    <>
      <div className="atitle"><h1>Camere e prezzi</h1><button className="btn sm" onClick={addRoom}>+ Nuova camera</button></div>
      {rooms.map((r) => <RoomEditor key={r.id} r={r} reload={reload} say={say} />)}
      <div className="grid2" style={{ marginTop: "1.6rem" }}>
        <form className="card" onSubmit={addSeason}>
          <h3>Prezzi stagionali</h3>
          <p style={{ fontSize: ".85rem", color: "var(--muted)", marginBottom: ".8rem" }}>Sostituiscono il prezzo base nel periodo indicato (es. agosto, ponti, eventi).</p>
          <div className="form" style={{ marginTop: 0 }}>
            <div className="field full"><label>Camera</label><select name="roomId"><option value="all">Tutte le camere</option>{rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
            <div className="field"><label>Dal</label><input type="date" name="from" required /></div>
            <div className="field"><label>Al (escluso)</label><input type="date" name="to" required /></div>
            <div className="field"><label>Prezzo / notte (€)</label><input type="number" name="price" min="1" step="0.01" required /></div>
            <div className="field"><label>Min. notti</label><input type="number" name="min" min="1" placeholder="—" /></div>
            <div className="full"><button className="btn sm">Aggiungi</button></div>
          </div>
        </form>
        <div className="card">
          <h3>Periodi attivi</h3>
          {seasons.length === 0 ? <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>Nessun prezzo stagionale.</p> :
            seasons.map((s) => <div className="rowx" key={s.id}><span><b>{rooms.find((r) => r.id === s.room_id)?.name}</b><br />{d(s.from_date)} → {d(s.to_date)} · {eur(s.price_cents)}{s.min_nights ? ` · min ${s.min_nights} notti` : ""}</span><button className="btn sm ghost" onClick={async () => { await api("/api/admin/seasons", "DELETE", { id: s.id }); loadS(); }}>Rimuovi</button></div>)}
        </div>
      </div>
    </>
  );
}

function RoomEditor({ r, reload, say }: { r: Rm; reload: () => void; say: (t: string, e?: boolean) => void }) {
  const [photos, setPhotos] = useState<string[]>(JSON.parse(r.photos));
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    try {
      await api("/api/admin/rooms", "PATCH", { id: r.id, name: f.get("name"), description: f.get("description"), capacity: Number(f.get("capacity")), base_price_cents: Math.round(Number(f.get("price")) * 100), min_nights: Number(f.get("min")) || 1, photos, active: f.get("active") ? 1 : 0 });
      say("Camera salvata"); reload();
    } catch (er) { say((er as Error).message, true); }
  }
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])]; if (!files.length) return; setUp(true);
    for (const file of files) {
      try { const fd = new FormData(); fd.append("file", await shrink(file)); const j = await api("/api/admin/photos", "POST", fd); setPhotos((p) => [...p, j.url]); }
      catch (er) { say((er as Error).message, true); }
    }
    setUp(false); e.target.value = ""; say("Foto caricate: ricorda di salvare");
  }
  const move = (i: number) => setPhotos((p) => { const n = [...p]; [n[0], n[i]] = [n[i], n[0]]; return n; });
  return (
    <div className="card" style={{ marginBottom: ".8rem" }}>
      <div className="rowx" style={{ padding: 0, border: 0, cursor: "pointer" }} onClick={() => setOpen(!open)}>
        <div style={{ display: "flex", gap: ".9rem", alignItems: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", background: "var(--sand)", flex: "none" }}>{photos[0] && <img src={photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</div>
          <div><b style={{ fontFamily: "var(--serif)", fontSize: "1.35rem", fontWeight: 500 }}>{r.name}</b><br /><span style={{ color: "var(--muted)", fontSize: ".82rem" }}>{eur(r.base_price_cents)} / notte · max {r.capacity} · {photos.length} foto {r.active ? "" : "· nascosta"}</span></div>
        </div>
        <span style={{ fontSize: "1.3rem", color: "var(--muted)", transform: open ? "rotate(180deg)" : "none", transition: ".3s" }}>⌄</span>
      </div>
      {open && (
        <form className="form" onSubmit={save}>
          <div className="field full"><label>Nome</label><input name="name" defaultValue={r.name} required /></div>
          <div className="field"><label>Prezzo base / notte (€)</label><input name="price" type="number" step="0.01" min="0" defaultValue={r.base_price_cents / 100} /></div>
          <div className="field"><label>Ospiti massimi</label><input name="capacity" type="number" min="1" max="12" defaultValue={r.capacity} /></div>
          <div className="field"><label>Soggiorno minimo (notti)</label><input name="min" type="number" min="1" defaultValue={r.min_nights} /></div>
          <div className="field" style={{ display: "flex", alignItems: "end" }}><label style={{ display: "flex", gap: ".5rem", alignItems: "center", textTransform: "none", letterSpacing: 0, fontSize: ".9rem", color: "var(--ink)" }}><input type="checkbox" name="active" defaultChecked={!!r.active} style={{ width: 18, height: 18, appearance: "auto" }} />Visibile sul sito</label></div>
          <div className="field full"><label>Descrizione</label><textarea name="description" rows={3} defaultValue={r.description} /></div>
          <div className="full">
            <div className="field"><label>Foto (la prima è la copertina · tocca una foto per renderla copertina)</label></div>
            <div className="thumbs">
              {photos.map((p, i) => <div className="t" key={p} style={{ outline: i === 0 ? "2px solid var(--gold)" : "none" }}><img src={p} alt="" onClick={() => move(i)} /><button type="button" aria-label="Rimuovi" onClick={() => setPhotos(photos.filter((x) => x !== p))}>×</button></div>)}
              <label className="add">{up ? "Carico…" : "+ Foto"}<input type="file" accept="image/*" multiple hidden onChange={upload} /></label>
            </div>
          </div>
          <div className="full"><button className="btn sm">Salva camera</button></div>
        </form>
      )}
    </div>
  );
}

/** Ridimensiona le foto lato client (max 2000px, JPEG) per caricamenti veloci da telefono. */
async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size < 600_000) return file;
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((res) => c.toBlob(res, "image/jpeg", 0.85));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }) : file;
  } catch { return file; }
}

function SiteTab({ say }: { say: (t: string, e?: boolean) => void }) {
  const [s, setS] = useState<Record<string, string> | null>(null);
  useEffect(() => { api("/api/admin/site").then((j) => setS(j.site)).catch(() => {}); }, []);
  if (!s) return <div className="skel" />;
  async function save() { try { await api("/api/admin/site", "PUT", s); say("Sito aggiornato"); } catch (e) { say((e as Error).message, true); } }
  async function img(k: string, e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    try { const fd = new FormData(); fd.append("file", await shrink(f)); const j = await api("/api/admin/photos", "POST", fd); setS({ ...s!, [k]: j.url }); say("Immagine caricata: ricorda di salvare"); } catch (er) { say((er as Error).message, true); }
  }
  const Img = ({ k, label }: { k: string; label: string }) => (
    <div className="field"><label>{label}</label>
      <div style={{ display: "flex", gap: ".8rem", alignItems: "center" }}>
        <div style={{ width: 120, height: 80, borderRadius: 12, backgroundImage: `url("${s[k]}")`, backgroundSize: "cover", backgroundPosition: "center", flex: "none", background: s[k] ? undefined : "var(--sand)" }} />
        <label className="btn sm ghost" style={{ cursor: "pointer" }}>Cambia<input type="file" accept="image/*" hidden onChange={(e) => img(k, e)} /></label>
      </div>
    </div>
  );
  return (
    <>
      <div className="atitle"><h1>Contenuti del sito</h1><a className="btn sm ghost" href="/" target="_blank" rel="noopener">Vedi sito</a></div>
      <div className="card form" style={{ marginTop: 0 }}>
        <Img k="heroImage" label="Foto principale (home)" />
        <Img k="introImage" label="Foto sezione Il B&B" />
        <div className="field full"><label>Sottotitolo home</label><textarea rows={2} value={s.heroSubtitle} onChange={(e) => setS({ ...s, heroSubtitle: e.target.value })} /></div>
        <div className="field full"><label>Frase sezione Il B&B</label><textarea rows={2} value={s.introText} onChange={(e) => setS({ ...s, introText: e.target.value })} /></div>
        <div className="field"><label>Numero WhatsApp (con prefisso, es. 39…)</label><input value={s.whatsapp} onChange={(e) => setS({ ...s, whatsapp: e.target.value })} /></div>
        <div className="full"><button className="btn sm" onClick={save}>Salva contenuti</button></div>
      </div>
    </>
  );
}

function PushTab({ say }: { say: (t: string, e?: boolean) => void }) {
  const [state, setState] = useState<"checking" | "on" | "off" | "unsupported" | "ios">("checking");
  useEffect(() => {
    (async () => {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone = matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) { setState(ios && !standalone ? "ios" : "unsupported"); return; }
      const reg = await navigator.serviceWorker.register("/sw.js");
      setState((await reg.pushManager.getSubscription()) ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, []);
  async function enable() {
    try {
      if ((await Notification.requestPermission()) !== "granted") { say("Permesso notifiche negato dal browser", true); return; }
      const reg = await navigator.serviceWorker.ready;
      const { publicKey } = await api("/api/admin/push");
      const pad = "=".repeat((4 - (publicKey.length % 4)) % 4);
      const key = Uint8Array.from(atob((publicKey + pad).replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }));
      await api("/api/admin/push", "POST", sub.toJSON());
      setState("on"); say("Notifiche attive su questo dispositivo");
    } catch { say("Impossibile attivare le notifiche su questo dispositivo", true); }
  }
  async function test() { try { await api("/api/admin/push", "PUT"); say("Notifica di prova inviata"); } catch (e) { say((e as Error).message, true); } }
  return (
    <>
      <div className="atitle"><h1>Notifiche</h1></div>
      <div className="card" style={{ display: "grid", gap: "1rem", maxWidth: 620 }}>
        <p>Ricevi un avviso sul telefono a ogni nuova richiesta di prenotazione, anche con l&apos;app chiusa.</p>
        {state === "ios" && <div className="msg err">Su iPhone: tocca <b>Condividi</b> → <b>Aggiungi alla schermata Home</b>, apri “Bei Sogni” dalla Home e torna qui.</div>}
        {state === "unsupported" && <div className="msg err">Questo browser non supporta le notifiche push. Usa Chrome su Android o l&apos;app dalla Home su iPhone.</div>}
        {state === "on" && <div className="msg ok">Notifiche attive su questo dispositivo.</div>}
        <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
          {(state === "off" || state === "on") && <button className="btn" onClick={enable}>{state === "on" ? "Riattiva" : "Attiva notifiche"}</button>}
          {state === "on" && <button className="btn ghost" onClick={test}>Invia prova</button>}
        </div>
      </div>
    </>
  );
}
