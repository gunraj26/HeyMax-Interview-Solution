import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { OfferDetail } from "@/components/offers/offer-detail"

interface OfferPageProps {
  params: {
    id: string
  }
}

export default async function OfferPage({ params }: OfferPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch offer details with all related data
  const { data: offer, error } = await supabase
    .from("offers")
    .select(`
      *,
      books (
        *,
        profiles:owner_id (
          id,
          username,
          full_name,
          bio,
          location,
          avatar_url,
          contact_email,
          contact_phone,
          contact_social
        )
      ),
      profiles:requester_id (
        id,
        username,
        full_name,
        bio,
        location,
        avatar_url,
        contact_email,
        contact_phone,
        contact_social
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !offer) {
    notFound()
  }

  // Check if user is authorized to view this offer
  const isOwner = offer.books.profiles.id === user.id
  const isRequester = offer.requester_id === user.id

  if (!isOwner && !isRequester) {
    notFound()
  }

  // Fetch candidate books if any are selected
  let candidateBooks = []
  if (offer.selected_candidates && offer.selected_candidates.length > 0) {
    const { data: candidates } = await supabase.from("books").select("*").in("id", offer.selected_candidates)

    candidateBooks = candidates || []
  }

  // Fetch messages for this offer
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      profiles:sender_id (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("offer_id", params.id)
    .order("created_at", { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      <OfferDetail
        offer={offer}
        candidateBooks={candidateBooks}
        messages={messages || []}
        currentUserId={user.id}
        userRole={isOwner ? "owner" : "requester"}
      />
    </div>
  )
}
