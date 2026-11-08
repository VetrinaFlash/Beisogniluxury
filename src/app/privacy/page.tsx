import Nav from "@/components/Nav";

export const metadata = { title: "Privacy e cookie" };

export default function Privacy() {
  return (
    <>
      <Nav solid />
      <main className="page"><div className="wrap" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>Privacy e cookie</h1>
        <div style={{ display: "grid", gap: "1rem", color: "#3b342d" }}>
          <p><b>Titolare del trattamento:</b> Bei Sogni Luxury, Via Pompilio Rodotà 12, 87100 Cosenza (CS). Contatto: deisogniluxury@libero.it.</p>
          <p><b>Dati trattati:</b> nome, email, telefono e dettagli della richiesta di prenotazione, usati solo per gestire il soggiorno e rispondere alla tua richiesta. Base giuridica: esecuzione di misure precontrattuali.</p>
          <p><b>Conservazione:</b> per il tempo necessario alla gestione del soggiorno e agli obblighi di legge.</p>
          <p><b>Diritti:</b> accesso, rettifica, cancellazione, limitazione, portabilità e reclamo al Garante per la protezione dei dati personali.</p>
          <p><b>Cookie:</b> il sito usa solo cookie tecnici necessari al funzionamento. Non usiamo cookie di profilazione o di tracciamento.</p>
          <p style={{ fontSize: ".85rem", color: "var(--muted)" }}>Testo da far validare al titolare prima della pubblicazione.</p>
        </div>
      </div></main>
    </>
  );
}
