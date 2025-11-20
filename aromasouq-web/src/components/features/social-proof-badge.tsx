'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Users, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SocialProofNotification {
  id: string
  type: 'purchase' | 'viewers' | 'trending'
  message: string
  timestamp: Date
}

export function SocialProofBadges() {
  const [notification, setNotification] = useState<SocialProofNotification | null>(null)

  useEffect(() => {
    // Simulate real-time notifications (in production, use WebSocket or SSE)
    const notifications: SocialProofNotification[] = [
      {
        id: '1',
        type: 'purchase',
        message: 'Someone from Dubai just purchased "Oud Majestic"',
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'viewers',
        message: '12 people are viewing this product',
        timestamp: new Date(),
      },
      {
        id: '3',
        type: 'trending',
        message: 'Trending now - 45 sold today',
        timestamp: new Date(),
      },
    ]

    let currentIndex = 0

    const interval = setInterval(() => {
      setNotification(notifications[currentIndex])
      currentIndex = (currentIndex + 1) % notifications.length

      // Hide after 4 seconds
      setTimeout(() => setNotification(null), 4000)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 left-6 z-50 max-w-sm"
        >
          <Badge
            variant="outline"
            className="bg-white shadow-lg border-oud-gold/30 p-4 flex items-center gap-3"
          >
            {notification.type === 'purchase' && (
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-green-600" />
              </div>
            )}
            {notification.type === 'viewers' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            )}
            {notification.type === 'trending' && (
              <div className="w-8 h-8 rounded-full bg-oud-gold/20 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-oud-gold" />
              </div>
            )}
            <span className="text-sm text-gray-700">{notification.message}</span>
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
