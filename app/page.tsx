import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, ArrowRight, Search, Shield, Zap } from "lucide-react"
import { AuthButton } from "@/components/auth/auth-button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">LeafLoop</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/browse" className="text-muted-foreground hover:text-foreground">
              Browse Books
            </Link>
            <AuthButton />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Trade Books with Your Community</h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Discover new reads and share your favorites through peer-to-peer book exchanges. Connect with fellow book
            lovers and build your personal library sustainably.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse">
              <Button size="lg" className="w-full sm:w-auto">
                Start Browsing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Join LeafLoop
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">How LeafLoop Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Search className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Discover Books</CardTitle>
                <CardDescription>
                  Browse through books available in your community or search for specific titles
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Make Offers</CardTitle>
                <CardDescription>
                  Propose trades with books from your collection. Connect directly with book owners
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Safe Exchanges</CardTitle>
                <CardDescription>
                  Complete trades securely with our built-in chat and exchange confirmation system
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-8">Why Choose LeafLoop?</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
              <Zap className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sustainable Reading</h3>
              <p className="text-muted-foreground">
                Give books a second life and reduce waste while expanding your library
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-muted-foreground">
                Connect with local book enthusiasts and discover new genres through recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of book lovers already using LeafLoop to discover their next great read
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 LeafLoop. Built for book lovers, by book lovers.</p>
        </div>
      </footer>
    </div>
  )
}
