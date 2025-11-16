/**
 * Arabic Geometric Border Pattern Component
 * Traditional Middle Eastern border design
 */

export function ArabicBorder({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-6 sm:h-8 md:h-10 lg:h-12 xl:h-14 bg-[#ECDBC7] ${className}`}>
      <svg
        className="w-full h-full"
        viewBox="0 0 1400 100"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="arabicPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            {/* Central star/diamond */}
            <path d="M50 20 L60 30 L50 40 L40 30 Z" fill="#550000" />
            <path d="M50 60 L60 70 L50 80 L40 70 Z" fill="#550000" />

            {/* Side diamonds */}
            <path d="M15 50 L20 45 L25 50 L20 55 Z" fill="#550000" />
            <path d="M75 50 L80 45 L85 50 L80 55 Z" fill="#550000" />

            {/* Connecting lines */}
            <path d="M25 50 L40 35 M40 65 L25 50" stroke="#550000" strokeWidth="1.5" />
            <path d="M75 50 L60 35 M60 65 L75 50" stroke="#550000" strokeWidth="1.5" />

            {/* Small corner decorations */}
            <circle cx="10" cy="25" r="2" fill="#550000" />
            <circle cx="90" cy="25" r="2" fill="#550000" />
            <circle cx="10" cy="75" r="2" fill="#550000" />
            <circle cx="90" cy="75" r="2" fill="#550000" />

            {/* Cross pattern */}
            <path d="M47 27 L53 27 L53 33 L47 33 Z M47 67 L53 67 L53 73 L47 73 Z" fill="#550000" opacity="0.7" />

            {/* Geometric zigzag */}
            <path d="M30 15 L35 20 L30 25 M70 15 L65 20 L70 25" stroke="#550000" strokeWidth="2" opacity="0.8" />
            <path d="M30 75 L35 80 L30 85 M70 75 L65 80 L70 85" stroke="#550000" strokeWidth="2" opacity="0.8" />

            {/* Additional small diamonds for density */}
            <path d="M35 50 L37 48 L39 50 L37 52 Z" fill="#550000" opacity="0.6" />
            <path d="M61 50 L63 48 L65 50 L63 52 Z" fill="#550000" opacity="0.6" />
          </pattern>
        </defs>

        {/* Top border line */}
        <rect x="0" y="0" width="1400" height="4" fill="#550000" />

        {/* Pattern fill */}
        <rect x="0" y="4" width="1400" height="92" fill="url(#arabicPattern)" />

        {/* Bottom border line */}
        <rect x="0" y="96" width="1400" height="4" fill="#550000" />
      </svg>
    </div>
  );
}
