import BookingPage from "@/components/BookingPage";
import { T } from "@/lib/i18n";

export const metadata = { title: T.it.meta.bookTitle, description: T.it.meta.bookDesc, alternates: { canonical: "/prenota", languages: { it: "/prenota", en: "/en/book" } } };

export default function Page() {
  return <BookingPage lang="it" />;
}
