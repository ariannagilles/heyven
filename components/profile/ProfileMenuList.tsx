import Link from "next/link";
import MentorApplicationProfileRow from "./MentorApplicationProfileRow";

type RowProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  mint?: boolean;
  showDivider?: boolean;
};

function ProfileMenuRow({
  href,
  label,
  icon,
  mint = false,
  showDivider = true,
}: RowProps) {
  return (
    <>
      {showDivider && (
        <div className="mx-4 border-t border-cream/10" aria-hidden />
      )}
      <Link
        href={href}
        className={
          "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-cream/[0.04] active:bg-cream/[0.06] " +
          (mint ? "text-mint" : "text-cream")
        }
      >
        <span
          className={
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl " +
            (mint ? "bg-mint/10 text-mint" : "bg-cream/5 text-cream/75")
          }
          aria-hidden
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1 text-[15px] leading-snug">{label}</span>
        <span className="shrink-0 text-lg leading-none text-cream/35" aria-hidden>
          ›
        </span>
      </Link>
    </>
  );
}

export default function ProfileMenuList() {
  return (
    <nav aria-label="Profilo">
      <div className="glass-card overflow-hidden py-1">
        <ProfileMenuRow
          href="/profilo/contenuti"
          label="I tuoi contenuti"
          icon={<IconContents />}
          showDivider={false}
        />
        <MentorApplicationProfileRow />
        <ProfileMenuRow
          href="/profilo/impostazioni"
          label="Impostazioni e privacy"
          icon={<IconSettings />}
        />
        <ProfileMenuRow
          href="/aiuto"
          label="Serve aiuto urgente?"
          icon={<IconHelp />}
          mint
        />
      </div>
    </nav>
  );
}

function IconContents() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function IconHelp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v.01M9.5 9.5a2.5 2.5 0 1 1 4.2 1.8c-.8.7-1.2 1.2-1.2 2.2" />
    </svg>
  );
}
