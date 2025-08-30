import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BookVault } from "@/components/vault/book-vault"

export default async function VaultPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user's books
  const { data: books, error } = await supabase
    .from("books")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching books:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <BookVault initialBooks={books || []} userId={user.id} />
    </div>
  )
}
