import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { useFirebaseData } from './useFirebaseData';

// Storage utilities for hybrid platform support (fallback)
const storage = {
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    }
  },
  getItem: (key: string): string | null => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return null;
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    }
  }
};

export interface ClubInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  instagram: string;
  facebook: string;
  welcomeMessage: string;
  hours: string;
}

export interface AdminReward {
  id: string;
  name: string;
  description: string;
  requiredVisits: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  emoji: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  visits: number;
  totalRewards: number;
  level: string;
  joinDate: string;
  lastVisit?: string | null;
}

const STORAGE_KEYS = {
  CLUB_INFO: 'admin_club_info',
  ADMIN_REWARDS: 'admin_rewards',
  ADMIN_USERS: 'admin_users'
};

const DEFAULT_CLUB_INFO: ClubInfo = {
  name: 'Carte Challenge',
  phone: '+33 1 23 45 67 89',
  email: 'contact@cartechallenge.com',
  address: '123 Rue du Fitness, 75001 Paris, France',
  website: 'https://www.cartechallenge.com',
  instagram: 'https://instagram.com/cartechallenge',
  facebook: 'https://facebook.com/cartechallenge',
  welcomeMessage: 'Notre équipe est disponible du lundi au vendredi de 9h à 18h pour répondre à toutes vos questions concernant votre programme de fidélité, les récompenses ou l\'utilisation de la salle.',
  hours: 'Lundi - Vendredi : 6h00 - 23h00\nSamedi : 8h00 - 20h00\nDimanche : 9h00 - 18h00'
};

const DEFAULT_REWARDS: AdminReward[] = [
  {
    id: '1',
    name: 'Gourde Premium',
    description: 'Gourde isotherme premium avec logo de la salle',
    requiredVisits: 10,
    rarity: 'common',
    emoji: '🚰'
  },
  {
    id: '2',
    name: 'Séance avec Coach',
    description: 'Une séance personnalisée avec un coach professionnel',
    requiredVisits: 25,
    rarity: 'rare',
    emoji: '💪'
  },
  {
    id: '3',
    name: 'Tenue de Sport',
    description: 'Ensemble complet tenue de sport premium',
    requiredVisits: 50,
    rarity: 'rare',
    emoji: '👕'
  },
  {
    id: '4',
    name: 'Nuit d\'amour avec Guilhem',
    description: 'Une expérience unique et inoubliable',
    requiredVisits: 100,
    rarity: 'epic',
    emoji: '😍'
  },
  {
    id: '5',
    name: 'Abonnement 1 mois',
    description: 'Un mois d\'abonnement gratuit à la salle',
    requiredVisits: 200,
    rarity: 'epic',
    emoji: '🎫'
  },
  {
    id: '6',
    name: 'Ferrari',
    description: 'Une Ferrari rouge flambant neuve',
    requiredVisits: 1000,
    rarity: 'legendary',
    emoji: '🏎️'
  }
];

