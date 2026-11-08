"use client";
import { useEffect, useState } from "react";

export default function Login() {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [setup, setSetup] = useState(false);
  useEffect(() => { fetch("/api/admin/login").then((r) => r.json()).then((j: any) => setSetup(!!j.needsSetup)).catch(() => {}); }, []);
  async function go(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr("");
    const fd = new FormData(e.currentTarget);
    if (setup && fd.get("password") !== fd.get("confirm")) { setErr("Le password non coincidono"); setBusy(false); return; }
    try {
      const r = await fetch(setup ? "/api/admin/setup" : "/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: fd.get("password") }) });
      if (r.ok) { location.href = "/admin/dashboard"; return; }
      const j: any = await r.json().catch(() => ({}));
      setErr(j.error ?? "Password errata");
    } catch { setErr("Connessione non riuscita"); }
    setBusy(false);
  }
  return (
    <main className="login">
      <div className="bgimg" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=60&w=1400")' }} />
      <form onSubmit={go}>
        <div className="logo" style={{ fontSize: "2rem", color: "var(--ink)" }}>Bei Sogni<small style={{ color: "var(--goldd)" }}>Pannello di gestione</small></div>
        <p style={{ color: "var(--muted)", fontSize: ".92rem" }}>{setup ? "Primo accesso: scegli la password del pannello (almeno 10 caratteri)." : "Accedi per gestire prenotazioni, camere e calendario."}</p>
        <div className="field"><label htmlFor="pw">Password</label><input id="pw" name="password" type="password" autoComplete={setup ? "new-password" : "current-password"} minLength={setup ? 10 : undefined} required autoFocus /></div>
        {setup && <div className="field"><label htmlFor="pw2">Ripeti password</label><input id="pw2" name="confirm" type="password" autoComplete="new-password" required /></div>}
        {err && <div className="msg err" role="alert">{err}</div>}
        <button className="btn block" disabled={busy}>{busy ? "…" : setup ? "Imposta e accedi" : "Accedi"}</button>
      </form>
    </main>
  );
}
