# LeafLoop - P2P Book Exchange Platform

LeafLoop is a peer-to-peer book exchange platform that enables users to trade books directly with each other. Built with Next.js, Supabase, and modern web technologies, it provides a seamless experience for book lovers to discover, offer, and exchange books within their community.

## 🚀 Getting Started


### Installation & Setup

1. **Clone and Install**
   \`\`\`bash
   git clone <repository-url>
   cd leafloop
   npm install
   \`\`\`

5. **Run the Application**
   \`\`\`bash
   npm run dev
   \`\`\`
   
   The app will be available at `http://localhost:3000`

## 📚 How to Exchange Books

### Step 1: Set Up Your Account
1. **Sign Up/Login** - Create an account or sign in at `/login`

### Step 2: Add Books to Your Vault
1. **Access Your Vault** - Navigate to `/vault`
2. **Add Books** - Click "Add Book" and fill in:
   - Book details (title, author, ISBN, condition, genre)
   - Upload photos of the book
   - **Important**: Add your contact information (email, phone, social media)
   - Set listing status (Public = available for trade, Private = not available)

### Step 3: Browse and Request Books
1. **Browse Available Books** - Go to `/browse` to see all publicly listed books
2. **Search & Filter** - Use the search bar and filters to find specific books
3. **View Book Details** - Click on any book to see full details and owner information
4. **Make an Offer** - Click "Make Offer" and select books from your vault that you're willing to trade

### Step 4: Manage Incoming Offers
1. **Check Offers** - Go to `/offers` to see incoming and outgoing trade requests
2. **Review Candidates** - For incoming offers, review the books offered by the requester
3. **Make Decision**:
   - **Accept**: Select ONE book you want from their offer
   - **Reject**: Decline the trade if no books interest you

### Step 5: Complete the Exchange
1. **Contact Information Revealed** - Once accepted, both parties can see each other's contact details
2. **Coordinate Exchange** - Use the provided contact information to arrange the physical book exchange
3. **Mark as Complete** - After successfully exchanging books, mark the trade as complete
4. **Books Made Private** - Exchanged books are automatically removed from public listings and moved to private.

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time subscriptions)

### Database Schema
\`\`\`
users (Supabase Auth)
├── books (user's book collection)
├── offers (trade requests)
├── exchanges (completed trades)
└── messages (future chat functionality)
\`\`\`

### Key Design Patterns

#### 1. **Row Level Security (RLS)**
All database operations are secured with Supabase RLS policies ensuring users can only access their own data and publicly available information.

#### 2. **Component Composition**
Modular component architecture with clear separation of concerns:
- UI components (`components/ui/`)
- Feature components (`components/vault/`, `components/offers/`)
- Page components (`app/`)

## 📈 Scalability Considerations

### Current Architecture Benefits
1. **Serverless Backend**: Supabase handles scaling automatically
2. **Edge Deployment**: Vercel provides global CDN and edge functions

### Scaling Strategies

#### For 10K+ Users
- **Database Indexing**: Add indexes on frequently queried columns (genre, location, created_at)
- **Caching**: Implement Redis for frequently accessed data (popular books, user sessions)
- **Image Storage**: Move to dedicated CDN (Cloudinary, AWS S3)

## 🎯 Core Principles

### 1. **Privacy First**
- Contact information is only revealed after mutual agreement
- Users control their book visibility (public/private)
- No personal data is shared without explicit consent

### 2. **Trust & Safety**
- User verification through email authentication

### 3. **User Experience**
- Intuitive navigation and clear user flows
- Minimal friction in the trading process

### 4. **Community Building**
- Local focus encourages face-to-face exchanges
- Book condition transparency builds trust
- Simple rating system (future enhancement)

### 5. **Sustainability**
- Promotes book reuse and circular economy
- Reduces waste by extending book lifecycles
- Encourages reading culture and knowledge sharing

## 🔮 Future Enhancements

### Short Term
- [ ] Push notifications for new offers
- [ ] Book condition rating system
- [ ] Wishlist functionality
- [ ] Advanced search filters (publication year, language)

### Medium Term
- [ ] Mobile app (React Native)
- [ ] In-app messaging system
- [ ] Book recommendation engine
- [ ] Community features (book clubs, reviews)

### Long Term
- [ ] Multi-language support
- [ ] Integration with library systems
- [ ] Blockchain-based reputation system
- [ ] AI-powered book matching

---

**Happy Trading! 📚✨**
