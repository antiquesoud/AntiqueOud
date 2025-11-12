'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971501234567'

interface WhatsAppButtonProps {
  product?: {
    nameEn: string
    brand?: { nameEn: string }
    slug: string
    regularPrice: number
  }
  orderId?: string
  message?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function WhatsAppButton({
  product,
  orderId,
  message: customMessage,
  variant = 'default',
  size = 'default',
  className,
}: WhatsAppButtonProps) {
  const getMessage = () => {
    if (customMessage) return customMessage

    if (product) {
      if (typeof window !== 'undefined') {
        return `Hi! I'm interested in *${product.nameEn}* ${product.brand ? `(${product.brand.nameEn})` : ''}.\n\nProduct Link: ${window.location.origin}/products/${product.slug}\nPrice: AED ${product.regularPrice}\n\nCould you provide more details?`
      }
      return `Hi! I'm interested in *${product.nameEn}* ${product.brand ? `(${product.brand.nameEn})` : ''}.\n\nCould you provide more details?`
    }

    if (orderId) {
      return `Hi! I have a question about my order #${orderId}.`
    }

    return 'Hi! I need assistance with Antique Oud.'
  }

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(getMessage())
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      WhatsApp Us
    </Button>
  )
}
