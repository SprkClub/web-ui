"use client";

export default function GoldenCheckmark({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="25%" stopColor="#FFC125" />
          <stop offset="50%" stopColor="#FFB90F" />
          <stop offset="75%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>
        <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFACD" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <filter id="goldShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#FFD700" floodOpacity="0.5" />
        </filter>
      </defs>
      {/* Outer badge shape */}
      <path
        d="M11 1L13.5 3.5L17 3L17.5 6.5L20.5 8.5L19 11.5L20.5 14.5L17.5 16.5L17 20L13.5 19.5L11 22L8.5 19.5L5 20L4.5 16.5L1.5 14.5L3 11.5L1.5 8.5L4.5 6.5L5 3L8.5 3.5L11 1Z"
        fill="url(#goldGradient)"
        filter="url(#goldShadow)"
      />
      {/* Inner shine */}
      <path
        d="M11 3L12.8 5L15.5 4.6L15.8 7.3L18.2 8.8L17 11L18.2 13.2L15.8 14.7L15.5 17.4L12.8 17L11 19L9.2 17L6.5 17.4L6.2 14.7L3.8 13.2L5 11L3.8 8.8L6.2 7.3L6.5 4.6L9.2 5L11 3Z"
        fill="url(#goldShine)"
        opacity="0.3"
      />
      {/* Checkmark */}
      <path
        d="M7.5 11L10 13.5L15 8.5"
        stroke="#1a1a1a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
