import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';
import { db, isAuthAvailable } from '@/config/firebase';
import { Member } from '@/types';

export interface FirebaseClubInfo {
  id?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  instagram: string;
  facebook: string;
  welcomeMessage: string;
  hours: string;
  updatedAt: Timestamp;
}

export interface FirebaseReward {
  id?: string;
  name: string;
  description: string;
  requiredVisits: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  emoji: string;
  createdAt: Timestamp;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseVisit {
  id?: string;
  memberId: string;
  memberName: string;
  date: Timestamp;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Timestamp;
}

export interface FirebaseAdmin {
  id?: string;
  name: string;
  email: string;
  gymName: string;
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const useFirebaseData = () => {
  const [clubInfo, setClubInfo] = useState<FirebaseClubInfo | null>(null);
  const [rewards, setRewards] = useState<FirebaseReward[]>([]);
  const [members, setMembers] = useState<FirebaseMember[]>([]);
  const [visits, setVisits] = useState<FirebaseVisit[]>([]);
  const [admins, setAdmins] = useState<FirebaseAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si Firebase est disponible
  const isFirebaseAvailable = useCallback(() => {
    try {
      return db !== null && db !== undefined && isAuthAvailable();
    } catch {
      return false;
    }
  }, []);

  // Load initial data and set up real-time listeners
  useEffect(() => {
    if (!isFirebaseAvailable()) {
      console.warn('Firebase non disponible');
      setError('Firebase non disponible');
      setIsLoading(false);
      return;
    }

    const unsubscribes: (() => void)[] = [];

    try {
      // Club Info listener
      const clubInfoQuery = query(collection(db, 'clubInfo'), orderBy('updatedAt', 'desc'));
      const unsubClubInfo = onSnapshot(clubInfoQuery, (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setClubInfo({ id: doc.id, ...doc.data() } as FirebaseClubInfo);
        }
        setError(null);
      }, (err) => {
        console.error('Error loading club info:', err);
        setError('Erreur lors du chargement des informations du club');
      });
      unsubscribes.push(unsubClubInfo);

      // Rewards listener
      const rewardsQuery = query(collection(db, 'rewards'), orderBy('requiredVisits', 'asc'));
      const unsubRewards = onSnapshot(rewardsQuery, (snapshot) => {
        const rewardsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FirebaseReward[];
        setRewards(rewardsData);
        setError(null);
      }, (err) => {
        console.error('Error loading rewards:', err);
        setError('Erreur lors du chargement des récompenses');
      });
      unsubscribes.push(unsubRewards);

      // Members listener
      const membersQuery = query(collection(db, 'members'), orderBy('createdAt', 'desc'));
      const unsubMembers = onSnapshot(membersQuery, (snapshot) => {
        const membersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FirebaseMember[];
        setMembers(membersData);
        setError(null);
      }, (err) => {
        console.error('Error loading members:', err);
        setError('Erreur lors du chargement des membres');
      });
      unsubscribes.push(unsubMembers);

      // Visits listener (last 100 visits)
      const visitsQuery = query(collection(db, 'visits'), orderBy('date', 'desc'));
      const unsubVisits = onSnapshot(visitsQuery, (snapshot) => {
        const visitsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FirebaseVisit[];
        setVisits(visitsData.slice(0, 100)); // Limit to last 100 visits
        setError(null);
      }, (err) => {
        console.error('Error loading visits:', err);
        setError('Erreur lors du chargement des visites');
      });
      unsubscribes.push(unsubVisits);

      // Admins listener
      const adminsQuery = query(collection(db, 'admins'), orderBy('createdAt', 'desc'));
      const unsubAdmins = onSnapshot(adminsQuery, (snapshot) => {
        const adminsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FirebaseAdmin[];
        setAdmins(adminsData);
        setError(null);
      }, (err) => {
        console.error('Error loading admins:', err);
        setError('Erreur lors du chargement des admins');
      });
      unsubscribes.push(unsubAdmins);

    } catch (err) {
      console.error('Error setting up Firebase listeners:', err);
      setError('Erreur de connexion à Firebase');
    }

    setIsLoading(false);

    // Cleanup function
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [isFirebaseAvailable]);

  // Club Info operations
  const updateClubInfo = useCallback(async (info: Omit<FirebaseClubInfo, 'id' | 'updatedAt'>) => {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase non disponible');
    }

    try {
      const dataToSave = {
        ...info,
        updatedAt: Timestamp.now()
      };

      if (clubInfo?.id) {
        // Update existing
        await updateDoc(doc(db, 'clubInfo', clubInfo.id), dataToSave);
      } else {
        // Create new
        await addDoc(collection(db, 'clubInfo'), dataToSave);
      }
    } catch (err) {
      console.error('Error updating club info:', err);
      throw new Error('Erreur lors de la mise à jour des informations du club');
    }
  }, [clubInfo, isFirebaseAvailable]);

