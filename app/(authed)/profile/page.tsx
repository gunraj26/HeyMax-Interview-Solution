import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileEditor } from "@/components/profile/profile-editor"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user profile
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching profile:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfileEditor initialProfile={profile} userId={user.id} userEmail={user.email || ""} />
    </div>
  )
}
