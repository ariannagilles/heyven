import Link from "next/link";

type UrgentHelpLinkProps = {
  className?: string;
};

export default function UrgentHelpLink({ className = "" }: UrgentHelpLinkProps) {
  return (
    <Link
      href="/aiuto"
      className={`text-petrolio/60 hover:text-petrolio underline-offset-2 hover:underline transition ${className}`}
    >
      Serve aiuto urgente?
    </Link>
  );
}
