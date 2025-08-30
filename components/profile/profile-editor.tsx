"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, User, Mail, Loader2, Camera } from "lucide-react"
import { AuthButton } from "@/components/auth/auth-button"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Profile {
  id: string
  username: string
  full_name?: string
  bio?: string
  location?: string
  avatar_url?: string
  contact_email?: string
  contact_phone?: string
  contact_social?: string
}

interface ProfileEditorProps {
  initialProfile: Profile | null
  userId: string
  userEmail: string
}

export function ProfileEditor({ initialProfile, userId, userEmail }: ProfileEditorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const username = formData.get("username") as string
      const fullName = formData.get("fullName") as string
      const bio = formData.get("bio") as string
      const location = formData.get("location") as string
      const contactEmail = formData.get("contactEmail") as string
      const contactPhone = formData.get("contactPhone") as string
      const contactSocial = formData.get("contactSocial") as string

      const profileData = {
        username,
        full_name: fullName || null,
        bio: bio || null,
        location: location || null,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
        contact_social: contactSocial || null,
      }

      if (initialProfile) {
        // Update existing profile
        const { error: updateError } = await supabase.from("profiles").update(profileData).eq("id", userId)

        if (updateError) throw updateError
      } else {
        // Create new profile
        const { error: insertError } = await supabase.from("profiles").insert({ id: userId, ...profileData })

        if (insertError) throw insertError
      }

      setSuccess("Profile updated successfully!")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const userInitials =
    initialProfile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    initialProfile?.username?.[0]?.toUpperCase() ||
    "U"

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
              <Link href="/vault" className="text-muted-foreground hover:text-foreground">
                Vault
              </Link>
              <Link href="/offers" className="text-muted-foreground hover:text-foreground">
                Offers
              </Link>
            </nav>
          </div>
          <AuthButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your profile information and contact details for book trading</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={initialProfile?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <Button type="button" variant="outline" size="sm" disabled>
                    <Camera className="mr-2 h-4 w-4" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">Photo upload coming soon</p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    name="username"
                    defaultValue={initialProfile?.username || ""}
                    required
                    placeholder="Choose a unique username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    defaultValue={initialProfile?.full_name || ""}
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={initialProfile?.bio || ""}
                  placeholder="Tell other book lovers about yourself and your reading interests..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={initialProfile?.location || ""}
                  placeholder="City, State/Region"
                />
                <p className="text-xs text-muted-foreground">Help others find books near them for easier exchanges</p>
              </div>

              {/* Contact Information */}
              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Information
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This information will only be shared when you agree to a book trade
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      defaultValue={initialProfile?.contact_email || userEmail}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      defaultValue={initialProfile?.contact_phone || ""}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactSocial">Social Media / Website</Label>
                    <Input
                      id="contactSocial"
                      name="contactSocial"
                      defaultValue={initialProfile?.contact_social || ""}
                      placeholder="https://twitter.com/yourusername"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Profile
                </Button>
                <Link href="/vault">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
