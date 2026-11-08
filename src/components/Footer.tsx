import { waLink } from "./WhatsApp";

export default function Footer({ wa = "393500643760" }: { wa?: string }) {
  return (
    <footer>
      <div className="wrap">
        <div className="cols">
          <div>
            <div className="big">Bei Sogni <em>Luxury</em></div>
            <p>Bed & Breakfast nel cuore di Cosenza,<br />a due passi da Corso Mazzini.</p>
          </div>
          <div><h4>Dove siamo</h4><p>Via Pompilio Rodotà 12<br />87100 Cosenza (CS)<br /><a className="link" href="https://maps.google.com/?q=Via+Pompilio+Rodot%C3%A0+12+Cosenza" target="_blank" rel="noopener">Indicazioni</a></p></div>
          <div><h4>Contatti</h4><p><a href="tel:+393500643760">+39 350 0643760</a><br /><a href={waLink(wa)} target="_blank" rel="noopener">WhatsApp</a><br /><a href="mailto:deisogniluxury@libero.it">deisogniluxury@libero.it</a></p></div>
          <div><h4>Soggiorno</h4><p>Check-in 15:00 – 23:00<br />Check-out entro le 10:00<br /><a href="/prenota">Prenota diretto</a></p></div>
        </div>
        <div className="bar">
          <span>© {new Date().getFullYear()} Bei Sogni Luxury · <a href="/privacy" className="link">Privacy e cookie</a></span>
          <span>Sito realizzato da Daniele Zobel</span>
        </div>
      </div>
    </footer>
  );
}
