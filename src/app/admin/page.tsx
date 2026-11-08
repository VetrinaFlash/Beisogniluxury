"use client";
import { useEffect, useState } from "react";

export default function Login() {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [setup, setSetup] = useState(false);
  useEffect(() => { fetch("/api/admin/login").then((r) => r.json()).then((j: any) => setSetup(!!j.needsSetup)).catch(() => {}); }, []);
  async function go(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch(setup ? "/api/admin/setup" : "/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: new FormData(e.currentTarget).get("password") }) });
    if (r.ok) location.href = "/admin/dashboard"; else { setErr(setup ? ((await r.json()) as any).error : "Password errata"); setBusy(false); }
  }
  return (
    <main style={{ minHeight: "100svh", display: "grid", placeItems: "center", background: "var(--ink)", padding: "1rem" }}>
      <form onSubmit={go} className="panel" style={{ width: "min(380px,100%)", display: "grid", gap: "1rem" }}>
        <div className="logo" style={{ fontSize: "1.8rem" }}>Bei Sogni <b style={{ color: "var(--gold)" }}>Luxury</b></div>
        <p className="eyebrow">{setup ? "Primo accesso: scegli la password admin" : "Area riservata"}</p>
        <div className="field"><label>Password</label><input name="password" type="password" autoComplete={setup ? "new-password" : "current-password"} minLength={setup ? 10 : undefined} required autoFocus /></div>
        {err && <div className="msg err">{err}</div>}
        <button className="btn" disabled={busy}>{setup ? "Imposta e entra" : "Entra"}</button>
      </form>
    </main>
  );
}
