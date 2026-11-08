import Nav from "@/components/Nav";

export default function NotFound() {
  return (
    <>
      <Nav solid />
      <main className="page" style={{ textAlign: "center", display: "grid", placeItems: "center" }}>
        <div><span className="eyebrow">Errore 404</span><h1 style={{ fontSize: "clamp(2.4rem,7vw,4.4rem)", margin: ".6rem 0 1.4rem" }}>Questa stanza <em>non esiste</em></h1><a className="btn" href="/">Torna alla home</a></div>
      </main>
    </>
  );
}
