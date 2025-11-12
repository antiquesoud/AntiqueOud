'use client'

import { motion } from 'framer-motion'

interface ScentPyramidProps {
  topNotes: string[]
  heartNotes: string[]
  baseNotes: string[]
  compact?: boolean
}

export function ScentPyramid({ topNotes, heartNotes, baseNotes, compact = false }: ScentPyramidProps) {
  const size = compact ? { width: 300, height: 240 } : { width: 400, height: 320 }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="text-center">
          <h3 className="text-lg font-playfair font-bold text-deep-navy">Scent Profile</h3>
          <p className="text-sm text-muted-foreground">Fragrance notes pyramid</p>
        </div>
      )}

      <div className="flex justify-center">
        <svg
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          className="drop-shadow-md"
        >
          {/* Top Notes (Triangle Top) */}
          <motion.path
            d={`M ${size.width / 2} 20 L ${size.width * 0.25} ${size.height * 0.35} L ${size.width * 0.75} ${size.height * 0.35} Z`}
            fill="url(#gradientTop)"
            stroke="#B3967D"
            strokeWidth="2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
          />

          {/* Heart Notes (Triangle Middle) */}
          <motion.path
            d={`M ${size.width * 0.25} ${size.height * 0.35} L ${size.width * 0.75} ${size.height * 0.35} L ${size.width * 0.85} ${size.height * 0.65} L ${size.width * 0.15} ${size.height * 0.65} Z`}
            fill="url(#gradientHeart)"
            stroke="#B3967D"
            strokeWidth="2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />

          {/* Base Notes (Triangle Bottom) */}
          <motion.path
            d={`M ${size.width * 0.15} ${size.height * 0.65} L ${size.width * 0.85} ${size.height * 0.65} L ${size.width * 0.95} ${size.height * 0.95} L ${size.width * 0.05} ${size.height * 0.95} Z`}
            fill="url(#gradientBase)"
            stroke="#B3967D"
            strokeWidth="2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="gradientTop" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E8DCC4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#B3967D" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="gradientHeart" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#B3967D" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#B8946A" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="gradientBase" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#B8946A" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8B7355" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Labels */}
          <text x={size.width / 2} y={size.height * 0.25} textAnchor="middle" className="fill-deep-navy font-medium text-xs">
            TOP NOTES
          </text>
          <text x={size.width / 2} y={size.height * 0.5} textAnchor="middle" className="fill-deep-navy font-medium text-xs">
            HEART NOTES
          </text>
          <text x={size.width / 2} y={size.height * 0.8} textAnchor="middle" className="fill-deep-navy font-medium text-xs">
            BASE NOTES
          </text>
        </svg>
      </div>

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <p className="text-xs font-medium text-oud-gold uppercase">Top Notes</p>
          <p className="text-sm text-gray-600">{topNotes.join(', ')}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-oud-gold uppercase">Heart Notes</p>
          <p className="text-sm text-gray-600">{heartNotes.join(', ')}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-oud-gold uppercase">Base Notes</p>
          <p className="text-sm text-gray-600">{baseNotes.join(', ')}</p>
        </div>
      </div>
    </div>
  )
}
