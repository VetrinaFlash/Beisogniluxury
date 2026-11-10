import Nav from "./Nav";
import Footer from "./Footer";
import { BRAND, fullAddress } from "@/lib/brand";
import { T, type Lang } from "@/lib/i18n";

const TXT = {
  it: [
    ["Titolare del trattamento", `${BRAND.fullName}, ${fullAddress}. Contatto: ${BRAND.email}. CIN ${BRAND.cin}.`],
    ["Dati trattati", "Nome, email, telefono e dettagli della richiesta di prenotazione, usati solo per gestire il soggiorno e rispondere alla richiesta. Base giuridica: esecuzione di misure precontrattuali e del contratto."],
    ["Conservazione", "Per il tempo necessario alla gestione del soggiorno e agli obblighi di legge, inclusa la comunicazione degli alloggiati alle autorità."],
    ["Diritti", "Accesso, rettifica, cancellazione, limitazione, opposizione, portabilità e reclamo al Garante per la protezione dei dati personali."],
    ["Cookie", "Il sito usa solo cookie tecnici necessari al funzionamento. La mappa incorporata è fornita da Google. Non usiamo cookie di profilazione."],
  ],
  en: [
    ["Data controller", `${BRAND.fullName}, ${fullAddress}, Italy. Contact: ${BRAND.email}. CIN ${BRAND.cin}.`],
    ["Data processed", "Name, email, phone and booking request details, used only to manage your stay and reply to your request. Legal basis: pre-contractual measures and performance of the contract."],
    ["Retention", "For the time needed to manage your stay and comply with legal obligations, including guest registration with the authorities."],
    ["Your rights", "Access, rectification, erasure, restriction, objection, portability and complaint to the Italian Data Protection Authority."],
    ["Cookies", "This website only uses technical cookies required for it to work. The embedded map is provided by Google. We do not use profiling cookies."],
  ],
};

export default function PrivacyPage({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <>
      <Nav solid lang={lang} alt={{ it: "/privacy", en: "/en/privacy" }} />
      <main className="page"><div className="wrap" style={{ maxWidth: 760 }}>
        <span className="eyebrow">{lang === "en" ? "Information" : "Informativa"}</span>
        <h1 style={{ fontSize: "clamp(2.6rem,6vw,4rem)", margin: "1rem 0 2rem", fontWeight: 400 }}>{t.privacyTitle[0]} <em>{t.privacyTitle[1]}</em></h1>
        <div style={{ display: "grid", gap: "1.1rem", color: "#2b3c4a" }}>{TXT[lang].map(([h, p]) => <p key={h}><b>{h}:</b> {p}</p>)}</div>
      </div></main>
      <Footer lang={lang} />
    </>
  );
}

