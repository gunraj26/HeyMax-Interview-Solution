"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, MessageSquare, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface BookWithOwner {
  id: string
  title: string
  author: string
  profiles: {
    id: string
    username: string
    full_name?: string
  }
}

interface UserBook {
  id: string
  title: string
  author: string
  condition: string
  photo_urls?: string[]
}

interface MakeOfferDialogProps {
  book: BookWithOwner
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MakeOfferDialog({ book, open, onOpenChange }: MakeOfferDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userBooks, setUserBooks] = useState<UserBook[]>([])
  const [selectedBooks, setSelectedBooks] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      checkAuthAndLoadBooks()
    }
  }, [open])

  const checkAuthAndLoadBooks = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/login?redirectTo=/book/${book.id}`)
      return
    }

    setUser(user)

    // Load user's books for trade candidates
    const { data: books, error } = await supabase
      .from("books")
      .select("id, title, author, condition, photo_urls")
      .eq("owner_id", user.id)
      .eq("is_listed", true)

    if (error) {
      console.error("Error loading user books:", error)
    } else {
      setUserBooks(books || [])
    }
  }

  const handleBookSelection = (bookId: string, checked: boolean) => {
    if (checked) {
      setSelectedBooks((prev) => [...prev, bookId])
    } else {
      setSelectedBooks((prev) => prev.filter((id) => id !== bookId))
    }
  }

  const handleSubmit = async (formData: FormData) => {
    if (!user) {
      router.push(`/login?redirectTo=/book/${book.id}`)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const message = formData.get("message") as string

      if (selectedBooks.length === 0) {
        setError("Please select at least one book to offer in exchange")
        return
      }

      const { data, error: offerError } = await supabase
        .from("offers")
        .insert({
          requester_id: user.id,
          book_id: book.id,
          message,
          selected_candidates: selectedBooks,
          status: "pending",
        })
        .select()
        .single()

      if (offerError) throw offerError

      onOpenChange(false)
      router.push("/offers")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Make Trade Offer
          </DialogTitle>
          <DialogDescription>
            Send a trade offer to {book.profiles.full_name || book.profiles.username} for "{book.title}"
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Hi! I'm interested in trading for your book. I'd like to offer the books I've selected below..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Select Books to Offer (Choose at least one)</Label>
            {userBooks.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">You don't have any books listed for trading yet.</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 bg-transparent"
                    onClick={() => {
                      onOpenChange(false)
                      router.push("/vault")
                    }}
                  >
                    Add Books to Your Vault
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {userBooks.map((userBook) => (
                  <Card key={userBook.id} className="cursor-pointer hover:bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`book-${userBook.id}`}
                          checked={selectedBooks.includes(userBook.id)}
                          onCheckedChange={(checked) => handleBookSelection(userBook.id, checked as boolean)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex gap-3">
                            <div className="w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                              {userBook.photo_urls?.[0] ? (
                                <img
                                  src={userBook.photo_urls[0] || "/placeholder.svg"}
                                  alt={userBook.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm line-clamp-2">{userBook.title}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-1">{userBook.author}</p>
                              <p className="text-xs text-muted-foreground capitalize">{userBook.condition}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || userBooks.length === 0}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Offer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
