import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../lib/firebase';
import type { UserProfile, Business, BusinessType } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  business: Business | null;
  loading: boolean;
  isConfigured: boolean;
  signup: (params: {
    email: string;
    password: string;
    fullName: string;
    businessName: string;
    businessType: BusinessType;
  }) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshBusiness: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured] = useState<boolean>(isFirebaseConfigured());

  const fetchUserData = useCallback(async (uid: string) => {
    if (!db) return;
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const profile = userSnap.data() as UserProfile;
        setUserProfile(profile);

        if (profile.businessId) {
          const bizDocRef = doc(db, 'businesses', profile.businessId);
          const bizSnap = await getDoc(bizDocRef);
          if (bizSnap.exists()) {
            setBusiness(bizSnap.data() as Business);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load user and business profile:', err);
    }
  }, []);

  const refreshBusiness = useCallback(async () => {
    if (!db || !userProfile?.businessId) return;
    try {
      const bizSnap = await getDoc(doc(db, 'businesses', userProfile.businessId));
      if (bizSnap.exists()) {
        setBusiness(bizSnap.data() as Business);
      }
    } catch (err) {
      console.error('Failed to refresh business:', err);
    }
  }, [userProfile?.businessId]);

  const refreshProfile = useCallback(async () => {
    if (currentUser?.uid) {
      await fetchUserData(currentUser.uid);
    }
  }, [currentUser?.uid, fetchUserData]);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserProfile(null);
        setBusiness(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  const signup = async ({
    email,
    password,
    fullName,
    businessName,
    businessType,
  }: {
    email: string;
    password: string;
    fullName: string;
    businessName: string;
    businessType: BusinessType;
  }) => {
    if (!auth || !db) {
      throw new Error(
        'Firebase credentials are not configured. Please supply your Firebase config before signing up.'
      );
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const now = Date.now();

    // Generate unique business ID
    const businessId = `biz_${user.uid.substring(0, 8)}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Create Business Document
    const businessData: Business = {
      id: businessId,
      ownerId: user.uid,
      name: businessName.trim(),
      type: businessType,
      avgServiceMinutes: 10, // default 10 minutes per customer
      tokenPrefix: businessType === 'Clinic' ? 'C' : businessType === 'Salon' ? 'S' : 'A',
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'businesses', businessId), businessData);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `businesses/${businessId}`);
    }

    // 2. Create User Profile Document
    const profileData: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      fullName: fullName.trim(),
      businessId,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'users', user.uid), profileData);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }

    setUserProfile(profileData);
    setBusiness(businessData);
  };

  const login = async (email: string, pass: string) => {
    if (!auth) {
      throw new Error('Firebase Authentication is not configured. Please configure Firebase.');
    }
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await fetchUserData(cred.user.uid);
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUserProfile(null);
    setBusiness(null);
  };

  const resetPassword = async (email: string) => {
    if (!auth) {
      throw new Error('Firebase Authentication is not configured.');
    }
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        business,
        loading,
        isConfigured,
        signup,
        login,
        logout,
        resetPassword,
        refreshBusiness,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
