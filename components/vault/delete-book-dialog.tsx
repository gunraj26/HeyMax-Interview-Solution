"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  condition: "excellent" | "good" | "fair" | "poor"
  description?: string
  genre?: string
  photo_urls?: string[]
  is_listed: boolean
  created_at: string
  updated_at: string
}

interface DeleteBookDialogProps {
  book: Book
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookDeleted: (bookId: string) => void
}

export function DeleteBookDialog({ book, open, onOpenChange, onBookDeleted }: DeleteBookDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleDelete = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Delete associated images from storage
      if (book.photo_urls && book.photo_urls.length > 0) {
        const imagePaths = book.photo_urls.map((url) => {
          const urlParts = url.split("/")
          return urlParts.slice(-2).join("/") // Get the last two parts (userId/filename)
        })

        const { error: storageError } = await supabase.storage.from("book-photos").remove(imagePaths)

        if (storageError) {
          console.warn("Error deleting images:", storageError)
          // Continue with book deletion even if image deletion fails
        }
      }

      // Delete the book record
      const { error: deleteError } = await supabase.from("books").delete().eq("id", book.id)

      if (deleteError) throw deleteError

      onBookDeleted(book.id)
      onOpenChange(false)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Book
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{book.title}" by {book.author}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Book
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
