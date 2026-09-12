import type { ReactNode } from "react";

type WeatherIconProps = { className?: string; size?: number };

function WeatherSvg({
  className,
  size = 20,
  children,
}: WeatherIconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function StormIcon(props: WeatherIconProps) {
  return (
    <WeatherSvg {...props}>
      <path d="M6.2 15.2h9.6c1.7 0 3.1-1.3 3.1-3s-1.3-3.1-3-3.2c-.4-2.1-2.2-3.7-4.4-3.7-1.7 0-3.2.9-4 2.2-.3-.1-.7-.2-1.1-.2-1.6 0-2.9 1.3-2.9 2.9 0 .3 0 .6.2.9" />
      <path d="M11.6 13.6 9.8 17.2h2.1L10.4 21.2" />
    </WeatherSvg>
  );
}

export function CloudIcon(props: WeatherIconProps) {
  return (
    <WeatherSvg {...props}>
      <path d="M6 16.4h11.2c1.8 0 3.3-1.4 3.3-3.2S19 10 17.3 9.9c-.4-2.3-2.4-4-4.8-4-1.8 0-3.4 1-4.3 2.4-.4-.2-.9-.3-1.4-.3-1.8 0-3.3 1.5-3.3 3.3 0 .4.1.8.2 1.1" />
    </WeatherSvg>
  );
}

export function VariableIcon(props: WeatherIconProps) {
  return (
    <WeatherSvg {...props}>
      <circle cx="8.2" cy="8" r="2.1" />
      <path d="M8.2 4.4v.8M8.2 11v.8M4.6 8h.8M11 8h.8" />
      <path d="M7.4 16.6h9.4c1.5 0 2.8-1.2 2.8-2.7s-1.2-2.8-2.7-2.8c-.3-1.8-1.9-3.2-3.8-3.2-1.4 0-2.6.7-3.3 1.8" />
    </WeatherSvg>
  );
}

export function ClearIcon(props: WeatherIconProps) {
  return (
    <WeatherSvg {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 6.2v1.1M12 16.7v1.1M6.2 12h1.1M16.7 12h1.1" />
    </WeatherSvg>
  );
}

export function SunIcon(props: WeatherIconProps) {
  return (
    <WeatherSvg {...props}>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 3.6v2.1M12 18.3v2.1M3.6 12h2.1M18.3 12h2.1M6.1 6.1l1.5 1.5M16.4 16.4l1.5 1.5M6.1 17.9l1.5-1.5M16.4 7.6l1.5-1.5" />
    </WeatherSvg>
  );
}

export type { WeatherIconProps };
