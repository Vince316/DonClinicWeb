# Google Sign-In Implementation Guide

## Overview
Google Sign-In is now fully functional across all authentication pages in your application. Users can sign in or register using their Google account with a single click.

## How It Works

### 1. **Firebase Configuration** (`src/lib/firebase.js`)
- Added `GoogleAuthProvider` from Firebase Auth
- Added `signInWithPopup` method for popup-based authentication
- Exported `googleProvider` for use in authentication

### 2. **AuthContext** (`src/context/AuthContext.jsx`)
- Added `loginWithGoogle()` method
- Handles Google popup authentication
- Automatically detects user role (superadmin, admin, doctor, patient)
- Creates new patient record if user doesn't exist in Firestore
- Returns user data with role for proper routing

### 3. **Updated Components**
All sign-in/register pages now have functional Google Sign-In:
- **SignIn.jsx** - Main sign-in page
- **Register.jsx** - Registration page
- **Hero.jsx** - Landing page sign-in/register forms

## User Flow

### For New Users (First-time Google Sign-In)
1. User clicks "Sign in with Google" button
2. Google popup appears for account selection
3. User selects Google account
4. System checks Firestore collections:
   - Checks `admins` collection (not found)
   - Checks `doctors` collection (not found)
   - Checks `patients` collection (not found)
5. System automatically creates new patient record in Firestore:
   ```javascript
   {
     uid: firebaseUser.uid,
     name: firebaseUser.displayName,
     email: firebaseUser.email,
     registeredAt: timestamp,
     status: 'Active',
     authProvider: 'google'
   }
   ```
6. User is redirected to `/patient/dashboard`

### For Existing Users
1. User clicks "Sign in with Google" button
2. Google popup appears
3. User selects Google account
4. System checks Firestore and identifies role:
   - **Superadmin** → redirects to `/superadmin`
   - **Admin** → redirects to `/admin`
   - **Doctor** → redirects to `/admin`
   - **Patient** → redirects to `/patient/dashboard`

## Role Detection Priority

The system checks roles in this order:
1. **Superadmin** - Email matches `superadmin@donclinic.com`
2. **Admin** - Exists in `admins` collection (by UID)
3. **Doctor** - Exists in `doctors` collection (by UID)
4. **Patient** - Exists in `patients` collection (by UID) or creates new

## Features

### Automatic Patient Creation
- New Google users are automatically registered as patients
- No manual registration required
- Patient record includes Google display name and email
- Marked with `authProvider: 'google'` for tracking

### Error Handling
- Popup closed by user
- Cancelled sign-in
- Network errors
- All errors are displayed to the user

### Security
- Uses Firebase Authentication's secure OAuth flow
- No passwords stored for Google users
- Firebase handles all authentication tokens
- Automatic session management

## Firebase Console Setup

To enable Google Sign-In, ensure in Firebase Console:
1. Go to **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Add authorized domains if needed
4. Save configuration

## Testing

### Test as New Patient
1. Click "Sign in with Google"
2. Select a Google account not in the system
3. Should create patient record and redirect to patient dashboard
4. Check Firestore → `patients` collection for new record

### Test as Existing Admin/Doctor
1. Create admin/doctor account via superadmin
2. Use the same email for Google Sign-In
3. Should detect role and redirect to admin portal

## Code Example

### Using Google Sign-In in a Component
```javascript
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { loginWithGoogle } = useAuth();
  
  const handleGoogleSignIn = async () => {
    const result = await loginWithGoogle();
    
    if (result.success) {
      // Handle successful sign-in
      console.log('User:', result.user);
    } else {
      // Handle error
      console.error('Error:', result.error);
    }
  };
  
  return (
    <button onClick={handleGoogleSignIn}>
      Sign in with Google
    </button>
  );
};
```

## Benefits

1. **Faster Registration** - One-click sign-up for new users
2. **No Password Management** - Users don't need to remember passwords
3. **Secure** - Leverages Google's OAuth security
4. **Seamless Experience** - Works across all auth pages
5. **Automatic Role Detection** - Smart routing based on user role
6. **Auto Patient Creation** - New users automatically become patients

## Troubleshooting

### Popup Blocked
- Ensure browser allows popups for your domain
- Check browser popup blocker settings

### Authentication Error
- Verify Firebase Console has Google provider enabled
- Check authorized domains in Firebase Console
- Ensure API keys are correct in `.env` file

### User Not Redirected
- Check browser console for errors
- Verify Firestore rules allow read/write
- Ensure collections exist in Firestore

## Notes

- Google Sign-In works for all user types (patient, doctor, admin)
- New Google users are automatically created as patients
- Existing users maintain their roles
- No duplicate accounts - uses Firebase UID as unique identifier
