import { Suspense } from "react";
import Nav from "@/components/Nav";
import Booking from "./Booking";

export const metadata = { title: "Prenota direttamente" };

export default function Page() {
  return (
    <>
      <Nav solid />
      <main className="page"><div className="wrap" style={{ maxWidth: 860 }}>
        <span className="eyebrow">Prenotazione diretta</span>
        <h1 style={{ fontSize: "clamp(2.2rem,6vw,3.6rem)", margin: ".5rem 0 1.5rem" }}>Verifica disponibilità</h1>
        <Suspense><Booking /></Suspense>
      </div></main>
    </>
  );
}
