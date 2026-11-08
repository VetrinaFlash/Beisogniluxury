import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Effects from "@/components/Effects";
import WhatsApp, { waLink } from "@/components/WhatsApp";
import { RailNav } from "@/components/Rail";
import { Icon } from "@/components/Icons";
import { env } from "@/lib/env";
import { eur } from "@/lib/dates";
import { ensureSchema } from "@/lib/config";
import { activeRooms } from "@/lib/availability";
import { getSite } from "@/lib/site";

export const dynamic = "force-dynamic";

const MARQ = ["Corso Mazzini a due passi", "Parcheggio in convenzione", "WiFi gratuito", "Self check-in", "Camere di design", "Terrazza & bar"];
const SERVICES: [string, string, string][] = [
  ["wifi", "WiFi gratuito", "Connessione veloce in tutta la struttura, ideale anche per chi lavora."],
  ["car", "Parcheggio in convenzione", "Parcheggio multipiano coperto a pochi metri dal portone."],
  ["sun", "Terrazza & bar", "Un angolo tranquillo per un caffè o un aperitivo in città."],
  ["coffee", "Comfort in camera", "Macchina da caffè, frigorifero, microonde e cassaforte."],
  ["key", "Self check-in", "Arrivo in autonomia dalle 15:00 alle 23:00, senza attese."],
  ["bike", "Bici e transfer", "Noleggio biciclette e transfer per l'aeroporto su richiesta."],
];
const BENEFITS: [string, string][] = [
  ["Nessuna commissione", "Prenotando qui non paghi costi di intermediazione dei portali."],
  ["Conferma personale", "Ogni richiesta la leggiamo e confermiamo noi, rapidamente."],
  ["Paghi in struttura", "Nessuna carta richiesta online: saldi all'arrivo."],
  ["Sempre raggiungibili", "Per qualsiasi esigenza ci scrivi su WhatsApp, prima e durante il soggiorno."],
];

function Seal() {
  return (
    <div className="seal" aria-hidden>
      <svg viewBox="0 0 120 120"><defs><path id="c" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
        <text fill="currentColor" fontSize="9.5" letterSpacing="3.2" fontFamily="Inter, sans-serif"><textPath href="#c">BEI SOGNI LUXURY · COSENZA CENTRO · </textPath></text></svg>
      <b>BS</b>
    </div>
  );
}

