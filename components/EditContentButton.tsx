type Props = {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

export default function EditContentButton({
  onClick,
  disabled = false,
  className = "",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Modifica contenuto"
      className={
        "inline-flex items-center justify-center w-7 h-7 rounded-full text-petrolio/35 hover:text-petrolio/70 hover:bg-petrolio/5 transition disabled:opacity-40 " +
        className
      }
    >
      <PencilIcon />
    </button>
  );
}

function PencilIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
