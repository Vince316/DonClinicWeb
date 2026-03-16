# Admin Account Creation Guide

## Overview
When a superadmin creates an admin account, the system automatically saves the data to both Firebase Authentication and Firestore database.

## How It Works

### 1. **AddAdmin Page** (`src/pages/superadmin/AddAdmin.jsx`)
This is the main page for creating admin accounts. It handles:

#### Firebase Authentication
- Uses **secondary auth instance** to create the user without logging out the superadmin
- Creates user with email and password using `createUserWithEmailAndPassword()`
- Immediately signs out from secondary auth to prevent session conflicts

#### Firestore Database
- Stores admin data in the `admins` collection
- Uses the Firebase Auth UID as the document ID
- Saves the following fields:
  - `uid`: Firebase Authentication user ID
  - `name`: Admin's full name
  - `email`: Admin's email address
  - `phone`: Admin's phone number
  - `status`: Account status (default: "Active")
  - `role`: User role (set to "admin")
  - `createdAt`: Timestamp of account creation

### 2. **ManageAdmins Page** (`src/pages/superadmin/ManageAdmins.jsx`)
- Displays all admins from Firestore
- "Add Admin" button redirects to the AddAdmin page
- Fetches admin data from the `admins` collection
- Allows deletion of admin accounts

### 3. **Authentication Flow** (`src/context/AuthContext.jsx`)
When an admin logs in:
1. Firebase Authentication verifies credentials
2. System checks if email ends with `@donclinic.com`
3. Looks up the user in the `admins` collection using their UID
4. If found, sets role to "admin" and loads their name
5. User is granted access to admin portal

## Key Features

### Secondary Auth Instance
```javascript
// In firebase.js
secondaryApp = initializeApp(firebaseConfig, 'Secondary');
export const secondaryAuth = getAuth(secondaryApp);
```
This prevents the superadmin from being logged out when creating new admin accounts.

### Email Validation
- Admin emails must end with `@donclinic.com`
- This is enforced in the AddAdmin form

### Password Requirements
- Minimum 6 characters (Firebase requirement)
- Password is shown to superadmin after creation (should be saved)

## Usage

### Creating an Admin Account
1. Navigate to `/superadmin/add-admin`
2. Fill in the form:
   - Full Name
   - Email (must end with @donclinic.com)
   - Phone Number
   - Password
   - Confirm Password
3. Click "Create Admin Account"
4. System will:
   - Create user in Firebase Authentication
   - Save data to Firestore `admins` collection
   - Display success message with credentials
   - Redirect to Manage Admins page

### Admin Login
1. Admin goes to sign-in page
2. Enters email and password
3. System authenticates via Firebase Auth
4. System fetches admin data from Firestore
5. Admin is redirected to admin dashboard

## Database Structure

### Firebase Authentication
- Stores email and password
- Generates unique UID for each user

### Firestore Collection: `admins`
```
admins/
  └── {uid}/
      ├── uid: string
      ├── name: string
      ├── email: string
      ├── phone: string
      ├── status: string
      ├── role: string
      └── createdAt: string (ISO timestamp)
```

## Error Handling

The system handles various errors:
- Email already in use
- Invalid email format
- Weak password
- Secondary auth not initialized
- Firestore write failures

All errors are logged to console and displayed to the user.

## Security Notes

1. Only superadmin can create admin accounts
2. Admin emails must use the @donclinic.com domain
3. Passwords are never stored in Firestore (only in Firebase Auth)
4. Secondary auth prevents session hijacking
5. Admin role is verified on every login by checking Firestore

## Testing

To verify the implementation:
1. Create an admin account as superadmin
2. Check Firebase Console → Authentication (user should appear)
3. Check Firebase Console → Firestore → admins collection (document should exist)
4. Log out and log in as the new admin
5. Verify access to admin portal