export default async function Home() {
  let rooms: Awaited<ReturnType<typeof activeRooms>> = [];
  try { await ensureSchema(); rooms = await activeRooms(env().DB); } catch { /* DB non disponibile */ }
  const site = await getSite();
  const minPrice = rooms.length ? Math.min(...rooms.map((r) => r.base_price_cents)) : 0;
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  return (
    <>
      <Nav />
      <Effects />

      <section className="hero grain" id="home" style={{ padding: 0 }}>
        <div className="bg" style={{ backgroundImage: `url("${site.heroImage}")` }} />
        <div className="shade" />
        <div className="wrap inner">
          <span className="eyebrow rv">B&B · Cosenza centro</span>
          <h1 className="rv d1">Soggiorno di <em>lusso</em> nel cuore di Cosenza</h1>
          <p className="sub rv d2">{site.heroSubtitle}</p>
          <div className="bottom">
            <form className="bookbar rv d3" action="/prenota" method="get">
              <div className="f"><label htmlFor="ci">Arrivo</label><input id="ci" type="date" name="checkIn" min={today} defaultValue={today} required /></div>
              <div className="f"><label htmlFor="co">Partenza</label><input id="co" type="date" name="checkOut" min={tomorrow} defaultValue={tomorrow} required /></div>
              <div className="f"><label htmlFor="g">Ospiti</label><select id="g" name="guests" defaultValue="2">{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} {n === 1 ? "ospite" : "ospiti"}</option>)}</select></div>
              <button className="btn" type="submit">Verifica <span className="arr">→</span></button>
            </form>
            <div className="scrollcue rv d4"><span>Scopri</span><i /></div>
          </div>
        </div>
      </section>

      <div className="marq" aria-hidden><div className="track">{[...MARQ, ...MARQ, ...MARQ, ...MARQ].map((m, i) => <span key={i}>{m}</span>)}</div></div>

      <section id="esperienza">
        <div className="wrap intro">
          <div className="archwrap rv">
            <div className="arch"><img src={site.introImage} alt="Camera del Bei Sogni Luxury" loading="lazy" /></div>
            <Seal />
          </div>
          <div>
            <span className="eyebrow rv">Il B&B</span>
            <h2 className="h2 rv d1">Eleganza discreta, <em>in pieno centro</em></h2>
            <p className="quote rv d2">{site.introText}</p>
            <div className="stats rv d3">
              <div><b>{rooms.length || 6}</b><span>Camere di design</span></div>
              <div><b>2′</b><span>A piedi da Corso Mazzini</span></div>
              <div><b>0%</b><span>Commissioni prenotando qui</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="dark grain" id="camere" style={{ paddingBottom: "clamp(5rem,9vw,7rem)" }}>
        <div className="wrap sec-head">
          <div>
            <span className="eyebrow rv">Le camere</span>
            <h2 className="h2 rv d1" style={{ marginBottom: ".6rem" }}>Scegli la tua <em>stanza</em></h2>
            <p className="lead rv d2">{minPrice ? <>A partire da <b style={{ color: "var(--gold2)" }}>{eur(minPrice)}</b> a notte, con bagno privato e tutti i comfort.</> : "Tutte con bagno privato e comfort moderni."}</p>
          </div>
          <RailNav target="rail" />
        </div>
        <div className="rail" id="rail">
          {rooms.map((r, i) => {
            const photos: string[] = JSON.parse(r.photos);
            const am: string[] = JSON.parse(r.amenities);
            return (
              <article className="room rv" key={r.id} tabIndex={0}>
                {photos[0] ? <div className="img"><img src={photos[0]} alt={r.name} loading="lazy" /></div> : <div className="ph"><span>BS</span></div>}
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <span className="pc">da <b>{eur(r.base_price_cents)}</b></span>
                <div className="body">
                  <div className="meta">Fino a {r.capacity} ospiti</div>
                  <h3>{r.name}</h3>
                  <div className="more"><div>
                    <p>{r.description}</p>
                    <div className="tags">{am.slice(0, 4).map((a) => <span key={a}>{a}</span>)}</div>
                    <a className="btn sm" href={`/prenota?room=${r.id}`}>Prenota <span className="arr">→</span></a>
                  </div></div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="dark" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head" style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: "clamp(4rem,8vw,6rem)" }}>
            <div><span className="eyebrow rv">Perché prenotare diretto</span><h2 className="h2 rv d1" style={{ marginBottom: 0 }}>Il miglior modo di <em>arrivare</em></h2></div>
          </div>
          <div className="bens">{BENEFITS.map(([t, d], i) => <div className="ben" key={t}><b>0{i + 1}</b><h3>{t}</h3><p>{d}</p></div>)}</div>
        </div>
      </section>

      <section id="servizi">
        <div className="wrap">
          <div className="sec-head">
            <div><span className="eyebrow rv">Servizi</span><h2 className="h2 rv d1" style={{ marginBottom: 0 }}>Tutto il necessario, <em>nulla di superfluo</em></h2></div>
          </div>
          <div className="svcs rv">{SERVICES.map(([ic, t, d]) => <div className="svc" key={t}><div className="ic"><Icon n={ic} /></div><h3>{t}</h3><p>{d}</p></div>)}</div>
        </div>
      </section>

      <section className="sand" id="posizione">
        <div className="wrap loc">
          <div>
            <span className="eyebrow rv">Posizione</span>
            <h2 className="h2 rv d1">Cosenza, <em>a piedi</em></h2>
            <p className="lead rv d2">In Via Pompilio Rodotà, a due passi da Corso Mazzini: shopping, musei e locali senza dover prendere l&apos;auto.</p>
            <ul className="dist rv d3">
              <li><span>Corso Mazzini</span><span>2 min a piedi</span></li>
              <li><span>Museo all&apos;Aperto Bilotti</span><span>5 min a piedi</span></li>
              <li><span>Duomo di Cosenza</span><span>circa 1,8 km</span></li>
              <li><span>Aeroporto di Lamezia</span><span>circa 67 km</span></li>
            </ul>
          </div>
          <div className="map rv d2">
            <iframe title="Mappa Bei Sogni Luxury" loading="lazy" src="https://maps.google.com/maps?q=Via%20Pompilio%20Rodot%C3%A0%2012%20Cosenza&z=16&output=embed" />
            <div className="pin"><Icon n="pin" size={18} /> Via Pompilio Rodotà 12</div>
          </div>
        </div>
      </section>

      <section className="dark cta grain" id="contatti">
        <div className="bg" style={{ backgroundImage: `url("${site.heroImage}")` }} />
        <div className="wrap inner">
          <span className="eyebrow rv">Ti aspettiamo</span>
          <h2 className="rv d1">Una notte a Cosenza, <em>come si deve</em></h2>
          <div className="row rv d2">
            <a className="btn" href="/prenota">Verifica disponibilità <span className="arr">→</span></a>
            <a className="btn light" href={waLink(site.whatsapp)} target="_blank" rel="noopener">Scrivici su WhatsApp</a>
          </div>
        </div>
      </section>

      <Footer wa={site.whatsapp} />
      <WhatsApp num={site.whatsapp} />
    </>
  );
}
