import React from 'react';
import { usePortalNavigation } from './navigation-context';

export interface BackButtonProps {
  label?: string;
  ariaLabel?: string;
  fallbackHash?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Standard, consistent Back navigation button integrated cleanly inside portal
 * and onboarding headers (`card page-head` / `.ph-top`) without overflowing.
 */
export function BackButton({
  label = 'Back',
  ariaLabel,
  fallbackHash,
  onClick,
  className,
}: BackButtonProps) {
  const { backTarget, goBack } = usePortalNavigation();

  const resolvedAriaLabel =
    ariaLabel ||
    (backTarget.backLabel && backTarget.backLabel !== 'Back'
      ? `Back to ${backTarget.backLabel}`
      : label);

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    goBack(fallbackHash);
  };

  return (
    <button
      type="button"
      className={`std-back-btn${className ? ` ${className}` : ''}`}
      onClick={handleClick}
      aria-label={resolvedAriaLabel}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10 3.5L5.5 8l4.5 4.5" />
      </svg>
      <span className="std-back-text">{label}</span>
    </button>
  );
}
