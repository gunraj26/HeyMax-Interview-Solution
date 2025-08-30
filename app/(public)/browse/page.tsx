import { createClient } from "@/lib/supabase/server"
import { BrowseBooks } from "@/components/browse/browse-books"

export default async function BrowsePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch all publicly listed books excluding current user's books
  const { data: books, error } = await supabase
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
    .neq("owner_id", user?.id || "")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching books:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <BrowseBooks initialBooks={books || []} />
    </div>
  )
}
