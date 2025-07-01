import { useState, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { Admin, Member } from '@/types';

export interface FirebaseAdmin {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  gymName: string;
  createdAt: Timestamp;
  isActive: boolean;
  subscription?: {
    plan: 'free' | 'premium' | 'enterprise';
    expiresAt: Timestamp;
    features: string[];
  };
}

export interface FirebaseMember {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  visits: number;
  totalRewards: number;
  level: string;
  joinDate: Timestamp;
  lastVisit?: Timestamp | null;
  adminId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const useFirebaseAuth = () => {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si Firebase Auth est disponible
  const isAuthAvailable = useCallback(() => {
    try {
      return auth !== null && auth !== undefined && typeof onAuthStateChanged === 'function';
    } catch {
      return false;
    }
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    if (!isAuthAvailable()) {
      console.warn('Firebase Auth non disponible');
      setError('Firebase Auth non disponible');
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        try {
          // Load admin data
          if (db) {
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            if (adminDoc.exists()) {
              const adminData = adminDoc.data() as FirebaseAdmin;
              setCurrentAdmin({
                id: adminDoc.id,
                name: adminData.name,
                email: adminData.email,
                phone: adminData.phone,
                gymName: adminData.gymName,
                createdAt: adminData.createdAt.toDate().toISOString(),
                isActive: adminData.isActive,
                subscription: adminData.subscription ? {
                  plan: adminData.subscription.plan,
                  expiresAt: adminData.subscription.expiresAt.toDate().toISOString(),
                  features: adminData.subscription.features
                } : undefined
              });
            }
          }
          setError(null);
        } catch (err) {
          console.error('Error loading admin data:', err);
          setError('Erreur lors du chargement des données admin');
        }
      } else {
        setCurrentAdmin(null);
        setCurrentMember(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, [isAuthAvailable]);

  // Admin authentication
  const loginAdmin = useCallback(async (email: string, password: string): Promise<Admin> => {
    if (!isAuthAvailable()) {
      throw new Error('Firebase Auth non disponible');
    }

    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!db) {
        throw new Error('Firebase Firestore non disponible');
      }

      // Get admin data
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (!adminDoc.exists()) {
        throw new Error('Compte admin non trouvé');
      }

      const adminData = adminDoc.data() as FirebaseAdmin;
      const admin: Admin = {
        id: adminDoc.id,
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        gymName: adminData.gymName,
        createdAt: adminData.createdAt.toDate().toISOString(),
        isActive: adminData.isActive,
        subscription: adminData.subscription ? {
          plan: adminData.subscription.plan,
          expiresAt: adminData.subscription.expiresAt.toDate().toISOString(),
          features: adminData.subscription.features
        } : undefined
      };

      setCurrentAdmin(admin);
      return admin;
    } catch (err: any) {
      const errorMessage = err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
        ? 'Email ou mot de passe incorrect'
        : err.message || 'Erreur de connexion';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isAuthAvailable]);

  const registerAdmin = useCallback(async (adminData: {
    name: string;
    email: string;
    password: string;
    gymName: string;
    phone?: string;
  }): Promise<Admin> => {
    if (!isAuthAvailable()) {
      throw new Error('Firebase Auth non disponible');
    }

    if (!db) {
      throw new Error('Firebase Firestore non disponible');
    }

    try {
      setError(null);
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        adminData.email, 
        adminData.password
      );
      const user = userCredential.user;

      // Create admin document
      const now = Timestamp.now();
      const adminDoc: FirebaseAdmin = {
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        gymName: adminData.gymName,
        createdAt: now,
        isActive: true,
        subscription: {
          plan: 'free',
          expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days
          features: ['basic_loyalty', 'qr_scanning', 'member_management']
        }
      };

      await setDoc(doc(db, 'admins', user.uid), adminDoc);

      const admin: Admin = {
        id: user.uid,
        name: adminDoc.name,
        email: adminDoc.email,
        phone: adminDoc.phone,
        gymName: adminDoc.gymName,
        createdAt: adminDoc.createdAt.toDate().toISOString(),
        isActive: adminDoc.isActive,
        subscription: {
          plan: adminDoc.subscription!.plan,
          expiresAt: adminDoc.subscription!.expiresAt.toDate().toISOString(),
          features: adminDoc.subscription!.features
        }
      };

      setCurrentAdmin(admin);
      return admin;
    } catch (err: any) {
      const errorMessage = err.code === 'auth/email-already-in-use'
        ? 'Cette adresse email est déjà utilisée'
        : err.message || 'Erreur lors de la création du compte';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isAuthAvailable]);

  const logoutAdmin = useCallback(async () => {
    if (!isAuthAvailable()) {
      return;
    }

    try {
      await signOut(auth);
      setCurrentAdmin(null);
      setCurrentMember(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la déconnexion');
      throw err;
    }
  }, [isAuthAvailable]);

  // Member authentication
  const loginMember = useCallback(async (name: string, adminId: string): Promise<Member> => {
    if (!db) {
      throw new Error('Firebase Firestore non disponible');
    }

    try {
      setError(null);
      
      // Find member by name and adminId
      const memberQuery = query(
        collection(db, 'members'),
        where('name', '==', name),
        where('adminId', '==', adminId)
      );
      
      const memberSnapshot = await getDocs(memberQuery);
      
      if (memberSnapshot.empty) {
        // Create new member
        const now = Timestamp.now();
        const newMemberData: Omit<FirebaseMember, 'id'> = {
          name,
          visits: 0,
          totalRewards: 0,
          level: 'Bronze',
          joinDate: now,
          adminId,
          createdAt: now,
          updatedAt: now
        };

        const memberDocRef = await addDoc(collection(db, 'members'), newMemberData);
        
        const member: Member = {
          id: memberDocRef.id,
          name: newMemberData.name,
          email: newMemberData.email,
          phone: newMemberData.phone,
          visits: newMemberData.visits,
          totalRewards: newMemberData.totalRewards,
          level: newMemberData.level as any,
          joinDate: newMemberData.joinDate.toDate().toISOString(),
          lastVisit: null,
          adminId: newMemberData.adminId
        };

        setCurrentMember(member);
        return member;
      } else {
        // Existing member
        const memberDoc = memberSnapshot.docs[0];
        const memberData = memberDoc.data() as FirebaseMember;
        
        const member: Member = {
          id: memberDoc.id,
          name: memberData.name,
          email: memberData.email,
          phone: memberData.phone,
          visits: memberData.visits,
          totalRewards: memberData.totalRewards,
          level: memberData.level as any,
          joinDate: memberData.joinDate.toDate().toISOString(),
          lastVisit: memberData.lastVisit?.toDate().toISOString() || null,
          adminId: memberData.adminId
        };

        setCurrentMember(member);
        return member;
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion membre');
      throw err;
    }
  }, []);

  const logoutMember = useCallback(async () => {
    setCurrentMember(null);
  }, []);

  // Mode switching
  const switchToAdminMode = useCallback(async () => {
    // Admin mode is determined by having a current admin
    if (!currentAdmin) {
      throw new Error('Aucun admin connecté');
    }
  }, [currentAdmin]);

  const switchToMemberMode = useCallback(async () => {
    // Member mode allows both admin and member to be set
  }, []);

  return {
    // State
    currentAdmin,
    currentMember,
    firebaseUser,
    isLoading,
    error,

    // Admin functions
    loginAdmin,
    registerAdmin,
    logoutAdmin,

    // Member functions
    loginMember,
    logoutMember,

    // Mode switching
    switchToAdminMode,
    switchToMemberMode,

    // Utils
    clearError: () => setError(null),
    isAuthAvailable
  };
};