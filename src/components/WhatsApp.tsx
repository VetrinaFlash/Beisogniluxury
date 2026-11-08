import { WaIcon } from "./Icons";

export const waLink = (num: string, text = "Buongiorno, vorrei informazioni per un soggiorno al Bei Sogni Luxury.") =>
  `https://wa.me/${num}?text=${encodeURIComponent(text)}`;

export default function WhatsApp({ num }: { num: string }) {
  return (
    <>
      <a className="wa" href={waLink(num)} target="_blank" rel="noopener" aria-label="Scrivici su WhatsApp">
        <WaIcon /><span className="lbl">Scrivici su WhatsApp</span>
      </a>
      <div className="mbar">
        <a className="wab" href={waLink(num)} target="_blank" rel="noopener" aria-label="WhatsApp"><WaIcon /></a>
        <a className="btn block" href="/prenota">Verifica disponibilità</a>
      </div>
    </>
  );
}
