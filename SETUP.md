# Smart Farm Setup Guide

## Database Configuration

### Row-Level Security (RLS) Policies

The following SQL statements configure secure access to farm profiles and fields. Apply these policies to ensure users can only access their own data.

#### Recommended Production RLS Policies

```sql
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profile policies: only owners can manage their profile
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Enable RLS on fields table
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;

-- Field policies: only owners can manage their fields
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
```

#### Rollback (Remove RLS Policies)

If you need to remove the RLS policies (not recommended for production):

```sql
-- Remove all policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view their own fields" ON fields;
DROP POLICY IF EXISTS "Users can insert their own fields" ON fields;
DROP POLICY IF EXISTS "Users can update their own fields" ON fields;
DROP POLICY IF EXISTS "Users can delete their own fields" ON fields;

-- Optionally disable RLS (NOT RECOMMENDED)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE fields DISABLE ROW LEVEL SECURITY;
```

## Authentication Configuration

### Supabase Auth Settings

For development/testing, enable email auto-confirmation in Supabase settings:

1. Go to Authentication > Settings
2. Disable "Enable email confirmations"
3. This allows immediate login after signup without email verification

For production, keep email confirmations enabled for security.

## Manual Testing Guide

### Test 1: User Authentication

**Sign Up Flow:**
1. Navigate to `/login` or home page
2. Click "Sign Up" or toggle to signup mode
3. Enter email: `test@example.com`
4. Enter password: `password123` (minimum 6 characters)
5. Confirm password: `password123`
6. Click "Sign Up"
7. **Expected:** User account created, redirected to dashboard or prompted to sign in

**Sign In Flow:**
1. Navigate to `/login`
2. Enter the email and password from signup
3. Click "Sign In"
4. **Expected:** Successfully authenticated, redirected to dashboard
5. **Verify:** Dashboard shows user's farm overview

**Sign Out Flow:**
1. While logged in, find logout button (usually in profile or settings)
2. Click "Sign Out"
3. **Expected:** Session cleared, redirected to login page
4. **Verify:** Cannot access protected routes without re-authenticating

### Test 2: Farm Profile Creation

**Create Profile:**
1. Sign in with valid credentials
2. Navigate to profile setup page
3. Enter farm details:
   - Farm name: "Green Valley Farm"
   - Location: "California"
   - Farm size: 50 hectares
   - Irrigation method: "Drip"
   - Farming type: "Organic"
4. Save profile
5. **Expected:** Profile saved with `user_id` = current user's ID
6. **Verify:** Navigate to dashboard, profile details displayed

**Database Verification:**
```sql
SELECT id, email, farm_name, location, user_id 
FROM profiles 
WHERE email = 'test@example.com';
```
**Expected:** Row exists with `user_id` matching authenticated user's ID

### Test 3: Field Creation & Immediate UI Update

**Create Field:**
1. Sign in and navigate to dashboard
2. Find "Add Field" or "Farm Overview" section
3. Click "Add New Field"
4. Fill in field details:
   - Name: "North Field"
   - Size: 10 hectares
   - Crop: "Maize"
   - Planting date: Select today's date
   - Growth stage: "Seedling"
5. Click "Add Field" or submit
6. **Expected:** 
   - Loading indicator appears briefly
   - Form closes
   - New field appears in Farm Overview immediately
   - Success toast notification
7. **Verify:** No page reload occurred

**Create Multiple Fields:**
1. Repeat field creation with different names: "South Field", "East Field"
2. **Expected:** Each field appears in list immediately after creation
3. **Verify:** Total field count and total area update automatically

**Database Verification:**
```sql
SELECT id, name, size, crop, user_id 
FROM fields 
WHERE name IN ('North Field', 'South Field', 'East Field');
```
**Expected:** All fields have `user_id` matching authenticated user

### Test 4: Protected Routes

**Without Authentication:**
1. Sign out or use incognito window
2. Try to access `/dashboard`
3. **Expected:** Redirected to `/login` or see login prompt
4. **Verify:** Cannot view protected content

**With Authentication:**
1. Sign in
2. Navigate to `/dashboard`
3. **Expected:** Dashboard content loads successfully
4. **Verify:** User data (profile, fields) displays correctly

### Test 5: RLS Policy Enforcement

