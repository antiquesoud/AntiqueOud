"use client"

import React, { useState, useRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LensProps {
  children: React.ReactNode
  lensSize?: number
  zoomFactor?: number
  className?: string
}

export function Lens({ children, lensSize = 150, zoomFactor = 2, className }: LensProps) {
  const [showLens, setShowLens] = useState(false)
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setLensPosition({ x, y })
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden cursor-zoom-in", className)}
      onMouseEnter={() => setShowLens(true)}
      onMouseLeave={() => setShowLens(false)}
      onMouseMove={handleMouseMove}
    >
      {children}

      {showLens && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute rounded-full border-2 border-[#B3967D] pointer-events-none"
          style={{
            width: `${lensSize}px`,
            height: `${lensSize}px`,
            left: `${lensPosition.x - lensSize / 2}px`,
            top: `${lensPosition.y - lensSize / 2}px`,
            backgroundImage: `url(${(children as any)?.props?.src || ''})`,
            backgroundSize: `${zoomFactor * 100}%`,
            backgroundPosition: `-${(lensPosition.x - lensSize / 2) * zoomFactor}px -${(lensPosition.y - lensSize / 2) * zoomFactor}px`,
          }}
        />
      )}
    </div>
  )
}
