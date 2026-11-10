import PrivacyPage from "@/components/PrivacyPage";

export const metadata = { title: "Privacy e cookie", alternates: { canonical: "/privacy", languages: { it: "/privacy", en: "/en/privacy" } } };

export default function Privacy() {
  return <PrivacyPage lang="it" />;
}
