import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, collection, query, where, getDocs, doc, getDoc, setDoc, googleProvider, signInWithPopup } from '../lib/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let role = 'patient';
        let name = firebaseUser.displayName || 'User';

        if (firebaseUser.email === 'superadmin@donclinic.com') {
          role = 'superadmin';
          name = 'Super Admin';
        } else {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
            if (adminDoc.exists()) {
              role = 'admin';
              name = adminDoc.data().name;
            } else {
              const doctorDoc = await getDoc(doc(db, 'doctors', firebaseUser.uid));
              if (doctorDoc.exists()) {
                role = 'doctor';
                name = doctorDoc.data().name;
              } else {
                const patientsQuery = query(collection(db, 'patients'), where('email', '==', firebaseUser.email));
                const patientsSnapshot = await getDocs(patientsQuery);
                if (!patientsSnapshot.empty) {
                  name = patientsSnapshot.docs[0].data().name;
                }
              }
            }
          } catch (error) {
            console.error('Error fetching user document:', error);
          }
        }

        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name, role });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const firebaseUser = userCredential.user;

      let role = 'patient';
      let name = firebaseUser.displayName || 'User';

      if (credentials.email === 'superadmin@donclinic.com') {
        role = 'superadmin';
        name = 'Super Admin';
      } else {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
          if (adminDoc.exists()) {
            role = 'admin';
            name = adminDoc.data().name;
          } else {
            const doctorDoc = await getDoc(doc(db, 'doctors', firebaseUser.uid));
            if (doctorDoc.exists()) {
              role = 'doctor';
              name = doctorDoc.data().name;
            } else {
              const patientsQuery = query(collection(db, 'patients'), where('email', '==', credentials.email));
              const patientsSnapshot = await getDocs(patientsQuery);
              if (!patientsSnapshot.empty) {
                name = patientsSnapshot.docs[0].data().name;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
        }
      }

      const userData = { uid: firebaseUser.uid, email: firebaseUser.email, name, role };
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      let errorMessage = 'Failed to sign in';
      if (err.code === 'auth/user-not-found') errorMessage = 'No account found with this email';
      else if (err.code === 'auth/wrong-password') errorMessage = 'Incorrect password';
      else if (err.code === 'auth/invalid-email') errorMessage = 'Invalid email address';
      else if (err.code === 'auth/invalid-credential') errorMessage = 'Invalid email or password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const firebaseUser = userCredential.user;

      await setDoc(doc(db, 'patients', firebaseUser.uid), {
        uid: firebaseUser.uid,
        name: userData.name,
        email: userData.email,
        registeredAt: new Date().toISOString(),
        status: 'Active'
      });

      setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: userData.name, role: 'patient' });
      return { success: true };
    } catch (err) {
      let errorMessage = 'Failed to register';
      if (err.code === 'auth/email-already-in-use') errorMessage = 'Email already registered';
      else if (err.code === 'auth/weak-password') errorMessage = 'Password should be at least 6 characters';
      else if (err.code === 'auth/invalid-email') errorMessage = 'Invalid email address';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout');
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      let isNewGoogleUser = false;

      let role = 'patient';
      let name = firebaseUser.displayName || 'User';

      if (firebaseUser.email === 'superadmin@donclinic.com') {
        role = 'superadmin';
        name = 'Super Admin';
      } else {
        const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
        if (adminDoc.exists()) {
          role = 'admin';
          name = adminDoc.data().name;
        } else {
          const doctorDoc = await getDoc(doc(db, 'doctors', firebaseUser.uid));
          if (doctorDoc.exists()) {
            role = 'doctor';
            name = doctorDoc.data().name;
          } else {
            const patientDoc = await getDoc(doc(db, 'patients', firebaseUser.uid));
            if (patientDoc.exists()) {
              name = patientDoc.data().name;
            } else {
              await setDoc(doc(db, 'patients', firebaseUser.uid), {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email,
                registeredAt: new Date().toISOString(),
                status: 'Active',
                authProvider: 'google'
              });
              isNewGoogleUser = true;
            }
          }
        }
      }

      const userData = { uid: firebaseUser.uid, email: firebaseUser.email, name, role };
      setUser(userData);
      return { success: true, user: userData, isNewUser: isNewGoogleUser };
    } catch (err) {
      let errorMessage = 'Failed to sign in with Google';
      if (err.code === 'auth/popup-closed-by-user') errorMessage = 'Sign-in popup was closed';
      else if (err.code === 'auth/cancelled-popup-request') errorMessage = 'Sign-in was cancelled';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = { user, loading, error, login, register, logout, loginWithGoogle, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
