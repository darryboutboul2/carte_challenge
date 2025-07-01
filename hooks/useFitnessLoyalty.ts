import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { Member, Visit, Reward, MemberLevel } from '@/types';
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

const STORAGE_KEYS = {
  CURRENT_MEMBER: 'fitness_current_member',
  VISITS: 'fitness_visits',
  REWARDS: 'fitness_rewards'
};

const getMemberLevel = (visits: number): MemberLevel => {
  if (visits >= 150) return 'Platine';
  if (visits >= 70) return 'Or';
  if (visits >= 30) return 'Argent';
  return 'Bronze';
};

const createDefaultMember = (name: string): Member => ({
  id: Date.now().toString(),
  name,
  visits: 0,
  totalRewards: 0,
  level: 'Bronze',
  joinDate: new Date().toISOString(),
  lastVisit: null,
  adminId: 'default' // Valeur par défaut pour la compatibilité
});

export const useFitnessLoyalty = () => {
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Firebase integration - toujours appeler le hook
  const {
    members: firebaseMembers = [],
    visits: firebaseVisits = [],
    addMember: addFirebaseMember,
    addVisit: addFirebaseVisit,
    getMemberByName,
    getMemberVisits,
    error: firebaseError,
    isFirebaseAvailable
  } = useFirebaseData();

  // Save data to storage
  const saveToStorage = useCallback((key: string, data: any) => {
    try {
      storage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }, []);

  // Load data from storage (fallback) or Firebase
  useEffect(() => {
    try {
      // Try to load from local storage first (for offline support)
      const memberData = storage.getItem(STORAGE_KEYS.CURRENT_MEMBER);
      const visitsData = storage.getItem(STORAGE_KEYS.VISITS);
      const rewardsData = storage.getItem(STORAGE_KEYS.REWARDS);

      if (memberData) {
        const member = JSON.parse(memberData);
        // Check if member exists in Firebase
        if (isFirebaseAvailable && isFirebaseAvailable() && getMemberByName) {
          const firebaseMember = getMemberByName(member.name);
          if (firebaseMember) {
            // Update with Firebase data
            setCurrentMember({
              id: firebaseMember.id || member.id,
              name: firebaseMember.name,
              email: firebaseMember.email,
              phone: firebaseMember.phone,
              visits: firebaseMember.visits,
              totalRewards: firebaseMember.totalRewards,
              level: firebaseMember.level as MemberLevel,
              joinDate: firebaseMember.joinDate.toDate().toISOString(),
              lastVisit: firebaseMember.lastVisit?.toDate().toISOString() || null,
              adminId: 'default'
            });
          } else {
            setCurrentMember(member);
          }
        } else {
          setCurrentMember(member);
        }
      }
      
      if (visitsData) {
        setVisits(JSON.parse(visitsData));
      }
      if (rewardsData) {
        setRewards(JSON.parse(rewardsData));
      }
    } catch (error) {
      console.error('Error loading data from storage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [firebaseMembers, getMemberByName, isFirebaseAvailable]);

  const loginMember = useCallback(async (name: string) => {
    console.log('loginMember appelé avec:', name);
    
    try {
      let member: Member;

      // First check if member exists in Firebase
      if (isFirebaseAvailable && isFirebaseAvailable() && getMemberByName) {
        const firebaseMember = getMemberByName(name);
        
        if (firebaseMember) {
          // Member exists in Firebase
          member = {
            id: firebaseMember.id || Date.now().toString(),
            name: firebaseMember.name,
            email: firebaseMember.email,
            phone: firebaseMember.phone,
            visits: firebaseMember.visits,
            totalRewards: firebaseMember.totalRewards,
            level: firebaseMember.level as MemberLevel,
            joinDate: firebaseMember.joinDate.toDate().toISOString(),
            lastVisit: firebaseMember.lastVisit?.toDate().toISOString() || null,
            adminId: 'default'
          };
          
          console.log('Membre trouvé dans Firebase:', member);
        } else {
          // Create new member locally and in Firebase
          member = createDefaultMember(name);
          console.log('Nouveau membre créé:', member);
          
          // Add to Firebase
          try {
            if (addFirebaseMember) {
              await addFirebaseMember({ name });
              console.log('Membre ajouté à Firebase');
            }
          } catch (error) {
            console.error('Error adding member to Firebase:', error);
            // Continue with local storage if Firebase fails
          }
        }
      } else {
        // Firebase not available, create local member
        console.log('Firebase non disponible, création locale');
        member = createDefaultMember(name);
      }

      setCurrentMember(member);
      saveToStorage(STORAGE_KEYS.CURRENT_MEMBER, member);
      console.log('Membre connecté avec succès:', member);
      
    } catch (error) {
      console.error('Error during login:', error);
      // Fallback to local storage
      const member = createDefaultMember(name);
      setCurrentMember(member);
      saveToStorage(STORAGE_KEYS.CURRENT_MEMBER, member);
      console.log('Fallback: membre créé localement:', member);
    }
  }, [getMemberByName, addFirebaseMember, saveToStorage, isFirebaseAvailable]);

  const logoutMember = useCallback(() => {
    setCurrentMember(null);
    setVisits([]);
    setRewards([]);
    storage.removeItem(STORAGE_KEYS.CURRENT_MEMBER);
    storage.removeItem(STORAGE_KEYS.VISITS);
    storage.removeItem(STORAGE_KEYS.REWARDS);
  }, []);

  const addVisit = useCallback(async () => {
    if (!currentMember) return null;

    try {
      // Add visit to Firebase if possible
      let firebaseResult = null;
      if (currentMember.id && getMemberByName && getMemberByName(currentMember.name) && isFirebaseAvailable && isFirebaseAvailable() && addFirebaseVisit) {
        try {
          firebaseResult = await addFirebaseVisit(
            currentMember.id,
            currentMember.name
          );
        } catch (error) {
          console.error('Error adding visit to Firebase:', error);
        }
      }

      // Update local state
      const newVisit: Visit = {
        id: Date.now().toString(),
        memberId: currentMember.id,
        adminId: currentMember.adminId,
        date: new Date().toISOString(),
        timestamp: Date.now()
      };

      const updatedVisits = [...visits, newVisit];
      const newVisitCount = firebaseResult?.newVisits || currentMember.visits + 1;
      const newLevel = getMemberLevel(newVisitCount);
      
      // Check if a new reward is earned (every 10 visits)
      const newRewardsCount = Math.floor(newVisitCount / 10);
      const hasNewReward = firebaseResult?.hasNewReward || newRewardsCount > currentMember.totalRewards;

      const updatedMember = {
        ...currentMember,
        visits: newVisitCount,
        level: newLevel,
        lastVisit: new Date().toISOString(),
        totalRewards: firebaseResult?.newRewards || newRewardsCount
      };

      // Add new reward if earned
      if (hasNewReward) {
        const newReward: Reward = {
          id: Date.now().toString() + '_reward',
          memberId: currentMember.id,
          adminId: currentMember.adminId,
          type: 'visit_milestone',
          description: `Récompense pour ${newVisitCount} passages`,
          date: new Date().toISOString(),
          claimed: false,
          rarity: 'common',
          requiredVisits: newVisitCount
        };
        
        const updatedRewards = [...rewards, newReward];
        setRewards(updatedRewards);
        saveToStorage(STORAGE_KEYS.REWARDS, updatedRewards);
      }

      setCurrentMember(updatedMember);
      setVisits(updatedVisits);
      saveToStorage(STORAGE_KEYS.CURRENT_MEMBER, updatedMember);
      saveToStorage(STORAGE_KEYS.VISITS, updatedVisits);

      return {
        visit: newVisit,
        newReward: hasNewReward,
        member: updatedMember
      };
    } catch (error) {
      console.error('Error adding visit:', error);
      // Fallback to local-only operation
      const newVisit: Visit = {
        id: Date.now().toString(),
        memberId: currentMember.id,
        adminId: currentMember.adminId,
        date: new Date().toISOString(),
        timestamp: Date.now()
      };

      const updatedVisits = [...visits, newVisit];
      const newVisitCount = currentMember.visits + 1;
      const newLevel = getMemberLevel(newVisitCount);
      const newRewardsCount = Math.floor(newVisitCount / 10);
      const hasNewReward = newRewardsCount > currentMember.totalRewards;

      const updatedMember = {
        ...currentMember,
        visits: newVisitCount,
        level: newLevel,
        lastVisit: new Date().toISOString(),
        totalRewards: newRewardsCount
      };

      setCurrentMember(updatedMember);
      setVisits(updatedVisits);
      saveToStorage(STORAGE_KEYS.CURRENT_MEMBER, updatedMember);
      saveToStorage(STORAGE_KEYS.VISITS, updatedVisits);

      return {
        visit: newVisit,
        newReward: hasNewReward,
        member: updatedMember
      };
    }
  }, [currentMember, visits, rewards, saveToStorage, getMemberByName, addFirebaseVisit, isFirebaseAvailable]);

  const getProgressToNextReward = useCallback(() => {
    if (!currentMember) return { current: 0, required: 10, percentage: 0 };
    
    const current = currentMember.visits % 10;
    const required = 10;
    const percentage = (current / required) * 100;
    
    return { current, required, percentage };
  }, [currentMember]);

  const getRecentVisits = useCallback((limit: number = 5) => {
    if (currentMember?.id && firebaseVisits && firebaseVisits.length > 0 && isFirebaseAvailable && isFirebaseAvailable() && getMemberVisits) {
      // Use Firebase visits if available
      const memberFirebaseVisits = getMemberVisits(currentMember.id);
      return memberFirebaseVisits
        .slice(0, limit)
        .map(visit => ({
          id: visit.id || Date.now().toString(),
          memberId: visit.memberId,
          adminId: 'default',
          date: visit.date.toDate().toISOString(),
          timestamp: visit.date.toDate().getTime()
        }));
    }
    
    // Fallback to local visits
    return visits
      .filter(visit => visit.memberId === currentMember?.id)
      .slice(-limit)
      .reverse();
  }, [visits, currentMember, firebaseVisits, getMemberVisits, isFirebaseAvailable]);

  const getMemberStats = useCallback(() => {
    if (!currentMember) return null;

    const memberVisits = getRecentVisits(5);
    const memberRewards = rewards.filter(r => r.memberId === currentMember.id);
    
    return {
      totalVisits: currentMember.visits,
      totalRewards: currentMember.totalRewards,
      currentLevel: currentMember.level,
      nextLevelVisits: getNextLevelVisits(currentMember.visits),
      joinDate: currentMember.joinDate,
      lastVisit: currentMember.lastVisit,
      recentVisits: memberVisits,
      unclaimedRewards: memberRewards.filter(r => !r.claimed).length
    };
  }, [currentMember, rewards, getRecentVisits]);

  const getNextLevelVisits = (currentVisits: number): number => {
    if (currentVisits < 30) return 30;
    if (currentVisits < 70) return 70;
    if (currentVisits < 150) return 150;
    return 300; // Next milestone after Platine
  };

  return {
    currentMember,
    visits,
    rewards,
    isLoading: isLoading,
    error: firebaseError,
    loginMember,
    logoutMember,
    addVisit,
    getProgressToNextReward,
    getRecentVisits,
    getMemberStats
  };
};