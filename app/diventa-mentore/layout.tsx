import MentorSectionChrome from "@/components/mentor/MentorSectionChrome";

export default function DiventaMentoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MentorSectionChrome>{children}</MentorSectionChrome>;
}
