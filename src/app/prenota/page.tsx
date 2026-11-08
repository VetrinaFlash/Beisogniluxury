import { Suspense } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Booking from "./Booking";

export const metadata = { title: "Prenota direttamente", description: "Verifica la disponibilità e prenota direttamente al Bei Sogni Luxury, B&B nel centro di Cosenza. Nessuna commissione, paghi in struttura." };

export default function Page() {
  return (
    <>
      <Nav solid />
      <main className="page"><div className="wrap" style={{ maxWidth: 940 }}>
        <div className="page-head">
          <span className="eyebrow">Prenotazione diretta</span>
          <h1>Scegli le date, <em>al resto pensiamo noi</em></h1>
        </div>
        <Suspense fallback={<div className="skel" />}><Booking /></Suspense>
      </div></main>
      <Footer />
    </>
  );
}
