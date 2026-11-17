import React from 'react';

interface LogoProps {
  size?: number;
  variant?: 'pin' | 'house';
}

export const Logo: React.FC<LogoProps> = ({ size = 40, variant = 'house' }) => {
  if (variant === 'pin') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M24 4C14.611 4 7 11.611 7 21C7 32.5 24 44 24 44C24 44 41 32.5 41 21C41 11.611 33.389 4 24 4Z"
          fill="#E7F6EE"
          stroke="#0E9F5D"
          strokeWidth="2.4"
        />
        <path
          d="M15.5 22.5L24 15L32.5 22.5V30H15.5V22.5Z"
          fill="#FFFFFF"
          stroke="#0E9F5D"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M24 10L25.2 12.8L28 14L25.2 15.2L24 18L22.8 15.2L20 14L22.8 12.8L24 10Z" fill="#0E9F5D" />
      </svg>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-xl bg-[#E7F6EE] border border-[#0E9F5D]/20 flex items-center justify-center shrink-0"
    >
      <svg
        width={Math.round(size * 0.68)}
        height={Math.round(size * 0.68)}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M5 14.5L16 5L27 14.5V26C27 26.552 26.552 27 26 27H6C5.448 27 5 26.552 5 26V14.5Z"
          fill="#FFFFFF"
          stroke="#112A1E"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M12 27V19H20V27"
          stroke="#0E9F5D"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22.5 8L23.4 10.1L25.5 11L23.4 11.9L22.5 14L21.6 11.9L19.5 11L21.6 10.1L22.5 8Z"
          fill="#0E9F5D"
        />
      </svg>
    </div>
  );
};
