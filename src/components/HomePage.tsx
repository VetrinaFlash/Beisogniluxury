import Nav from "./Nav";
import Footer from "./Footer";
import Effects from "./Effects";
import WhatsApp, { waLink } from "./WhatsApp";
import { RailNav } from "./Rail";
import { Icon } from "./Icons";
import { env } from "@/lib/env";
import { eur } from "@/lib/dates";
import { ensureSchema } from "@/lib/config";
import { activeRooms } from "@/lib/availability";
import { getSite } from "@/lib/site";
import { BRAND } from "@/lib/brand";
import { T, type Lang, bookPath, roomName } from "@/lib/i18n";

const I = BRAND.img;

export default async function HomePage({ lang }: { lang: Lang }) {
  const t = T[lang];
  const en = lang === "en";
  let rooms: Awaited<ReturnType<typeof activeRooms>> = [];
  try { await ensureSchema(); rooms = await activeRooms(env().DB); } catch { /* DB non disponibile */ }
  const site = await getSite();
  const minPrice = rooms.length ? Math.min(...rooms.map((r) => r.base_price_cents)) : 0;
  const today = new Date().toISOString().slice(0, 10);
  const plus3 = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  const subtitle = en ? site.heroSubtitle_en : site.heroSubtitle;
  const intro = en ? site.introText_en : site.introText;
  const dests = [I.trekking, I.amalfi, I.ravello, I.sorrento, I.pompei, I.ischia];
  const gallery = [I.hero, I.fornillo, I.door, I.grotta, I.breakfast, I.intro, I.trekking];

  return (
    <>
      <Nav lang={lang} />
      <Effects />

      <section className="hero grain" id="home" style={{ padding: 0 }}>
        {site.heroVideo
          ? <video className="bg" autoPlay muted loop playsInline preload="metadata" poster={site.heroImage} aria-hidden><source src={site.heroVideo} type="video/mp4" /></video>
          : <div className="bg" style={{ backgroundImage: `url("${site.heroImage}")` }} />}
        <div className="shade" />
        <div className="wrap inner">
          <span className="eyebrow rv">{t.hero.eyebrow}</span>
          <h1 className="rv d1">{t.hero.title[0]} <em>{t.hero.title[1]}</em> {t.hero.title[2]}</h1>
          <p className="sub rv d2">{subtitle}</p>
          <div className="bottom">
            <form className="bookbar rv d3" action={bookPath(lang)} method="get">
              <div className="f"><label htmlFor="ci">{t.hero.arrive}</label><input id="ci" type="date" name="checkIn" min={today} defaultValue={today} required /></div>
              <div className="f"><label htmlFor="co">{t.hero.depart}</label><input id="co" type="date" name="checkOut" min={today} defaultValue={plus3} required /></div>
              <div className="f"><label htmlFor="g">{t.hero.guests}</label><select id="g" name="guests" defaultValue="2">{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} {n === 1 ? t.hero.guest1 : t.hero.guestN}</option>)}</select></div>
              <button className="btn" type="submit">{t.hero.check} <span className="arr">→</span></button>
            </form>
            <div className="scrollcue rv d4"><span>{t.hero.scroll}</span><i /></div>
          </div>
        </div>
      </section>

      <div className="marq" aria-hidden><div className="track">{[...t.marq, ...t.marq, ...t.marq, ...t.marq].map((m, i) => <span key={i}>{m}</span>)}</div></div>

      <section id="benvenuti">
        <div className="wrap split">
          <div className="duo rv">
            <div className="photo"><img src={site.introImage} alt={BRAND.fullName} loading="lazy" /></div>
            <div className="photo small"><img src={I.fornillo} alt="Fornillo, Positano" loading="lazy" /></div>
          </div>
          <div>
            <span className="eyebrow rv">{t.intro.eyebrow}</span>
            <h2 className="h2 rv d1">{t.intro.title[0]} <em>{t.intro.title[1]}</em></h2>
            <p className="quote rv d2">{intro}</p>
            <div className="stats rv d3">
              <div><b>{rooms.length || 4}</b><span>{t.intro.s1}</span></div>
              <div><b>10′</b><span>{t.intro.s2}</span></div>
              <div><b>0%</b><span>{t.intro.s3}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="dark grain" id="camere" style={{ paddingBottom: "clamp(5rem,9vw,7rem)" }}>
        <div className="wrap sec-head">
          <div>
            <span className="eyebrow rv">{t.rooms.eyebrow}</span>
            <h2 className="h2 rv d1" style={{ marginBottom: ".6rem" }}>{t.rooms.title[0]} <em>{t.rooms.title[1]}</em></h2>
            {minPrice > 0 && <p className="lead rv d2">{t.rooms.from} <b style={{ color: "var(--gold2)" }}>{eur(minPrice)}</b> {t.rooms.perNight}</p>}
          </div>
          <RailNav target="rail" labels={[t.rooms.prev, t.rooms.next]} />
        </div>
        <div className="rail" id="rail">
          {rooms.map((r, i) => {
            const photos: string[] = JSON.parse(r.photos);
            const am: string[] = JSON.parse((en && r.amenities_en !== "[]" && r.amenities_en) || r.amenities);
            return (
              <article className="room rv" key={r.id} tabIndex={0}>
                {photos[0] ? <div className="img"><img src={photos[0]} alt={r.name} loading="lazy" /></div> : <div className="ph"><span>Venus</span></div>}
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <span className="pc">{t.rooms.fromShort} <b>{eur(r.base_price_cents)}</b></span>
                <div className="body">
                  <div className="meta">{t.rooms.upTo} {r.capacity} {t.rooms.guests}</div>
                  <h3>{roomName(r.name, lang)}</h3>
                  <div className="more"><div>
                    <p>{(en && r.description_en) || r.description}</p>
                    <div className="tags">{am.slice(0, 4).map((a) => <span key={a}>{a}</span>)}</div>
                    <a className="btn sm" href={`${bookPath(lang)}?room=${r.id}`}>{t.rooms.book} <span className="arr">→</span></a>
                  </div></div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="colazione">
        <div className="wrap split rev">
          <div className="photo wide rv"><img src={I.breakfast} alt={t.breakfast.eyebrow} loading="lazy" /><span className="tag">{t.book.breakfastIncl}</span></div>
          <div>
            <span className="eyebrow rv">{t.breakfast.eyebrow}</span>
            <h2 className="h2 rv d1">{t.breakfast.title[0]} <em>{t.breakfast.title[1]}</em></h2>
            <p className="lead rv d2">{t.breakfast.text}</p>
            <ul className="checks rv d3">{t.breakfast.points.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="dark grain" id="host">
        <div className="wrap split">
          <div className="photo rv"><img src={site.hostImage} alt={BRAND.host} loading="lazy" /></div>
          <div>
            <span className="eyebrow rv">{t.host.eyebrow}</span>
            <h2 className="h2 rv d1">{t.host.title[0]} <em>{t.host.title[1]}</em></h2>
            <p className="lead rv d2">{t.host.text}</p>
            <div className="signature rv d3">— {BRAND.host}</div>
            <a className="btn rv d3" href={waLink(site.whatsapp, t.wa.msg)} target="_blank" rel="noopener">{t.host.cta} <span className="arr">→</span></a>
          </div>
        </div>
      </section>

      <section className="dark" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head" style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: "clamp(4rem,8vw,6rem)" }}>
            <div><span className="eyebrow rv">{t.why.eyebrow}</span><h2 className="h2 rv d1" style={{ marginBottom: 0 }}>{t.why.title[0]} <em>{t.why.title[1]}</em></h2></div>
          </div>
          <div className="bens">{t.why.items.map(([h, d], i) => <div className="ben" key={h}><b>0{i + 1}</b><h3>{h}</h3><p>{d}</p></div>)}</div>
        </div>
      </section>

      <section id="servizi">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow rv">{t.services.eyebrow}</span><h2 className="h2 rv d1" style={{ marginBottom: 0 }}>{t.services.title[0]} <em>{t.services.title[1]}</em></h2></div></div>
          <div className="svcs rv">{t.services.list.map(([ic, h, d]) => <div className="svc" key={h}><div className="ic"><Icon n={ic} /></div><h3>{h}</h3><p>{d}</p></div>)}</div>
          <p className="extra rv">{t.services.extra}</p>
        </div>
      </section>

      <section className="sea" id="galleria" style={{ paddingTop: "clamp(3rem,6vw,5rem)" }}>
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow rv">{t.gallery.eyebrow}</span><h2 className="h2 rv d1" style={{ marginBottom: 0 }}>{t.gallery.title[0]} <em>{t.gallery.title[1]}</em></h2></div></div>
          <div className="mosaic">{gallery.map((g, i) => <div className={`photo rv d${(i % 4) + 1}`} key={g}><img src={g} alt={`${BRAND.fullName} ${i + 1}`} loading="lazy" /></div>)}</div>
        </div>
      </section>

      <section className="dark grain" id="dintorni" style={{ paddingBottom: "clamp(5rem,9vw,7rem)" }}>
        <div className="wrap sec-head">
          <div><span className="eyebrow rv">{t.around.eyebrow}</span><h2 className="h2 rv d1" style={{ marginBottom: ".6rem" }}>{t.around.title[0]} <em>{t.around.title[1]}</em></h2><p className="lead rv d2">{t.around.text}</p></div>
          <RailNav target="dest" labels={[t.rooms.prev, t.rooms.next]} item=".dest" />
        </div>
        <div className="rail" id="dest">
          {t.around.items.map(([h, d], i) => <article className="dest rv" key={h}><img src={dests[i]} alt={h} loading="lazy" /><div className="body"><h3>{h}</h3><p>{d}</p></div></article>)}
        </div>
      </section>

      <section className="sand" id="posizione">
        <div className="wrap loc">
          <div>
            <span className="eyebrow rv">{t.location.eyebrow}</span>
            <h2 className="h2 rv d1">{t.location.title[0]} <em>{t.location.title[1]}</em></h2>
            <p className="lead rv d2">{t.location.text}</p>
            <ul className="dist rv d3">{t.location.dist.map(([a, b]) => <li key={a}><span>{a}</span><span>{b}</span></li>)}</ul>
            <p className="hint rv d3">{t.location.port}</p>
          </div>
          <div className="map rv d2">
            <iframe title={`Mappa ${BRAND.fullName}`} loading="lazy" src={`https://maps.google.com/maps?q=${encodeURIComponent(BRAND.mapsQuery)}&z=16&output=embed`} />
            <div className="pin"><Icon n="pin" size={18} /> {BRAND.street}, {BRAND.city}</div>
          </div>
        </div>
      </section>

      <section className="dark cta grain" id="contatti">
        <div className="bg" style={{ backgroundImage: `url("${I.trekking}")` }} />
        <div className="wrap inner">
          <span className="eyebrow rv">{t.cta.eyebrow}</span>
          <h2 className="rv d1">{t.cta.title[0]} <em>{t.cta.title[1]}</em></h2>
          <div className="row rv d2">
            <a className="btn" href={bookPath(lang)}>{t.cta.book} <span className="arr">→</span></a>
            <a className="btn light" href={waLink(site.whatsapp, t.wa.msg)} target="_blank" rel="noopener">{t.cta.wa}</a>
          </div>
        </div>
      </section>

      <Footer wa={site.whatsapp} lang={lang} />
      <WhatsApp num={site.whatsapp} lang={lang} />
    </>
  );
}
