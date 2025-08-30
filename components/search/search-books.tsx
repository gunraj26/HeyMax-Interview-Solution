"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Search, Loader2 } from "lucide-react"
import { PublicBookCard } from "@/components/browse/public-book-card"
import { AuthButton } from "@/components/auth/auth-button"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface BookWithOwner {
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
  profiles: {
    username: string
    full_name?: string
    location?: string
  }
}

interface SearchBooksProps {
  availableGenres: string[]
}

export function SearchBooks({ availableGenres }: SearchBooksProps) {
  const [searchResults, setSearchResults] = useState<BookWithOwner[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const supabase = createClient()

  const handleSearch = async (formData: FormData) => {
    setIsLoading(true)
    setHasSearched(true)

    try {
      const title = formData.get("title") as string
      const author = formData.get("author") as string
      const isbn = formData.get("isbn") as string
      const genre = formData.get("genre") as string
      const condition = formData.get("condition") as string
      const location = formData.get("location") as string

      let query = supabase
        .from("books")
        .select(`
          *,
          profiles:owner_id (
            username,
            full_name,
            location
          )
        `)
        .eq("is_listed", true)

      // Apply filters
      if (title) {
        query = query.ilike("title", `%${title}%`)
      }
      if (author) {
        query = query.ilike("author", `%${author}%`)
      }
      if (isbn) {
        query = query.ilike("isbn", `%${isbn}%`)
      }
      if (genre && genre !== "all") {
        query = query.eq("genre", genre)
      }
      if (condition && condition !== "all") {
        query = query.eq("condition", condition)
      }

      const { data: books, error } = await query.order("created_at", { ascending: false })

      if (error) throw error

      // Filter by location if specified (client-side since it's in profiles)
      let filteredBooks = books || []
      if (location) {
        filteredBooks = filteredBooks.filter((book) =>
          book.profiles.location?.toLowerCase().includes(location.toLowerCase()),
        )
      }

      setSearchResults(filteredBooks)
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
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
              <Link href="/search" className="text-foreground font-medium">
                Search
              </Link>
            </nav>
          </div>
          <AuthButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Advanced Search</h1>
          <p className="text-muted-foreground">Find specific books using detailed search criteria</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Criteria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Book Title</Label>
                  <Input id="title" name="title" placeholder="Enter book title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input id="author" name="author" placeholder="Enter author name" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input id="isbn" name="isbn" placeholder="Enter ISBN" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select name="genre">
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genres</SelectItem>
                      {availableGenres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select name="condition">
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Conditions</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Owner Location</Label>
                <Input id="location" name="location" placeholder="Enter city or region" />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Search Books
                </Button>
                <Link href="/browse">
                  <Button type="button" variant="outline">
                    Browse All
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {hasSearched && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Search Results ({searchResults.length})</h2>
            </div>

            {searchResults.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No books found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse all available books
                </p>
                <Link href="/browse">
                  <Button>Browse All Books</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((book) => (
                  <PublicBookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
