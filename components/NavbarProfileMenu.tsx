"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import Avatar from "./Avatar";

type NavbarProfileMenuProps = {
  nickname: string;
};

export default function NavbarProfileMenu({ nickname }: NavbarProfileMenuProps) {
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    firstItemRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }

      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

      const items = containerRef.current?.querySelectorAll<HTMLAnchorElement>(
        '[role="menuitem"]',
      );
      if (!items || items.length === 0) return;

      e.preventDefault();
      const currentIndex = Array.from(items).findIndex(
        (item) => item === document.activeElement,
      );
      const nextIndex =
        e.key === "ArrowDown"
          ? (currentIndex + 1) % items.length
          : (currentIndex - 1 + items.length) % items.length;
      items[nextIndex]?.focus();
    }

    function onPointerDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  const itemClassName =
    "block w-full px-4 py-2.5 text-left text-sm text-petrolio hover:bg-petrolio/5 focus:outline-none focus-visible:bg-petrolio/5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-petrolio/30";

  return (
    <div ref={containerRef} className="relative ml-1 shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Menu profilo di @${nickname}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        className="rounded-full ring-1 ring-petrolio/10 transition hover:ring-petrolio/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-petrolio/40"
      >
        <Avatar nickname={nickname} size={32} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Menu profilo"
          className="absolute right-0 top-full z-30 mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-petrolio/10 bg-crema py-1 shadow-soft"
        >
          <Link
            ref={firstItemRef}
            href="/profilo"
            role="menuitem"
            onClick={closeMenu}
            className={itemClassName}
          >
            Il mio profilo
          </Link>
          <Link
            href="/profilo#impostazioni"
            role="menuitem"
            onClick={closeMenu}
            className={itemClassName}
          >
            Impostazioni
          </Link>

          <div
            role="separator"
            aria-hidden
            className="my-1 border-t border-petrolio/10"
          />

          <Link
            href="/aiuto"
            role="menuitem"
            onClick={closeMenu}
            className={`${itemClassName} text-amber-900/80 hover:bg-amber-50/80 focus-visible:bg-amber-50/80`}
          >
            Serve aiuto urgente?
          </Link>
        </div>
      )}
    </div>
  );
}
