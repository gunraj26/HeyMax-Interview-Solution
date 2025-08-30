"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react"
import { AuthButton } from "@/components/auth/auth-button"
import { OfferCard } from "./offer-card"
import Link from "next/link"

interface Offer {
  id: string
  requester_id: string
  book_id: string
  status: string
  message: string
  selected_candidates: string[]
  created_at: string
  books?: any
  profiles?: any
}

interface OffersManagerProps {
  incomingOffers: Offer[]
  outgoingOffers: Offer[]
  userId: string
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  candidates_selected: {
    label: "Candidates Selected",
    icon: MessageSquare,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  contact_revealed: {
    label: "Contact Revealed",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
}

export function OffersManager({ incomingOffers, outgoingOffers, userId }: OffersManagerProps) {
  const [activeTab, setActiveTab] = useState("incoming")

  const getStatusCounts = (offers: Offer[]) => {
    return offers.reduce(
      (acc, offer) => {
        acc[offer.status] = (acc[offer.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  const incomingCounts = getStatusCounts(incomingOffers)
  const outgoingCounts = getStatusCounts(outgoingOffers)

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
            </nav>
          </div>
          <AuthButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trade Offers</h1>
          <p className="text-muted-foreground">Manage your incoming and outgoing book trade offers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Incoming Offers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incomingOffers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Outgoing Offers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{outgoingOffers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{incomingCounts.pending || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Offers Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Incoming ({incomingOffers.length})
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Outgoing ({outgoingOffers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="mt-6">
            {incomingOffers.length === 0 ? (
              <Card className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No incoming offers</h3>
                <p className="text-muted-foreground mb-4">
                  When someone wants to trade for your books, their offers will appear here
                </p>
                <Link href="/vault">
                  <Button>Manage Your Books</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {incomingOffers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} type="incoming" userId={userId} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="outgoing" className="mt-6">
            {outgoingOffers.length === 0 ? (
              <Card className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No outgoing offers</h3>
                <p className="text-muted-foreground mb-4">
                  Browse books and make trade offers to start building your collection
                </p>
                <Link href="/browse">
                  <Button>Browse Books</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {outgoingOffers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} type="outgoing" userId={userId} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
