export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="crossGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#bfdbfe" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Shield shape */}
      <path
        d="M16 2L4 7V16C4 22.6 9.4 28.6 16 30C22.6 28.6 28 22.6 28 16V7L16 2Z"
        fill="url(#shieldGrad)"
      />

      {/* Inner shield highlight (top-left glow) */}
      <path
        d="M16 4.5L6 8.8V16C6 21.4 10.4 26.6 16 28.2C21.6 26.6 26 21.4 26 16V8.8L16 4.5Z"
        fill="white"
        fillOpacity="0.08"
      />

      {/* Cross / plus symbol */}
      {/* Vertical bar */}
      <rect x="13.5" y="9" width="5" height="14" rx="1.5" fill="url(#crossGrad)" />
      {/* Horizontal bar */}
      <rect x="9" y="13.5" width="14" height="5" rx="1.5" fill="url(#crossGrad)" />
    </svg>
  );
}
