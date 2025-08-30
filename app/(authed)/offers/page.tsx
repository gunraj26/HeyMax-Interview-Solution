import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OffersManager } from "@/components/offers/offers-manager"

export default async function OffersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch incoming offers (offers on user's books)
  const { data: incomingOffers, error: incomingError } = await supabase
    .from("offers")
    .select(`
      *,
      books!inner (
        id,
        title,
        author,
        photo_urls,
        owner_id
      ),
      profiles:requester_id (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("books.owner_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch outgoing offers (offers user made)
  const { data: outgoingOffers, error: outgoingError } = await supabase
    .from("offers")
    .select(`
      *,
      books (
        id,
        title,
        author,
        photo_urls,
        owner_id,
        profiles:owner_id (
          username,
          full_name,
          avatar_url
        )
      )
    `)
    .eq("requester_id", user.id)
    .order("created_at", { ascending: false })

  if (incomingError || outgoingError) {
    console.error("Error fetching offers:", incomingError || outgoingError)
  }

  return (
    <div className="min-h-screen bg-background">
      <OffersManager incomingOffers={incomingOffers || []} outgoingOffers={outgoingOffers || []} userId={user.id} />
    </div>
  )
}
