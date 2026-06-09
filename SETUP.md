# Production Setup Guide

## ✅ Completed Changes

### 1. Database Schema Updated
- Renamed `Submission` model to `Report` in Prisma schema
- Added fields: `problem`, `findings`, `solutions`, `attachments` (JSON)
- Updated status enum: `IN_PROGRESS`, `COMPLETED`, `BLOCKED`
- Removed `progress` and `summary` fields

### 2. Authentication Migrated
- Switched from `DemoAuthContext` to Firebase `AuthContext`
- Updated `layout.tsx` to use `AuthProvider`
- Removed demo login UI and quick login buttons
- All components now use `useAuth()` instead of `useDemoAuth()`

### 3. API Routes Updated
- `/api/submissions` → uses `prisma.report` with new schema
- `/api/submissions/[id]` → updated for Report model
- `/api/researchers` → ready for production use

### 4. Frontend Components Updated
- `WorkerDashboard.tsx` - Fetches reports from API
- `AdminDashboard.tsx` - Fetches all reports from API
- `AppLayout.tsx` - Uses real auth context
- `LoginForm.tsx` - Clean production login form
- `AdminReportTable.tsx` - Fetches users from API

### 5. Demo Code Removed
- Deleted `/src/lib/demo/` directory
- Deleted `DemoAuthContext.tsx`
- Removed all demo store references

### 6. Production Configuration
- `next.config.ts` - Enabled strict mode, removed `ignoreBuildErrors`
- `.gitignore` - Added `.env*` pattern (except `.env.example`)
- Created `.env.example` with all required variables

## 🔧 Next Steps

### 1. Database Setup
Your Neon database connection is failing. Check:
- Database is active in Neon dashboard
- Connection string is correct in `.env.local`
- Network allows connection to Neon

Run these commands after fixing the connection:
```bash
npx prisma db push
npx prisma generate
```

### 2. Firebase Configuration
Add your Firebase config to `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Create Initial Users
After Firebase is configured, create users in Firebase Auth and add their profiles to Firestore:
```javascript
// Firestore document structure for users collection
{
  uid: "firebase_uid",
  name: "User Name",
  email: "user@company.com",
  role: "admin" | "worker",
  createdAt: serverTimestamp()
}
```

### 4. Test Production Build
```bash
npm run build
npm run start
```

## 📝 Notes
- The app uses Firebase Auth with Firestore for user profiles
- Reports are stored in Neon PostgreSQL via Prisma
- File attachments are stored as JSON in the database (consider using Firebase Storage or S3 for production)
- Make sure to never commit `.env.local` to version control
