import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { BookDetail } from "@/components/book/book-detail"

interface BookPageProps {
  params: {
    id: string
  }
}

export default async function BookPage({ params }: BookPageProps) {
  const supabase = await createClient()

  // Fetch book details with owner information
  const { data: book, error } = await supabase
    .from("books")
    .select(`
      *,
      profiles:owner_id (
        id,
        username,
        full_name,
        bio,
        location,
        avatar_url
      )
    `)
    .eq("id", params.id)
    .eq("is_listed", true) // Only show publicly listed books
    .single()

  if (error || !book) {
    notFound()
  }

  // Get other books by the same owner
  const { data: otherBooks } = await supabase
    .from("books")
    .select("id, title, author, photo_urls, condition")
    .eq("owner_id", book.owner_id)
    .eq("is_listed", true)
    .neq("id", params.id)
    .limit(4)

  return (
    <div className="min-h-screen bg-background">
      <BookDetail book={book} otherBooks={otherBooks || []} />
    </div>
  )
}
