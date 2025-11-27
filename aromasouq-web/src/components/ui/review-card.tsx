"use client"

import React, { useState } from "react"
import Image from "next/image"
import { ThumbsUp, ThumbsDown, Flag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, formatRelativeTime } from "@/lib/utils"

interface ReviewCardProps {
  review: {
    id: string
    userName: string
    userAvatar?: string
    rating: number
    title?: string
    comment: string
    createdAt: string
    helpfulCount: number
    notHelpfulCount: number
    verified?: boolean
    images?: string[]
    vendorReply?: {
      text: string
      repliedAt: string
    }
  }
  onVote?: (reviewId: string, voteType: 'helpful' | 'not_helpful') => void
  onReport?: (reviewId: string) => void
  className?: string
}

export function ReviewCard({
  review,
  onVote,
  onReport,
  className,
}: ReviewCardProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src={review.userAvatar} />
              <AvatarFallback>{review.userName[0]}</AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{review.userName}</span>
                {review.verified && (
                  <Badge variant="outline" className="text-xs">
                    Verified Purchase
                  </Badge>
                )}
              </div>

              {/* Rating Stars */}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "text-sm",
                        i < review.rating ? "text-amber-400" : "text-gray-300"
                      )}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(review.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Report Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReport?.(review.id)}
          >
            <Flag className="w-4 h-4" />
          </Button>
        </div>

        {/* Title */}
        {review.title && (
          <h4 className="font-semibold mt-4">{review.title}</h4>
        )}

        {/* Comment */}
        <p className="mt-2 text-sm text-foreground/90 leading-relaxed">
          {review.comment}
        </p>

        {/* Images */}
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mt-4">
            {review.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image)}
                className="relative w-20 h-20 rounded-lg overflow-hidden hover:ring-2 hover:ring-[#B3967D] transition-all"
              >
                <Image
                  src={image}
                  alt={`Review image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Helpful Buttons */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVote?.(review.id, 'helpful')}
            className="gap-2"
          >
            <ThumbsUp className="w-4 h-4" />
            Helpful ({review.helpfulCount})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVote?.(review.id, 'not_helpful')}
            className="gap-2"
          >
            <ThumbsDown className="w-4 h-4" />
            ({review.notHelpfulCount})
          </Button>
        </div>

        {/* Vendor Reply */}
        {review.vendorReply && (
          <div className="mt-4 ml-12 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Vendor Reply</Badge>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(review.vendorReply.repliedAt)}
              </span>
            </div>
            <p className="text-sm">{review.vendorReply.text}</p>
          </div>
        )}
      </CardContent>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <Image
              src={selectedImage}
              alt="Review image"
              width={1200}
              height={800}
              className="object-contain"
            />
          </div>
        </div>
      )}
    </Card>
  )
}
