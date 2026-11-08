"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="login">
      <div className="panel" style={{ width: "min(460px,100%)", display: "grid", gap: "1rem" }}>
        <h2 style={{ fontSize: "2rem" }}>Qualcosa non ha funzionato</h2>
        <p style={{ color: "var(--muted)", fontSize: ".92rem" }}>Mandami questo messaggio così lo correggo:</p>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: ".78rem", background: "var(--sand)", padding: ".8rem", borderRadius: 10, maxHeight: 220, overflow: "auto" }}>{error.message}{error.digest ? `\n(${error.digest})` : ""}{"\n"}{(error.stack ?? "").split("\n").slice(0, 4).join("\n")}</pre>
        <div style={{ display: "flex", gap: ".5rem" }}><button className="btn" onClick={() => reset()}>Riprova</button><button className="btn ghost" onClick={() => location.reload()}>Ricarica</button></div>
      </div>
    </main>
  );
}
