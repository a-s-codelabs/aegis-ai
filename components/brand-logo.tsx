"use client"

import * as React from "react"

type ShieldLockLogoProps = {
  /** Overall height in pixels; width scales with the viewBox */
  size?: number
  className?: string
}

/**
 * Brand shield + lock icon used across the app.
 * Based on the provided design with a teal shield and inner lock.
 */
export function ShieldLockLogo({ size = 80, className }: ShieldLockLogoProps) {
  const dimension = `${size}px`

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 64 72"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield background – wider, flat top, soft bottom */}
      <path
        d="M32 6L52 13V30C52 41.5 42.5 52 32 56C21.5 52 12 41.5 12 30V13L32 6Z"
        fill="#2dd4bf"
      />
      {/* Very subtle inner glow */}
      <circle cx="32" cy="30" r="20" fill="url(#innerGlow)" />
      {/* Lock body */}
      <rect
        x="25"
        y="26"
        width="14"
        height="13"
        rx="3"
        fill="#022c22"
      />
      {/* Lock shackle */}
      <path
        d="M27 26V23.5C27 21.3 28.8 19.5 31 19.5C33.2 19.5 35 21.3 35 23.5V26"
        fill="none"
        stroke="#022c22"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Keyhole */}
      <circle cx="32" cy="32.3" r="2" fill="#2dd4bf" />
      <path
        d="M32 34.6V37.5"
        stroke="#2dd4bf"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <defs>
        <radialGradient
          id="innerGlow"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(32 30) rotate(90) scale(20)"
        >
          <stop stopColor="#2dd4bf" stopOpacity="0.22" />
          <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}


