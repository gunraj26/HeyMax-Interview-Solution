"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Calendar, CheckCircle, ArrowLeft } from "lucide-react"
import { AuthButton } from "@/components/auth/auth-button"

interface ExchangeHistoryProps {
  exchanges: any[]
  currentUserId: string
}

export function ExchangeHistory({ exchanges, currentUserId }: ExchangeHistoryProps) {
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
          </div>
          <AuthButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/offers"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Offers
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Exchange History</h1>
          <p className="text-muted-foreground">View all your completed book exchanges and trade history.</p>
        </div>

        {exchanges.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Completed Exchanges</h3>
              <p className="text-muted-foreground mb-4">You haven't completed any book exchanges yet.</p>
              <Link href="/browse" className="inline-flex items-center gap-2 text-primary hover:underline">
                <BookOpen className="h-4 w-4" />
                Browse Books to Trade
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {exchanges.map((exchange) => {
              const isRequester = exchange.requester_id === currentUserId
              const otherUser = isRequester ? exchange.owner_profile : exchange.requester_profile
              const userInitials =
                otherUser?.full_name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase() ||
                otherUser?.username?.[0]?.toUpperCase() ||
                "U"

              return (
                <Card key={exchange.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={otherUser?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            Exchange with {otherUser?.full_name || otherUser?.username}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-4 w-4" />
                            Completed {new Date(exchange.completed_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Requested Book */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm">{isRequester ? "You Received" : "You Gave"}</h4>
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <div className="w-12 h-16 bg-background rounded overflow-hidden">
                            {exchange.requested_books?.photo_urls?.[0] ? (
                              <img
                                src={exchange.requested_books.photo_urls[0] || "/placeholder.svg"}
                                alt={exchange.requested_books.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h5 className="font-medium text-sm">{exchange.requested_books?.title}</h5>
                            <p className="text-xs text-muted-foreground">by {exchange.requested_books?.author}</p>
                          </div>
                        </div>
                      </div>

                      {/* Offered Books Count */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm">{isRequester ? "You Gave" : "You Received"}</h4>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{exchange.offered_book_ids?.length || 0} book(s) exchanged</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {exchange.offers?.message && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold mb-2 text-sm">Original Message</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                          {exchange.offers.message}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
