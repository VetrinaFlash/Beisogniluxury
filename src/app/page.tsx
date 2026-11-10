import HomePage from "@/components/HomePage";

export const dynamic = "force-dynamic";
export const metadata = { alternates: { canonical: "/", languages: { it: "/", en: "/en" } } };

export default function Home() {
  return <HomePage lang="it" />;
}
