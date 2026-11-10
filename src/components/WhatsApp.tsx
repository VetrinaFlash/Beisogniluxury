import { WaIcon } from "./Icons";
import { T, type Lang, bookPath } from "@/lib/i18n";

export const waLink = (num: string, text: string) => `https://wa.me/${num}?text=${encodeURIComponent(text)}`;

export default function WhatsApp({ num, lang = "it" }: { num: string; lang?: Lang }) {
  const t = T[lang].wa;
  return (
    <>
      <a className="wa" href={waLink(num, t.msg)} target="_blank" rel="noopener" aria-label={t.label}>
        <WaIcon /><span className="lbl">{t.label}</span>
      </a>
      <div className="mbar">
        <a className="wab" href={waLink(num, t.msg)} target="_blank" rel="noopener" aria-label="WhatsApp"><WaIcon /></a>
        <a className="btn block" href={bookPath(lang)}>{t.bar}</a>
      </div>
    </>
  );
}
