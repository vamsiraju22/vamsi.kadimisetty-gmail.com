import React from 'react';

export const HourglassIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-cyan-400"
  >
    <style>{`
      .hourglass-group {
        /* Animation to flip the hourglass */
        animation: hourglass-flip 4s ease-in-out infinite;
        transform-origin: 12px 12px;
      }
      .sand-top-clip {
        /* Animation to drain top sand */
        animation: sand-drain 4s linear infinite;
      }
      .sand-bottom-clip {
        /* Animation to fill bottom sand */
        animation: sand-fill 4s linear infinite;
      }
      .sand-stream {
        /* Animation for the sand stream visibility */
        animation: stream-flow 4s linear infinite;
      }

      @keyframes hourglass-flip {
        0%   { transform: rotate(0deg); }
        90%  { transform: rotate(0deg); } /* Hold until sand falls */
        100% { transform: rotate(180deg); }
      }

      @keyframes sand-drain {
        0%   { transform: translateY(0); }
        5%   { transform: translateY(0); } /* Initial hold */
        85%  { transform: translateY(6px); } /* Sand drains over this period */
        100% { transform: translateY(6px); }
      }

      @keyframes sand-fill {
        0%   { transform: translateY(6px); }
        15%  { transform: translateY(6px); } /* Delay before filling starts */
        95%  { transform: translateY(0); } /* Sand fills over this period */
        100% { transform: translateY(0); }
      }
      
      @keyframes stream-flow {
        0%   { opacity: 0; }
        5%   { opacity: 1; } /* Stream appears */
        85%  { opacity: 1; } /* Stream visible */
        86%  { opacity: 0; } /* Stream disappears */
        100% { opacity: 0; }
      }
    `}</style>

    <g className="hourglass-group">
      {/* Hourglass Frame */}
      <path d="M5 22h14" />
      <path d="M5 2h14" />
      <path d="M17 2v6.5L12 12 7 8.5V2" />
      <path d="M7 22v-6.5L12 12l5 3.5V22" />

      {/* Define clipping paths for sand animation */}
      <defs>
        <clipPath id="clip-sand-top">
          <rect className="sand-top-clip" x="7" y="2.5" width="10" height="7" />
        </clipPath>
        <clipPath id="clip-sand-bottom">
          <rect className="sand-bottom-clip" x="7" y="14.5" width="10" height="7" />
        </clipPath>
      </defs>

      {/* Top Sand (is clipped by the animated rect) */}
      <g clipPath="url(#clip-sand-top)">
        <path d="M7 2.5 L 17 2.5 L 12 9 Z" fill="currentColor" />
      </g>
      
      {/* Bottom Sand (is clipped by the animated rect) */}
      <g clipPath="url(#clip-sand-bottom)">
        <path d="M12 15 L 7 21.5 L 17 21.5 Z" fill="currentColor" />
      </g>

      {/* Sand Stream */}
      <path d="M 12 9 V 15" stroke="currentColor" strokeWidth="1" className="sand-stream" />
    </g>
  </svg>
);
