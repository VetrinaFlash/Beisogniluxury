import Nav from "@/components/Nav";
import { env } from "@/lib/env";
import { ensureSchema } from "@/lib/config";
import { eur } from "@/lib/dates";
import { activeRooms } from "@/lib/availability";

export const dynamic = "force-dynamic";

const SERVICES = [
  ["WiFi gratuito", "Connessione veloce in tutta la struttura."],
  ["Parcheggio in convenzione", "Parcheggio multipiano coperto a pochi metri."],
  ["Terrazza e bar", "Un angolo tranquillo per la colazione o un caffè."],
  ["Camere senza allergeni", "Climatizzate, con macchina da caffè, frigorifero e cassaforte."],
  ["Self check-in", "Arrivo in autonomia dalle 15:00 alle 23:00."],
  ["Noleggio bici e transfer", "Per muoverti in città e raggiungere l'aeroporto."],
];

export default async function Home() {
  let rooms: Awaited<ReturnType<typeof activeRooms>> = [];
  try { await ensureSchema(); rooms = await activeRooms(env().DB); } catch { /* DB non ancora creato */ }
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <Nav />
      <section className="hero" id="home" style={{ padding: 0 }}>
        <div className="wrap">
          <span className="eyebrow" style={{ color: "#d9c3a0" }}>Cosenza centro · Corso Mazzini</span>
          <h1>Soggiorno di lusso nel cuore di Cosenza</h1>
          <p className="lead">Camere di design e comfort esclusivi, a due passi da Corso Mazzini. Prenota direttamente da noi, senza intermediari.</p>
          <form className="searchbar" action="/prenota" method="get">
            <div><label htmlFor="ci">Arrivo</label><input id="ci" type="date" name="checkIn" min={today} required /></div>
            <div><label htmlFor="co">Partenza</label><input id="co" type="date" name="checkOut" min={today} required /></div>
            <div><label htmlFor="g">Ospiti</label><select id="g" name="guests" defaultValue="2">{[1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}</select></div>
            <button className="btn" type="submit">Verifica</button>
          </form>
        </div>
      </section>

      <section id="il-bb">
        <div className="wrap intro">
          <div>
            <span className="eyebrow">Il B&B</span>
            <h2 style={{ fontSize: "clamp(2.1rem,5vw,3.4rem)", margin: ".6rem 0 1.2rem" }}>Eleganza discreta, in pieno centro</h2>
            <p className="quote">Camere luminose, letti comodi e una posizione che permette di vivere Cosenza a piedi.</p>
          </div>
          <div className="feats">
            <div className="feat"><span className="eyebrow">01</span><h3>Centralissimo</h3><p>A pochi passi da Corso Mazzini e dal Museo all'Aperto Bilotti.</p></div>
            <div className="feat"><span className="eyebrow">02</span><h3>Parcheggio</h3><p>Convenzione con un parcheggio multipiano coperto vicinissimo.</p></div>
            <div className="feat"><span className="eyebrow">03</span><h3>Design</h3><p>Ambienti rifiniti con cura, bagno privato in ogni camera.</p></div>
            <div className="feat"><span className="eyebrow">04</span><h3>Accoglienza</h3><p>Host disponibile su WhatsApp, prima e durante il soggiorno.</p></div>
          </div>
        </div>
      </section>

      <section className="dark" id="camere">
        <div className="wrap">
          <div className="head"><span className="eyebrow">Le camere</span><h2>Scegli la tua stanza</h2><p>Prenotando sul sito diretto non paghi commissioni e confermiamo noi, personalmente.</p></div>
          <div className="rooms">
            {rooms.map((r) => {
              const photos: string[] = JSON.parse(r.photos);
              const am: string[] = JSON.parse(r.amenities);
              return (
                <article className="card" key={r.id}>
                  <div className="ph">{photos[0] ? <img src={photos[0]} alt={r.name} loading="lazy" /> : <span>{r.name}</span>}</div>
                  <div className="body">
                    <h3>{r.name}</h3>
                    <p>{r.description}</p>
                    <div className="tags">{am.slice(0, 4).map((a) => <span key={a}>{a}</span>)}</div>
                    <div className="price"><div><small>da</small> <b>{eur(r.base_price_cents)}</b> <small>/ notte · max {r.capacity} ospiti</small></div><a className="btn sm" href="/prenota">Prenota</a></div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="servizi">
        <div className="wrap">
          <div className="head"><span className="eyebrow">Servizi</span><h2>Tutto il necessario, nulla di superfluo</h2></div>
          <div className="services">{SERVICES.map(([t, d]) => <div className="svc" key={t}><h3>{t}</h3><p>{d}</p></div>)}</div>
        </div>
      </section>

      <section id="posizione" style={{ background: "var(--paper2)" }}>
        <div className="wrap loc">
          <div>
            <span className="eyebrow">Posizione</span>
            <h2 style={{ fontSize: "clamp(2.1rem,5vw,3.4rem)", margin: ".6rem 0 1rem" }}>Via Pompilio Rodotà 12</h2>
            <p style={{ color: "var(--muted)", marginBottom: "1.2rem" }}>Nel cuore di Cosenza, a due passi da Corso Mazzini.</p>
            <ul className="list">
              <li>Museo all'Aperto Bilotti <span>5 min a piedi</span></li>
              <li>Duomo di Cosenza <span>circa 1,8 km</span></li>
              <li>Teatro Rendano <span>circa 4 km</span></li>
              <li>Aeroporto di Lamezia Terme <span>circa 67 km</span></li>
            </ul>
          </div>
          <div className="map"><iframe title="Mappa" loading="lazy" src="https://maps.google.com/maps?q=Via%20Pompilio%20Rodot%C3%A0%2012%20Cosenza&output=embed" /></div>
        </div>
      </section>

      <section className="dark" id="contatti" style={{ textAlign: "center" }}>
        <div className="wrap">
          <span className="eyebrow">Contatti</span>
          <h2 style={{ fontSize: "clamp(2.1rem,5vw,3.4rem)", margin: ".6rem 0 1.2rem" }}>Prenota la tua notte a Cosenza</h2>
          <p style={{ color: "#b9ad9d", marginBottom: "2rem" }}>Per domande o richieste particolari scrivici su WhatsApp.</p>
          <div style={{ display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btn" href="/prenota">Verifica disponibilità</a>
            <a className="btn ghost" style={{ color: "#fff", borderColor: "#fff" }} href="https://wa.me/393500643760">WhatsApp</a>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="cols">
            <div><h4>Bei Sogni Luxury</h4><p>Via Pompilio Rodotà 12<br />87100 Cosenza (CS)</p></div>
            <div><h4>Contatti</h4><p><a href="tel:+393500643760">+39 350 0643760</a><br /><a href="mailto:deisogniluxury@libero.it">deisogniluxury@libero.it</a></p></div>
            <div><h4>Info</h4><p>Check-in 15:00–23:00<br />Check-out entro le 10:00<br /><a href="/privacy">Privacy e cookie</a></p></div>
          </div>
          <p style={{ fontSize: ".8rem", opacity: .7 }}>© {new Date().getFullYear()} Bei Sogni Luxury · Sito realizzato da Daniele Zobel</p>
        </div>
      </footer>
      <a className="wa" href="https://wa.me/393500643760" aria-label="WhatsApp">✆</a>
    </>
  );
}
