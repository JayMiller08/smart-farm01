-- Note: RLS is already enabled on these tables, just ensuring policies are optimized

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view their own fields" ON fields;
DROP POLICY IF EXISTS "Users can insert their own fields" ON fields;
DROP POLICY IF EXISTS "Users can update their own fields" ON fields;
DROP POLICY IF EXISTS "Users can delete their own fields" ON fields;

-- Create optimized RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create optimized RLS policies for fields
CREATE POLICY "Users can view their own fields" 
  ON fields FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fields" 
  ON fields FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fields" 
  ON fields FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fields" 
  ON fields FOR DELETE 
  USING (auth.uid() = user_id);