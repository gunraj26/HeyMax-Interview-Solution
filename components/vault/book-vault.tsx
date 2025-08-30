"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Plus, Search, Eye, EyeOff } from "lucide-react"
import { BookCard } from "./book-card"
import { AddBookDialog } from "./add-book-dialog"
import { AuthButton } from "@/components/auth/auth-button"
import Link from "next/link"

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

interface BookVaultProps {
  initialBooks: Book[]
  userId: string
}

export function BookVault({ initialBooks, userId }: BookVaultProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "listed" | "unlisted">("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.genre?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "listed" && book.is_listed) ||
      (filterStatus === "unlisted" && !book.is_listed)

    return matchesSearch && matchesFilter
  })

  const listedCount = books.filter((book) => book.is_listed).length
  const totalCount = books.length

  const handleBookAdded = (newBook: Book) => {
    setBooks((prev) => [newBook, ...prev])
  }

  const handleBookUpdated = (updatedBook: Book) => {
    setBooks((prev) => prev.map((book) => (book.id === updatedBook.id ? updatedBook : book)))
  }

  const handleBookDeleted = (bookId: string) => {
    setBooks((prev) => prev.filter((book) => book.id !== bookId))
  }

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
              <Link href="/offers" className="text-muted-foreground hover:text-foreground">
                Offers
              </Link>
            </nav>
          </div>
          <AuthButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Book Vault</h1>
            <p className="text-muted-foreground">
              Manage your personal library and control what's available for trading
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Books</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Listed for Trade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{listedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Private</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{totalCount - listedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search your books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filterStatus === "listed" ? "default" : "outline"}
              onClick={() => setFilterStatus("listed")}
              size="sm"
            >
              <Eye className="mr-1 h-3 w-3" />
              Listed
            </Button>
            <Button
              variant={filterStatus === "unlisted" ? "default" : "outline"}
              onClick={() => setFilterStatus("unlisted")}
              size="sm"
            >
              <EyeOff className="mr-1 h-3 w-3" />
              Private
            </Button>
          </div>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {books.length === 0 ? "No books yet" : "No books match your search"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {books.length === 0
                ? "Start building your library by adding your first book"
                : "Try adjusting your search or filter criteria"}
            </p>
            {books.length === 0 && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Book
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} onUpdate={handleBookUpdated} onDelete={handleBookDeleted} />
            ))}
          </div>
        )}
      </div>

      <AddBookDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onBookAdded={handleBookAdded}
        userId={userId}
      />
    </>
  )
}
