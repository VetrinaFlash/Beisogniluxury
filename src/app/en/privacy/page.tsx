import PrivacyPage from "@/components/PrivacyPage";

export const metadata = { title: "Privacy & cookies", alternates: { canonical: "/en/privacy", languages: { it: "/privacy", en: "/en/privacy" } } };

export default function Page() {
  return <PrivacyPage lang="en" />;
}
