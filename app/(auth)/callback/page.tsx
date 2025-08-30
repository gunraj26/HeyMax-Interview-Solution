import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function CallbackPage({
  searchParams,
}: {
  searchParams: { code?: string; next?: string }
}) {
  const { code, next } = searchParams

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const redirectTo = next ?? "/vault"
      redirect(redirectTo)
    }
  }

  // Return to login if something went wrong
  redirect("/login")
}
