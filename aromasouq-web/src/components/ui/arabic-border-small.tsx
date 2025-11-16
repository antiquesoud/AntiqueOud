/**
 * Small Arabic Geometric Border Pattern Component
 * Compact version for product cards and smaller sections
 */

export function ArabicBorderSmall({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-3 sm:h-4 bg-[#ECDBC7] ${className}`}>
      <svg
        className="w-full h-full"
        viewBox="0 0 1400 50"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="arabicPatternSmall" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            {/* Central diamond */}
            <path d="M25 15 L30 20 L25 25 L20 20 Z" fill="#550000" />

            {/* Side decorations */}
            <path d="M8 25 L10 23 L12 25 L10 27 Z" fill="#550000" opacity="0.7" />
            <path d="M38 25 L40 23 L42 25 L40 27 Z" fill="#550000" opacity="0.7" />

            {/* Small dots */}
            <circle cx="5" cy="15" r="1" fill="#550000" opacity="0.6" />
            <circle cx="45" cy="15" r="1" fill="#550000" opacity="0.6" />
            <circle cx="5" cy="35" r="1" fill="#550000" opacity="0.6" />
            <circle cx="45" cy="35" r="1" fill="#550000" opacity="0.6" />

            {/* Connecting lines */}
            <path d="M12 25 L20 17 M20 33 L12 25" stroke="#550000" strokeWidth="0.8" opacity="0.5" />
            <path d="M38 25 L30 17 M30 33 L38 25" stroke="#550000" strokeWidth="0.8" opacity="0.5" />
          </pattern>
        </defs>

        {/* Top border line */}
        <rect x="0" y="0" width="1400" height="2" fill="#550000" />

        {/* Pattern fill */}
        <rect x="0" y="2" width="1400" height="46" fill="url(#arabicPatternSmall)" />

        {/* Bottom border line */}
        <rect x="0" y="48" width="1400" height="2" fill="#550000" />
      </svg>
    </div>
  );
}