export const useAdminData = () => {
  const [clubInfo, setClubInfo] = useState<ClubInfo>(DEFAULT_CLUB_INFO);
  const [rewards, setRewards] = useState<AdminReward[]>(DEFAULT_REWARDS);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Firebase integration
  const {
    clubInfo: firebaseClubInfo,
    rewards: firebaseRewards,
    members: firebaseMembers,
    updateClubInfo: updateFirebaseClubInfo,
    addReward: addFirebaseReward,
    removeReward: removeFirebaseReward,
    addMember: addFirebaseMember,
    removeMember: removeFirebaseMember,
    error: firebaseError
  } = useFirebaseData();

  // Save data to storage (fallback)
  const saveToStorage = useCallback((key: string, data: any) => {
    try {
      storage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }, []);

  // Load data from Firebase or storage
  useEffect(() => {
    try {
      // Load club info
      if (firebaseClubInfo) {
        const clubData: ClubInfo = {
          name: firebaseClubInfo.name,
          phone: firebaseClubInfo.phone,
          email: firebaseClubInfo.email,
          address: firebaseClubInfo.address,
          website: firebaseClubInfo.website,
          instagram: firebaseClubInfo.instagram,
          facebook: firebaseClubInfo.facebook,
          welcomeMessage: firebaseClubInfo.welcomeMessage,
          hours: firebaseClubInfo.hours
        };
        setClubInfo(clubData);
      } else {
        // Fallback to local storage
        const clubData = storage.getItem(STORAGE_KEYS.CLUB_INFO);
        if (clubData) {
          setClubInfo(JSON.parse(clubData));
        }
      }

      // Load rewards
      if (firebaseRewards.length > 0) {
        const rewardsData: AdminReward[] = firebaseRewards.map(reward => ({
          id: reward.id || Date.now().toString(),
          name: reward.name,
          description: reward.description,
          requiredVisits: reward.requiredVisits,
          rarity: reward.rarity,
          emoji: reward.emoji
        }));
        setRewards(rewardsData);
      } else {
        // Fallback to local storage
        const rewardsData = storage.getItem(STORAGE_KEYS.ADMIN_REWARDS);
        if (rewardsData) {
          setRewards(JSON.parse(rewardsData));
        }
      }

      // Load users/members
      if (firebaseMembers.length > 0) {
        const usersData: AdminUser[] = firebaseMembers.map(member => ({
          id: member.id || Date.now().toString(),
          name: member.name,
          email: member.email,
          phone: member.phone,
          visits: member.visits,
          totalRewards: member.totalRewards,
          level: member.level,
          joinDate: member.joinDate.toDate().toISOString(),
          lastVisit: member.lastVisit?.toDate().toISOString() || null
        }));
        setUsers(usersData);
      } else {
        // Fallback to local storage
        const usersData = storage.getItem(STORAGE_KEYS.ADMIN_USERS);
        if (usersData) {
          setUsers(JSON.parse(usersData));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [firebaseClubInfo, firebaseRewards, firebaseMembers]);

  // Club info management
  const updateClubInfo = useCallback(async (newClubInfo: ClubInfo) => {
    try {
      // Update Firebase
      await updateFirebaseClubInfo(newClubInfo);
      setClubInfo(newClubInfo);
    } catch (error) {
      console.error('Error updating club info in Firebase:', error);
      // Fallback to local storage
      setClubInfo(newClubInfo);
      saveToStorage(STORAGE_KEYS.CLUB_INFO, newClubInfo);
      throw error;
    }
  }, [updateFirebaseClubInfo, saveToStorage]);

  // Rewards management
  const addReward = useCallback(async (reward: Omit<AdminReward, 'id'>) => {
    try {
      // Add to Firebase
      await addFirebaseReward({
        name: reward.name,
        description: reward.description,
        requiredVisits: reward.requiredVisits,
        rarity: reward.rarity,
        emoji: reward.emoji
      });
    } catch (error) {
      console.error('Error adding reward to Firebase:', error);
      // Fallback to local storage
      const newReward: AdminReward = {
        ...reward,
        id: Date.now().toString()
      };
      const updatedRewards = [...rewards, newReward];
      setRewards(updatedRewards);
      saveToStorage(STORAGE_KEYS.ADMIN_REWARDS, updatedRewards);
      throw error;
    }
  }, [addFirebaseReward, rewards, saveToStorage]);

  const removeReward = useCallback(async (rewardId: string) => {
    try {
      // Remove from Firebase
      await removeFirebaseReward(rewardId);
    } catch (error) {
      console.error('Error removing reward from Firebase:', error);
      // Fallback to local storage
      const updatedRewards = rewards.filter(r => r.id !== rewardId);
      setRewards(updatedRewards);
      saveToStorage(STORAGE_KEYS.ADMIN_REWARDS, updatedRewards);
      throw error;
    }
  }, [removeFirebaseReward, rewards, saveToStorage]);

  // Users management
  const addUser = useCallback(async (user: Omit<AdminUser, 'id' | 'visits' | 'totalRewards' | 'level' | 'joinDate'>) => {
    try {
      // Add to Firebase
      await addFirebaseMember({
        name: user.name,
        email: user.email,
        phone: user.phone
      });
    } catch (error) {
      console.error('Error adding user to Firebase:', error);
      // Fallback to local storage
      const newUser: AdminUser = {
        ...user,
        id: Date.now().toString(),
        visits: 0,
        totalRewards: 0,
        level: 'Bronze',
        joinDate: new Date().toISOString()
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      saveToStorage(STORAGE_KEYS.ADMIN_USERS, updatedUsers);
      throw error;
    }
  }, [addFirebaseMember, users, saveToStorage]);

  const removeUser = useCallback(async (userId: string) => {
    try {
      // Remove from Firebase
      await removeFirebaseMember(userId);
    } catch (error) {
      console.error('Error removing user from Firebase:', error);
      // Fallback to local storage
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      saveToStorage(STORAGE_KEYS.ADMIN_USERS, updatedUsers);
      throw error;
    }
  }, [removeFirebaseMember, users, saveToStorage]);

  return {
    clubInfo,
    rewards,
    users,
    isLoading,
    error: firebaseError,
    updateClubInfo,
    addReward,
    removeReward,
    addUser,
    removeUser
  };
};