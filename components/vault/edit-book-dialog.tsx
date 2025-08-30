"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
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

interface EditBookDialogProps {
  book: Book
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookUpdated: (book: Book) => void
}

export function EditBookDialog({ book, open, onOpenChange, onBookUpdated }: EditBookDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const title = formData.get("title") as string
      const author = formData.get("author") as string
      const isbn = formData.get("isbn") as string
      const condition = formData.get("condition") as string
      const description = formData.get("description") as string
      const genre = formData.get("genre") as string
      const isListed = formData.get("isListed") === "on"

      const { data, error: updateError } = await supabase
        .from("books")
        .update({
          title,
          author,
          isbn: isbn || null,
          condition,
          description: description || null,
          genre: genre || null,
          is_listed: isListed,
        })
        .eq("id", book.id)
        .select()
        .single()

      if (updateError) throw updateError

      onBookUpdated(data)
      onOpenChange(false)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogDescription>Update your book details and listing status.</DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" defaultValue={book.title} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input id="author" name="author" defaultValue={book.author} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input id="isbn" name="isbn" defaultValue={book.isbn || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition *</Label>
              <Select name="condition" defaultValue={book.condition} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Input id="genre" name="genre" defaultValue={book.genre || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={book.description || ""} rows={3} />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="isListed" name="isListed" defaultChecked={book.is_listed} />
            <Label htmlFor="isListed">List for trading (make publicly visible)</Label>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
