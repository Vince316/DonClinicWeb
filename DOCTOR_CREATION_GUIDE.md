# Doctor Account Creation Guide

## Overview
When a superadmin creates a doctor account, the system automatically saves the data to both Firebase Authentication and Firestore database.

## How It Works

### 1. **AddDoctor Page** (`src/pages/superadmin/AddDoctor.jsx`)
This is the main page for creating doctor accounts. It handles:

#### Firebase Authentication
- Uses **secondary auth instance** to create the user without logging out the superadmin
- Creates user with email and password using `createUserWithEmailAndPassword()`
- Immediately signs out from secondary auth to prevent session conflicts

#### Firestore Database
- Stores doctor data in the `doctors` collection
- Uses the Firebase Auth UID as the document ID
- Saves the following fields:
  - `uid`: Firebase Authentication user ID
  - `name`: Doctor's full name
  - `email`: Doctor's email address
  - `phone`: Doctor's phone number
  - `specialty`: Medical specialty
  - `licenseNumber`: Medical license number
  - `yearsOfExperience`: Years of practice
  - `education`: Educational background
  - `status`: Account status (default: "Active")
  - `role`: User role (set to "doctor")
  - `createdAt`: Timestamp of account creation

### 2. **ManageDoctors Page** (`src/pages/superadmin/ManageDoctors.jsx`)
- Displays all doctors from Firestore
- Shows doctor details in a side panel
- Allows status toggle (Active/Inactive)
- Allows deletion of doctor accounts
- Fetches doctor data from the `doctors` collection

### 3. **Authentication Flow** (`src/context/AuthContext.jsx`)
When a doctor logs in:
1. Firebase Authentication verifies credentials
2. System checks the `doctors` collection using their UID
3. If found, sets role to "doctor" and loads their name
4. User is granted access to doctor portal

## Key Features

### Secondary Auth Instance
```javascript
// In firebase.js
secondaryApp = initializeApp(firebaseConfig, 'Secondary');
export const secondaryAuth = getAuth(secondaryApp);
```
This prevents the superadmin from being logged out when creating new doctor accounts.

### Doctor Specialties
Available specialties:
- Cardiologist
- Dermatologist
- Pediatrician
- Orthopedic
- Neurologist
- General Practitioner
- Ophthalmologist
- Psychiatrist

### Password Requirements
- Minimum 6 characters (Firebase requirement)
- Password is shown to superadmin after creation (should be saved)

## Usage

### Creating a Doctor Account
1. Navigate to `/superadmin/add-doctor`
2. Fill in the form:
   - Full Name
   - Email Address
   - Phone Number
   - Specialty (dropdown)
   - License Number
   - Years of Experience
   - Education
   - Password
   - Confirm Password
3. Click "Register Doctor"
4. System will:
   - Create user in Firebase Authentication
   - Save data to Firestore `doctors` collection
   - Display success message with credentials
   - Redirect to Manage Doctors page

### Doctor Login
1. Doctor goes to sign-in page
2. Enters email and password
3. System authenticates via Firebase Auth
4. System fetches doctor data from Firestore
5. Doctor is redirected to doctor dashboard

## Database Structure

### Firebase Authentication
- Stores email and password
- Generates unique UID for each user

### Firestore Collection: `doctors`
```
doctors/
  └── {uid}/
      ├── uid: string
      ├── name: string
      ├── email: string
      ├── phone: string
      ├── specialty: string
      ├── licenseNumber: string
      ├── yearsOfExperience: string
      ├── education: string
      ├── status: string
      ├── role: string
      └── createdAt: string (ISO timestamp)
```

## Role Detection Priority

The AuthContext checks roles in this order:
1. **Superadmin** - Email matches `superadmin@donclinic.com`
2. **Admin** - Email ends with `@donclinic.com` AND exists in `admins` collection
3. **Doctor** - Exists in `doctors` collection (checked by UID)
4. **Patient** - Exists in `patients` collection (checked by email)

## Error Handling

The system handles various errors:
- Email already in use
- Invalid email format
- Weak password
- Secondary auth not initialized
- Firestore write failures

All errors are logged to console and displayed to the user.

## Security Notes

1. Only superadmin can create doctor accounts
2. Passwords are never stored in Firestore (only in Firebase Auth)
3. Secondary auth prevents session hijacking
4. Doctor role is verified on every login by checking Firestore
5. Doctor status can be toggled (Active/Inactive) by superadmin

## Testing

To verify the implementation:
1. Create a doctor account as superadmin
2. Check Firebase Console → Authentication (user should appear)
3. Check Firebase Console → Firestore → doctors collection (document should exist)
4. Log out and log in as the new doctor
5. Verify access to doctor portal

## Differences from Admin Creation

- Doctors have additional fields: specialty, licenseNumber, yearsOfExperience, education
- Doctors can use any email domain (not restricted to @donclinic.com)
- Doctor role is detected by checking the `doctors` collection, not by email domain
- Doctors have a status toggle feature in the management interface
