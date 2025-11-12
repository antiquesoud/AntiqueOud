"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  className?: string
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  const isPositiveTrend = trend && trend.value > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <h3 className="text-3xl font-bold mt-2">{value}</h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}
              {trend && (
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isPositiveTrend ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {isPositiveTrend ? "↑" : "↓"} {Math.abs(trend.value)}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {trend.label}
                  </span>
                </div>
              )}
            </div>
            {Icon && (
              <div className="p-3 rounded-lg bg-[#B3967D]/10">
                <Icon className="w-6 h-6 text-[#B3967D]" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
