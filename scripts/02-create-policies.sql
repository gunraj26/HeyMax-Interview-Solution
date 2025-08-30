-- Row Level Security Policies

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Books policies
CREATE POLICY "Anyone can view listed books" ON books FOR SELECT USING (is_listed = true);
CREATE POLICY "Owners can view their own books" ON books FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can manage their books" ON books FOR ALL USING (auth.uid() = owner_id);

-- Offers policies
CREATE POLICY "Book owners can view offers on their books" ON offers 
  FOR SELECT USING (
    auth.uid() IN (
      SELECT owner_id FROM books WHERE id = book_id
    )
  );
CREATE POLICY "Requesters can view their own offers" ON offers 
  FOR SELECT USING (auth.uid() = requester_id);
CREATE POLICY "Authenticated users can create offers" ON offers 
  FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Requesters and book owners can update offers" ON offers 
  FOR UPDATE USING (
    auth.uid() = requester_id OR 
    auth.uid() IN (SELECT owner_id FROM books WHERE id = book_id)
  );

-- Messages policies
CREATE POLICY "Offer participants can view messages" ON messages 
  FOR SELECT USING (
    auth.uid() = sender_id OR
    auth.uid() IN (
      SELECT requester_id FROM offers WHERE id = offer_id
      UNION
      SELECT owner_id FROM books WHERE id = (SELECT book_id FROM offers WHERE id = offer_id)
    )
  );
CREATE POLICY "Offer participants can send messages" ON messages 
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (
      SELECT requester_id FROM offers WHERE id = offer_id
      UNION
      SELECT owner_id FROM books WHERE id = (SELECT book_id FROM offers WHERE id = offer_id)
    )
  );

-- Exchanges policies
CREATE POLICY "Offer participants can view exchanges" ON exchanges 
  FOR SELECT USING (
    auth.uid() IN (
      SELECT requester_id FROM offers WHERE id = offer_id
      UNION
      SELECT owner_id FROM books WHERE id = (SELECT book_id FROM offers WHERE id = offer_id)
    )
  );
CREATE POLICY "Offer participants can update exchanges" ON exchanges 
  FOR ALL USING (
    auth.uid() IN (
      SELECT requester_id FROM offers WHERE id = offer_id
      UNION
      SELECT owner_id FROM books WHERE id = (SELECT book_id FROM offers WHERE id = offer_id)
    )
  );
