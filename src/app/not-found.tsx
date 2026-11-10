import Nav from "@/components/Nav";
import { T } from "@/lib/i18n";

export default function NotFound() {
  return (
    <>
      <Nav solid />
      <main className="page" style={{ textAlign: "center", display: "grid", placeItems: "center" }}>
        <div><span className="eyebrow">404</span><h1 style={{ fontSize: "clamp(2.4rem,7vw,4.4rem)", margin: ".6rem 0 1.4rem" }}>{T.it.nf[0]} <em>{T.it.nf[1]}</em></h1><a className="btn" href="/">{T.it.home}</a> <a className="btn ghost" href="/en">English</a></div>
      </main>
    </>
  );
}
