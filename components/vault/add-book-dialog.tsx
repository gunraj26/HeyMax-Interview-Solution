"use client"

import type React from "react"

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
import { Loader2, Upload, X } from "lucide-react"
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

interface AddBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookAdded: (book: Book) => void
  userId: string
}

export function AddBookDialog({ open, onOpenChange, onBookAdded, userId }: AddBookDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
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
      const contactEmail = formData.get("contactEmail") as string
      const contactPhone = formData.get("contactPhone") as string
      const contactSocial = formData.get("contactSocial") as string

      // Upload images if any
      const photoUrls: string[] = []
      for (const image of selectedImages) {
        const fileExt = image.name.split(".").pop()
        const fileName = `${userId}/${Date.now()}-${Math.random()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("book-photos")
          .upload(fileName, image)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("book-photos").getPublicUrl(fileName)

        photoUrls.push(publicUrl)
      }

      // Insert book record
      const { data, error: insertError } = await supabase
        .from("books")
        .insert({
          owner_id: userId,
          title,
          author,
          isbn: isbn || null,
          condition,
          description: description || null,
          genre: genre || null,
          photo_urls: photoUrls,
          is_listed: isListed,
          contact_email: contactEmail || null,
          contact_phone: contactPhone || null,
          contact_social: contactSocial || null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      onBookAdded(data)
      onOpenChange(false)

      // Reset form
      setSelectedImages([])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedImages((prev) => [...prev, ...files].slice(0, 5)) // Max 5 images
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
          <DialogDescription>
            Add a book to your personal vault. You can choose to list it for trading or keep it private.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input id="author" name="author" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input id="isbn" name="isbn" placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition *</Label>
              <Select name="condition" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
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
            <Input id="genre" name="genre" placeholder="e.g., Fiction, Mystery, Romance" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief description or notes about the book"
              rows={3}
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <div>
              <Label className="text-base font-semibold">Contact Information</Label>
              <p className="text-sm text-muted-foreground">
                This information will be shared with traders when you accept their offers
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input id="contactEmail" name="contactEmail" type="email" placeholder="your@email.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone</Label>
              <Input id="contactPhone" name="contactPhone" type="tel" placeholder="+1 (555) 123-4567" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactSocial">Social Media / Other</Label>
              <Input id="contactSocial" name="contactSocial" placeholder="Instagram, Discord, etc." />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Photos (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Click to upload book photos
                  <br />
                  <span className="text-xs">Max 5 images, up to 10MB each</span>
                </p>
              </label>
            </div>

            {selectedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image) || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* List for Trading Toggle */}
          <div className="flex items-center space-x-2">
            <Switch id="isListed" name="isListed" defaultChecked />
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
              Add Book
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
