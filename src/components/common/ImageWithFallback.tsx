/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`w-full h-full bg-[#F8F4EA] flex flex-col items-center justify-center p-4 border border-[#E4DFD1] text-center select-none ${fallbackClassName} ${className}`}
        role="img"
        aria-label={alt || 'BARVAKA Product'}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-25"
        >
          <rect x="5" y="5" width="90" height="90" rx="20" stroke="#0F3B2E" strokeWidth="3" />
          <path
            d="M32 26H51C60 26 67 31 67 38.5C67 44.5 62 48.5 56 49.5C63.5 50.8 69 55.5 69 63.5C69 71.5 61.5 76 52 76H32V26ZM42 45H51C55.5 45 58.5 42.5 58.5 38.5C58.5 34.5 55.5 32 51 32H42V45ZM42 70H52C57 70 60.5 67 60.5 62.5C60.5 58 57 55 52 55H42V70Z"
            fill="#0F3B2E"
          />
          <path d="M62 26C65 21 72 19 76 21C77 25 74 32 68 34C68 30 65 27 62 26Z" fill="#B8963E" />
        </svg>
        <span className="font-serif text-xs font-semibold text-[#0F3B2E]/40 tracking-widest uppercase mt-2">
          BARVAKA
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'BARVAKA Item'}
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
};
