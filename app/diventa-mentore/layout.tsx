import MentorSectionChrome from "@/components/mentor/MentorSectionChrome";

export default function DiventaMentoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mb-28">
      <MentorSectionChrome>{children}</MentorSectionChrome>
    </div>
  );
}
