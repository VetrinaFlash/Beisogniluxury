import BookingPage from "@/components/BookingPage";
import { T } from "@/lib/i18n";

export const metadata = { title: T.en.meta.bookTitle, description: T.en.meta.bookDesc, alternates: { canonical: "/en/book", languages: { it: "/prenota", en: "/en/book" } } };

export default function Page() {
  return <BookingPage lang="en" />;
}
