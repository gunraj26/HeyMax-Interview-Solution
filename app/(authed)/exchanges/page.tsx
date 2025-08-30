import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ExchangeHistory } from "@/components/exchanges/exchange-history"

export default async function ExchangesPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user's exchange history
  const { data: exchanges } = await supabase
    .from("exchanges")
    .select(`
      *,
      offers (
        message,
        created_at
      ),
      requested_books:books!exchanges_requested_book_id_fkey (
        title,
        author,
        photo_urls
      ),
      requester_profile:profiles!exchanges_requester_id_fkey (
        username,
        full_name,
        avatar_url
      ),
      owner_profile:profiles!exchanges_owner_id_fkey (
        username,
        full_name,
        avatar_url
      )
    `)
    .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`)
    .order("completed_at", { ascending: false })

  return <ExchangeHistory exchanges={exchanges || []} currentUserId={user.id} />
}
