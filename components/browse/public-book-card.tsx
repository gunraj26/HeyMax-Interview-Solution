"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, MapPin, User } from "lucide-react"

interface BookWithOwner {
  id: string
  title: string
  author: string
  condition: "excellent" | "good" | "fair" | "poor"
  description?: string
  genre?: string
  photo_urls?: string[]
  profiles: {
    username: string
    full_name?: string
    location?: string
  }
}

interface PublicBookCardProps {
  book: BookWithOwner
}

const conditionColors = {
  excellent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  good: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  fair: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  poor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function PublicBookCard({ book }: PublicBookCardProps) {
  const primaryImage = book.photo_urls?.[0]

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="aspect-[3/4] bg-muted rounded-md mb-3 overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage || "/placeholder.svg"}
              alt={`Cover of ${book.title}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">{book.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">by {book.author}</p>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Condition and Genre */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={conditionColors[book.condition]}>
              {book.condition}
            </Badge>
            {book.genre && (
              <Badge variant="outline" className="text-xs">
                {book.genre}
              </Badge>
            )}
          </div>

          {/* Owner Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">{book.profiles.full_name || book.profiles.username}</span>
            {book.profiles.location && (
              <>
                <MapPin className="h-3 w-3 ml-1" />
                <span className="truncate">{book.profiles.location}</span>
              </>
            )}
          </div>

          {/* Description */}
          {book.description && <p className="text-xs text-muted-foreground line-clamp-2">{book.description}</p>}

          {/* Action Button */}
          <Link href={`/book/${book.id}`} className="block">
            <Button className="w-full" size="sm">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