**Test User Isolation:**
1. Create two test accounts:
   - User A: `usera@test.com`
   - User B: `userb@test.com`
2. Sign in as User A, create a field "Field A"
3. Sign out, sign in as User B
4. **Expected:** User B's dashboard shows NO fields from User A
5. Create field "Field B" for User B
6. **Expected:** User B sees only "Field B"
7. Sign out, sign in as User A
8. **Expected:** User A sees only "Field A"

**Database Verification (as admin):**
```sql
-- Check that each user can only see their own data
SELECT user_id, name FROM fields ORDER BY user_id;
```
**Expected:** Fields grouped by user_id, no cross-user access

### Test 6: Field Deletion

**Delete Field:**
1. Sign in and view fields in dashboard
2. Click delete/trash icon on a field
3. Confirm deletion
4. **Expected:**
   - Field removed from UI immediately
   - Success toast notification
   - Total count and area update

**Database Verification:**
```sql
SELECT id, name FROM fields WHERE name = 'North Field';
```
**Expected:** Field no longer exists in database

### Test 7: Error Handling

**Invalid Email:**
1. Try to sign up with email: `notanemail`
2. **Expected:** Validation error, "Invalid email address"

**Password Too Short:**
1. Try to sign up with password: `123`
2. **Expected:** Error, "Password must be at least 6 characters"

**Password Mismatch:**
1. Sign up with password `password123`, confirm with `different123`
2. **Expected:** Error, "Passwords do not match"

**Duplicate Email:**
1. Sign up with `test@example.com`
2. Try to sign up again with same email
3. **Expected:** Error from Supabase, "User already registered"

**Missing Required Fields:**
1. Try to create field without name or size
2. **Expected:** Form validation prevents submission
3. **Verify:** User-friendly error message

### Test 8: Session Persistence

**Refresh Test:**
1. Sign in
2. Navigate to dashboard
3. Refresh the browser page
4. **Expected:** User remains authenticated, dashboard loads
5. **Verify:** No redirect to login

**New Tab Test:**
1. While authenticated, open new tab
2. Navigate to dashboard
3. **Expected:** User authenticated in new tab, data loads

**Browser Close Test:**
1. Sign in
2. Close browser completely
3. Reopen browser and navigate to app
4. **Expected:** User still authenticated (session persisted)

## Architecture Overview

### Service Layer
- **authService.ts**: Handles all authentication operations (signup, signin, signout)
- **supabaseService.ts**: Manages database operations for profiles and fields

### React Hooks
- **useAuth.ts**: Provides authentication state and user info to components
- **useFarm.ts**: Manages farm profiles and fields with automatic UI updates

### Components
- **AuthForm.tsx**: Unified sign-in/sign-up form
- **FarmOverview.tsx**: Displays farm profile and fields list
- **NewFieldForm.tsx**: Form for creating new fields
- **ProtectedRoute.tsx**: Route guard for authenticated-only pages

### Data Flow
1. User authenticates via AuthForm → authService → Supabase Auth
2. Auth state synced via useAuth hook
3. Dashboard loads farm data via useFarm hook → supabaseService → Supabase DB
4. Field creation via NewFieldForm → useFarm.createField → immediate UI update
5. RLS policies enforce user_id checks on all database operations

## Troubleshooting

### Fields not showing after creation
- Check browser console for errors
- Verify user is authenticated (`useAuth` returns valid user)
- Check RLS policies are applied
- Verify `user_id` is set correctly on field records

### Authentication errors
- Check Supabase URL and anon key in `.env`
- Verify email confirmation setting
- Check browser console for detailed error messages
- Ensure password meets minimum requirements

### RLS policy issues
- Run the RLS SQL statements in Supabase SQL editor
- Check if policies exist: `SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'fields');`
- Verify `auth.uid()` returns correct user ID

## Production Checklist

- [ ] RLS policies applied and tested
- [ ] Email confirmation enabled in Supabase Auth
- [ ] Environment variables configured for production
- [ ] Password requirements enforced (min length, complexity)
- [ ] Error handling implemented for all auth flows
- [ ] Session persistence tested across devices
- [ ] User data isolation verified (RLS enforcement)
- [ ] Input validation on all forms
- [ ] Proper error messages shown to users
