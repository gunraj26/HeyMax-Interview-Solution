"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { BookOpen, MapPin, ArrowLeft, MessageSquare, Calendar } from "lucide-react"
import { AuthButton } from "@/components/auth/auth-button"
import { MakeOfferDialog } from "@/components/offers/make-offer-dialog"

interface BookWithOwner {
  id: string
  title: string
  author: string
  isbn?: string
  condition: "excellent" | "good" | "fair" | "poor"
  description?: string
  genre?: string
  photo_urls?: string[]
  created_at: string
  profiles: {
    id: string
    username: string
    full_name?: string
    bio?: string
    location?: string
    avatar_url?: string
  }
}

interface OtherBook {
  id: string
  title: string
  author: string
  photo_urls?: string[]
  condition: string
}

interface BookDetailProps {
  book: BookWithOwner
  otherBooks: OtherBook[]
}

const conditionColors = {
  excellent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  good: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  fair: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  poor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function BookDetail({ book, otherBooks }: BookDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false)

  const images = book.photo_urls || []
  const ownerInitials =
    book.profiles.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || book.profiles.username[0].toUpperCase()

  return (
    <>
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">LeafLoop</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/browse" className="text-muted-foreground hover:text-foreground">
                Browse
              </Link>
            </nav>
          </div>
          <AuthButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Book Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[selectedImageIndex] || "/placeholder.svg"}
                  alt={`${book.title} - Image ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-20 rounded border-2 overflow-hidden ${
                      selectedImageIndex === index ? "border-primary" : "border-muted"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">by {book.author}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className={conditionColors[book.condition]}>
                  {book.condition} condition
                </Badge>
                {book.genre && <Badge variant="outline">{book.genre}</Badge>}
              </div>

              {book.isbn && (
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>ISBN:</strong> {book.isbn}
                </p>
              )}

              <p className="text-sm text-muted-foreground">
                <Calendar className="inline h-4 w-4 mr-1" />
                Listed {new Date(book.created_at).toLocaleDateString()}
              </p>
            </div>

            {book.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{book.description}</p>
              </div>
            )}

            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Book Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={book.profiles.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{ownerInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{book.profiles.full_name || book.profiles.username}</h4>
                    <p className="text-sm text-muted-foreground">@{book.profiles.username}</p>
                    {book.profiles.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {book.profiles.location}
                      </p>
                    )}
                    {book.profiles.bio && <p className="text-sm text-muted-foreground mt-2">{book.profiles.bio}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Button */}
            <Button size="lg" className="w-full" onClick={() => setIsOfferDialogOpen(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Make Trade Offer
            </Button>
          </div>
        </div>

        {/* Other Books by Owner */}
        {otherBooks.length > 0 && (
          <div>
            <Separator className="mb-8" />
            <h2 className="text-2xl font-bold mb-6">
              More books by {book.profiles.full_name || book.profiles.username}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {otherBooks.map((otherBook) => (
                <Link key={otherBook.id} href={`/book/${otherBook.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-[3/4] bg-muted rounded mb-2 overflow-hidden">
                        {otherBook.photo_urls?.[0] ? (
                          <img
                            src={otherBook.photo_urls[0] || "/placeholder.svg"}
                            alt={otherBook.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">{otherBook.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{otherBook.author}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <MakeOfferDialog book={book} open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen} />
    </>
  )
}
