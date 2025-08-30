"use client"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, MessageSquare, Clock, CheckCircle, XCircle, Eye } from "lucide-react"

interface Offer {
  id: string
  requester_id: string
  book_id: string
  status: string
  message: string
  selected_candidates: string[]
  created_at: string
  books?: any
  profiles?: any
}

interface OfferCardProps {
  offer: Offer
  type: "incoming" | "outgoing"
  userId: string
}

const statusConfig = {
  pending: {
    label: "Pending Review",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  candidates_selected: {
    label: "Candidates Selected",
    icon: MessageSquare,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  contact_revealed: {
    label: "Contact Revealed",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
}

export function OfferCard({ offer, type, userId }: OfferCardProps) {
  const status = statusConfig[offer.status as keyof typeof statusConfig] || statusConfig.pending
  const StatusIcon = status.icon

  // Get the relevant user and book data based on offer type
  const otherUser = type === "incoming" ? offer.profiles : offer.books?.profiles
  const book = type === "incoming" ? offer.books : offer.books

  const userInitials =
    otherUser?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() ||
    otherUser?.username?.[0]?.toUpperCase() ||
    "U"

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            {/* User Avatar */}
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>

            {/* Offer Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">
                  {type === "incoming"
                    ? `${otherUser?.full_name || otherUser?.username} wants to trade for`
                    : `Your offer for`}
                </h3>
                <Badge variant="secondary" className={status.color}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {status.label}
                </Badge>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                  {book?.photo_urls?.[0] ? (
                    <img
                      src={book.photo_urls[0] || "/placeholder.svg"}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{book?.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">by {book?.author}</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{offer.message}</p>

              <p className="text-xs text-muted-foreground">
                {new Date(offer.created_at).toLocaleDateString()} • {offer.selected_candidates.length} book
                {offer.selected_candidates.length !== 1 ? "s" : ""} offered
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Link href={`/offers/${offer.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <Eye className="mr-2 h-3 w-3" />
              View Details
            </Button>
          </Link>

          {type === "incoming" && offer.status === "pending" && (
            <Link href={`/offers/${offer.id}`}>
              <Button size="sm">Review Offer</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
