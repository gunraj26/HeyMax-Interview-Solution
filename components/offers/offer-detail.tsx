"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BookOpen,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { AuthButton } from "@/components/auth/auth-button"
import { createClient } from "@/lib/supabase/client"

interface OfferDetailProps {
  offer: any
  candidateBooks: any[]
  currentUserId: string
  userRole: "owner" | "requester"
}

const statusConfig = {
  pending: {
    label: "Pending Review",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  candidates_selected: {
    label: "Candidates Selected",
    icon: CheckCircle,
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
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
}

export function OfferDetail({ offer, candidateBooks, currentUserId, userRole }: OfferDetailProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<string>("")
  const supabase = createClient()

  const status = statusConfig[offer.status as keyof typeof statusConfig] || statusConfig.pending
  const StatusIcon = status.icon
  const otherUser = userRole === "owner" ? offer.profiles : offer.books.profiles
  const book = offer.books

  const selectedBookId = offer.selected_candidates?.[0]
  const selectedBook = selectedBookId ? candidateBooks.find((b) => b.id === selectedBookId) : null

  const contactPerson = otherUser
  const contactInfo =
    userRole === "requester"
      ? {
          // If I'm the requester, show the requested book's contact info
          email: book?.contact_email,
          phone: book?.contact_phone,
          social: book?.contact_social,
        }
      : selectedBook
        ? {
            // If I'm the owner and there's a selected book, show that book's contact info
            email: selectedBook.contact_email,
            phone: selectedBook.contact_phone,
            social: selectedBook.contact_social,
          }
        : {
            // Fallback: If I'm the owner but no book selected yet, show requester's general contact
            email: otherUser?.email,
            phone: otherUser?.phone,
            social: otherUser?.social_profile,
          }

  const userInitials =
    otherUser?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() ||
    otherUser?.username?.[0]?.toUpperCase() ||
    "U"

  const contactInitials =
    contactPerson?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() ||
    contactPerson?.username?.[0]?.toUpperCase() ||
    "U"

  const handleSelectCandidates = async () => {
    if (!selectedCandidate) {
      setError("Please select a book to proceed")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from("offers")
        .update({
          status: "candidates_selected",
          selected_candidates: [selectedCandidate],
        })
        .eq("id", offer.id)

      if (updateError) throw updateError

      window.location.reload()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectTrade = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase.from("offers").update({ status: "rejected" }).eq("id", offer.id)

      if (updateError) throw updateError

      window.location.reload()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevealContact = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from("offers")
        .update({ status: "contact_revealed" })
        .eq("id", offer.id)

      if (updateError) throw updateError

      window.location.reload()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteExchange = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: offerError } = await supabase.from("offers").update({ status: "completed" }).eq("id", offer.id)

      if (offerError) throw offerError

      const { error: exchangeError } = await supabase.from("exchanges").insert({
        offer_id: offer.id,
        requester_confirmed: true,
        owner_confirmed: true,
        completed_at: new Date().toISOString(),
      })

      if (exchangeError) throw exchangeError

      const bookIds = [offer.book_id, ...(offer.selected_candidates || [])]
      const { error: booksError } = await supabase
        .from("books")
        .update({
          is_listed: false,
        })
        .in("id", bookIds)

      if (booksError) throw booksError

      window.location.reload()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const canSelectCandidates = userRole === "owner" && offer.status === "pending"
  const canRevealContact = userRole === "owner" && offer.status === "candidates_selected"
  const contactRevealed = offer.status === "contact_revealed" || offer.status === "completed"
  const canCompleteExchange = contactRevealed && offer.status !== "completed"
  const canReject = userRole === "owner" && (offer.status === "pending" || offer.status === "candidates_selected")

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
        <Link
          href="/offers"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Offers
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Offer Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={otherUser?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-xl font-bold mb-1">
                        Trade Offer {userRole === "owner" ? "from" : "to"} {otherUser?.full_name || otherUser?.username}
                      </h1>
                      <p className="text-muted-foreground text-sm">
                        Created {new Date(offer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={status.color}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Requested Book</h3>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-12 h-16 bg-background rounded overflow-hidden">
                        {book?.photo_urls?.[0] ? (
                          <img
                            src={book.photo_urls[0] || "/placeholder.svg"}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{book?.title}</h4>
                        <p className="text-sm text-muted-foreground">by {book?.author}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Initial Message</h3>
                    <p className="text-muted-foreground bg-muted p-3 rounded-lg">{offer.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candidate Books */}
            <Card>
              <CardHeader>
                <CardTitle>Offered Books ({candidateBooks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {candidateBooks.length === 0 ? (
                  <p className="text-muted-foreground">No books offered yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {candidateBooks.map((book) => (
                      <div key={book.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        {canSelectCandidates && (
                          <input
                            type="radio"
                            name="selectedBook"
                            checked={selectedCandidate === book.id}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCandidate(book.id)
                              }
                            }}
                            className="rounded"
                          />
                        )}
                        <div className="w-12 h-16 bg-muted rounded overflow-hidden">
                          {book.photo_urls?.[0] ? (
                            <img
                              src={book.photo_urls[0] || "/placeholder.svg"}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{book.title}</h4>
                          <p className="text-xs text-muted-foreground">{book.author}</p>
                          <p className="text-xs text-muted-foreground capitalize">{book.condition}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {canSelectCandidates && candidateBooks.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex gap-2">
                      <Button onClick={handleSelectCandidates} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Select This Book & Continue
                      </Button>
                      <Button variant="outline" onClick={handleRejectTrade} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Reject Trade
                      </Button>
                    </div>
                  </div>
                )}

                {canReject && offer.status === "candidates_selected" && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      <Button onClick={handleRevealContact} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Reveal Contact & Proceed
                      </Button>
                      <Button variant="outline" onClick={handleRejectTrade} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Reject Trade
                      </Button>
                    </div>
                  </div>
                )}

                {canRevealContact && !canReject && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-4">
                      Ready to proceed with the trade? Reveal your contact information to finalize the exchange.
                    </p>
                    <Button onClick={handleRevealContact} disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Reveal Contact & Proceed
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {canCompleteExchange && (
              <Card>
                <CardHeader>
                  <CardTitle>Complete Exchange</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Ready to Complete Exchange?</h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                      Once you've met in person and exchanged books, mark this trade as complete. This will update both
                      books as exchanged and create a permanent record.
                    </p>
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button
                      onClick={handleCompleteExchange}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Exchange Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {offer.status === "completed" && (
              <Card>
                <CardContent className="pt-6">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Exchange Completed!</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      This trade has been successfully completed on {new Date(offer.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {offer.status === "rejected" && (
              <Card>
                <CardContent className="pt-6">
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                    <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">Trade Rejected</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      This trade offer was rejected on {new Date(offer.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {contactRevealed && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contactPerson?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{contactInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{contactPerson?.full_name || contactPerson?.username}</p>
                      <p className="text-sm text-muted-foreground">@{contactPerson?.username}</p>
                    </div>
                  </div>

                  {contactPerson?.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{contactPerson.location}</span>
                    </div>
                  )}

                  {contactInfo?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${contactInfo.email}`} className="text-primary hover:underline">
                        {contactInfo.email}
                      </a>
                    </div>
                  )}

                  {contactInfo?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${contactInfo.phone}`} className="text-primary hover:underline">
                        {contactInfo.phone}
                      </a>
                    </div>
                  )}

                  {contactInfo?.social && (
                    <div className="flex items-center gap-2 text-sm">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={contactInfo.social}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Social Profile
                      </a>
                    </div>
                  )}

                  {contactPerson?.bio && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">{contactPerson.bio}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {offer.status === "pending" && userRole === "owner" && (
                    <p className="text-muted-foreground">
                      Review the offered books and select which one you'd like to trade for.
                    </p>
                  )}
                  {offer.status === "pending" && userRole === "requester" && (
                    <p className="text-muted-foreground">Waiting for the book owner to review your offer.</p>
                  )}
                  {offer.status === "candidates_selected" && userRole === "owner" && (
                    <p className="text-muted-foreground">
                      You've selected a book for the trade. Reveal your contact information to proceed.
                    </p>
                  )}
                  {offer.status === "candidates_selected" && userRole === "requester" && (
                    <p className="text-muted-foreground">
                      The owner has selected a book for the trade. Waiting for contact information.
                    </p>
                  )}
                  {contactRevealed && offer.status !== "completed" && (
                    <>
                      <p className="text-muted-foreground">
                        Contact information has been shared. Use the chat below to coordinate the book exchange.
                      </p>
                      <div className="space-y-2">
                        <p className="font-medium text-xs">Exchange Tips:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Agree on a safe meeting location</li>
                          <li>• Verify book condition in person</li>
                          <li>• Mark exchange as complete when done</li>
                        </ul>
                      </div>
                    </>
                  )}
                  {offer.status === "completed" && (
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                      <p className="font-medium text-green-900 dark:text-green-100">Trade Complete!</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed on {new Date(offer.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
