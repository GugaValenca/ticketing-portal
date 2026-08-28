import { COMPANY_NAME } from "../branding";

export function BrandMark({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={`${COMPANY_NAME} logo`}
    >
      <defs>
        <linearGradient id="nexa-brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d946ef" />
          <stop offset="55%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#nexa-brand-gradient)" />
      <path d="M19 44V20h4l14 17V20h8v24h-4L27 27v17h-8Z" fill="white" fillOpacity="0.95" />
      <path d="M47 17c3 1 5 3 6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      <path d="M47 12c5 1 9 4 11 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