  // Rewards operations
  const addReward = useCallback(async (reward: Omit<FirebaseReward, 'id' | 'createdAt'>) => {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase non disponible');
    }

    try {
      await addDoc(collection(db, 'rewards'), {
        ...reward,
        createdAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error adding reward:', err);
      throw new Error('Erreur lors de l\'ajout de la récompense');
    }
  }, [isFirebaseAvailable]);

  const removeReward = useCallback(async (rewardId: string) => {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase non disponible');
    }

    try {
      await deleteDoc(doc(db, 'rewards', rewardId));
    } catch (err) {
      console.error('Error removing reward:', err);
      throw new Error('Erreur lors de la suppression de la récompense');
    }
  }, [isFirebaseAvailable]);

  // Members operations
  const addMember = useCallback(async (member: Omit<FirebaseMember, 'id' | 'visits' | 'totalRewards' | 'level' | 'joinDate' | 'createdAt' | 'updatedAt'>) => {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase non disponible');
    }

    try {
      const now = Timestamp.now();
      await addDoc(collection(db, 'members'), {
        ...member,
        visits: 0,
        totalRewards: 0,
        level: 'Bronze',
        joinDate: now,
        createdAt: now,
        updatedAt: now
      });
    } catch (err) {
      console.error('Error adding member:', err);
      throw new Error('Erreur lors de l\'ajout du membre');
    }
  }, [isFirebaseAvailable]);

  const updateMember = useCallback(async (memberId: string, updates: Partial<FirebaseMember>) => {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase non disponible');
    }

    try {
      await updateDoc(doc(db, 'members', memberId), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error updating member:', err);
      throw new Error('Erreur lors de la mise à jour du membre');
    }
  }, [isFirebaseAvailable]);

  const removeMember = useCallback(async (memberId: string) => {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase non disponible');
    }

    try {
      // Remove member
      await deleteDoc(doc(db, 'members', memberId));
      
      // Remove member's visits
      const memberVisits = visits.filter(visit => visit.memberId === memberId);
      await Promise.all(
        memberVisits.map(visit => 
          visit.id ? deleteDoc(doc(db, 'visits', visit.id)) : Promise.resolve()
        )
      );
    } catch (err) {
      console.error('Error removing member:', err);
      throw new Error('Erreur lors de la suppression du membre');
    }
  }, [visits, isFirebaseAvailable]);

  // Visits operations
  const addVisit = useCallback(async (memberId: string, memberName: string, location?: { latitude: number; longitude: number }) => {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase non disponible');
    }

    try {
      const now = Timestamp.now();
      
      // Add visit record
      await addDoc(collection(db, 'visits'), {
        memberId,
        memberName,
        date: now,
        location,
        createdAt: now
      });

      // Update member's visit count
      const member = members.find(m => m.id === memberId);
      if (member) {
        const newVisits = member.visits + 1;
        const newRewards = Math.floor(newVisits / 10);
        const newLevel = getMemberLevel(newVisits);

        await updateMember(memberId, {
          visits: newVisits,
          totalRewards: newRewards,
          level: newLevel,
          lastVisit: now
        });

        return {
          newVisits,
          newRewards,
          hasNewReward: newRewards > member.totalRewards
        };
      }
    } catch (err) {
      console.error('Error adding visit:', err);
      throw new Error('Erreur lors de l\'ajout de la visite');
    }
  }, [members, updateMember, isFirebaseAvailable]);

  // Get member by name (for login)
  const getMemberByName = useCallback((name: string): FirebaseMember | null => {
    return members.find(member => 
      member.name.toLowerCase() === name.toLowerCase()
    ) || null;
  }, [members]);

  // Get member visits
  const getMemberVisits = useCallback((memberId: string): FirebaseVisit[] => {
    return visits.filter(visit => visit.memberId === memberId);
  }, [visits]);

  // Get admin by gym name
  const getAdminByGymName = useCallback(async (gymName: string): Promise<FirebaseAdmin | null> => {
    if (!isFirebaseAvailable()) {
      return null;
    }

    try {
      // First check if we already have the admin in our local state
      const localAdmin = admins.find(admin => 
        admin.gymName.toLowerCase() === gymName.toLowerCase()
      );
      
      if (localAdmin) {
        return localAdmin;
      }

      // If not found locally, query Firebase
      const adminsQuery = query(
        collection(db, 'admins'), 
        where('gymName', '==', gymName)
      );
      const snapshot = await getDocs(adminsQuery);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as FirebaseAdmin;
      }
      
      return null;
    } catch (err) {
      console.error('Error getting admin by gym name:', err);
      return null;
    }
  }, [admins, isFirebaseAvailable]);

  // Helper function to determine member level
  const getMemberLevel = (visits: number): string => {
    if (visits >= 150) return 'Platine';
    if (visits >= 70) return 'Or';
    if (visits >= 30) return 'Argent';
    return 'Bronze';
  };

  return {
    // Data
    clubInfo,
    rewards,
    members,
    visits,
    admins,
    isLoading,
    error,

    // Club operations
    updateClubInfo,

    // Rewards operations
    addReward,
    removeReward,

    // Members operations
    addMember,
    updateMember,
    removeMember,
    getMemberByName,
    getMemberVisits,

    // Visits operations
    addVisit,

    // Admin operations
    getAdminByGymName,

    // Utils
    clearError: () => setError(null),
    isFirebaseAvailable
  };
};