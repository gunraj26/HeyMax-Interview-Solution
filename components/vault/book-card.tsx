"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, EyeOff, MoreVertical, Edit, Trash2, BookOpen } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { EditBookDialog } from "./edit-book-dialog"
import { DeleteBookDialog } from "./delete-book-dialog"

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

interface BookCardProps {
  book: Book
  onUpdate: (book: Book) => void
  onDelete: (bookId: string) => void
}

const conditionColors = {
  excellent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  good: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  fair: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  poor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function BookCard({ book, onUpdate, onDelete }: BookCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()

  const toggleListing = async () => {
    setIsUpdating(true)
    try {
      const { data, error } = await supabase
        .from("books")
        .update({ is_listed: !book.is_listed })
        .eq("id", book.id)
        .select()
        .single()

      if (error) throw error
      onUpdate(data)
    } catch (error) {
      console.error("Error updating book listing:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const primaryImage = book.photo_urls?.[0]

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">{book.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">by {book.author}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={toggleListing} disabled={isUpdating}>
                  {book.is_listed ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Make Private
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      List for Trade
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Book Cover */}
          <div className="aspect-[3/4] bg-muted rounded-md mb-3 overflow-hidden">
            {primaryImage ? (
              <img
                src={primaryImage || "/placeholder.svg"}
                alt={`Cover of ${book.title}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className={conditionColors[book.condition]}>
                {book.condition}
              </Badge>
              <Badge variant={book.is_listed ? "default" : "secondary"}>
                {book.is_listed ? (
                  <>
                    <Eye className="mr-1 h-3 w-3" />
                    Listed
                  </>
                ) : (
                  <>
                    <EyeOff className="mr-1 h-3 w-3" />
                    Private
                  </>
                )}
              </Badge>
            </div>

            {book.genre && <p className="text-xs text-muted-foreground">{book.genre}</p>}

            {book.description && <p className="text-xs text-muted-foreground line-clamp-2">{book.description}</p>}
          </div>
        </CardContent>
      </Card>

      <EditBookDialog book={book} open={isEditOpen} onOpenChange={setIsEditOpen} onBookUpdated={onUpdate} />

      <DeleteBookDialog book={book} open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onBookDeleted={onDelete} />
    </>
  )
}
