import { waLink } from "./WhatsApp";
import { Icon } from "./Icons";
import Logo from "./Logo";
import { BRAND } from "@/lib/brand";
import { T, type Lang, bookPath, privacyPath } from "@/lib/i18n";

export default function Footer({ wa = BRAND.whatsapp, lang = "it" }: { wa?: string; lang?: Lang }) {
  const t = T[lang].footer;
  return (
    <footer>
      <div className="wrap">
        <div className="cols">
          <div>
            <div style={{ marginBottom: "1rem" }}><Logo /></div>
            <p>{t.about}</p>
            <div className="socials">
              <a href={BRAND.social.instagram} target="_blank" rel="noopener" aria-label="Instagram"><Icon n="ig" size={18} /></a>
              <a href={BRAND.social.facebook} target="_blank" rel="noopener" aria-label="Facebook"><Icon n="fb" size={18} /></a>
              <a href={BRAND.social.youtube} target="_blank" rel="noopener" aria-label="YouTube"><Icon n="yt" size={18} /></a>
            </div>
          </div>
          <div><h4>{t.where}</h4><p>{BRAND.street}<br />{BRAND.zip} {BRAND.city} ({BRAND.province})<br /><a className="link" href={`https://maps.google.com/?q=${encodeURIComponent(BRAND.mapsQuery)}`} target="_blank" rel="noopener">{T[lang].location.directions}</a></p></div>
          <div><h4>{t.contacts}</h4><p><a href={`tel:${BRAND.phoneRaw}`}>{BRAND.phone}</a><br /><a href={waLink(wa, T[lang].wa.msg)} target="_blank" rel="noopener">WhatsApp</a><br /><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></p></div>
          <div><h4>{t.stay}</h4><p>{t.checkin} {BRAND.checkIn}<br />{t.checkout} {BRAND.checkOut}<br /><a href={bookPath(lang)}>{t.bookDirect}</a></p></div>
        </div>
        <div className="bar">
          <span>© {new Date().getFullYear()} {BRAND.fullName} · CIN {BRAND.cin} · <a href={privacyPath(lang)} className="link">{t.privacy}</a></span>
          <span>{t.credit}</span>
        </div>
      </div>
    </footer>
  );
}
