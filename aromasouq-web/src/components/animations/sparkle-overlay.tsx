"use client"

import React from 'react';

interface SparkleOverlayProps {
  density?: 'light' | 'medium' | 'heavy';
  color?: string;
  className?: string;
}

export function SparkleOverlay({
  density = 'medium',
  color = '#B3967D',
  className = ''
}: SparkleOverlayProps) {
  const sparkleCount = density === 'light' ? 3 : density === 'medium' ? 5 : 8;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {[...Array(sparkleCount)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full animate-sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: color,
            boxShadow: `0 0 ${4 + Math.random() * 4}px ${color}`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

// Shimmer effect component
export function ShimmerOverlay({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
           style={{ transform: 'translateX(-100%)' }} />
    </div>
  );
}

// Glow effect component
export function GlowEffect({
  color = '#B3967D',
  intensity = 'medium',
  className = ''
}: {
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}) {
  const glowSize = intensity === 'low' ? '20px' : intensity === 'medium' ? '40px' : '60px';
  const glowOpacity = intensity === 'low' ? 0.3 : intensity === 'medium' ? 0.5 : 0.7;

  return (
    <div
      className={`absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ${className}`}
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        boxShadow: `0 0 ${glowSize} ${color}`,
        opacity: 0,
      }}
    />
  );
}
