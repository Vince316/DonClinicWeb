// Test Firebase Connection
// Add this temporarily to your Hero.jsx to test Firebase

import { auth } from '../../lib/firebase';

// Add this inside Hero component, before return statement:
useEffect(() => {
  console.log('=== FIREBASE CONNECTION TEST ===');
  console.log('Auth instance:', auth);
  console.log('Auth config:', {
    apiKey: auth.config.apiKey ? 'EXISTS' : 'MISSING',
    authDomain: auth.config.authDomain,
    projectId: auth.config.projectId
  });
}, []);

// This will log Firebase configuration on page load
// Check browser console to see if Firebase is properly configured
