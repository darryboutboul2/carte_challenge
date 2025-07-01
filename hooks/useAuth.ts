import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { Admin, Member, AuthState } from '@/types';
import { useFirebaseAuth } from './useFirebaseAuth';

// Storage utilities for hybrid platform support (fallback)
const storage = {
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  },
  getItem: (key: string): string | null => {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
      }
    }
    return null;
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
    }
  }
};

const STORAGE_KEYS = {
  CURRENT_ADMIN: 'auth_current_admin',
  CURRENT_MEMBER: 'auth_current_member',
  IS_ADMIN_MODE: 'auth_is_admin_mode'
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    currentAdmin: null,
    currentMember: null,
    isAdminMode: false,
    isLoading: true
  });

  // Firebase integration
  const {
    currentAdmin: firebaseAdmin,
    currentMember: firebaseMember,
    loginAdmin: firebaseLoginAdmin,
    loginMember: firebaseLoginMember,
    registerAdmin: firebaseRegisterAdmin,
    logoutAdmin: firebaseLogoutAdmin,
    logoutMember: firebaseLogoutMember,
    switchToAdminMode: firebaseSwitchToAdminMode,
    switchToMemberMode: firebaseSwitchToMemberMode,
    error: firebaseError,
    isAuthAvailable
  } = useFirebaseAuth();

  // Load auth state from storage or Firebase
  useEffect(() => {
    try {
      // Load from local storage first (for offline support)
      const adminData = storage.getItem(STORAGE_KEYS.CURRENT_ADMIN);
      const memberData = storage.getItem(STORAGE_KEYS.CURRENT_MEMBER);
      const isAdminMode = storage.getItem(STORAGE_KEYS.IS_ADMIN_MODE) === 'true';

      // Update with Firebase data if available
      setAuthState({
        currentAdmin: firebaseAdmin || (adminData ? JSON.parse(adminData) : null),
        currentMember: firebaseMember || (memberData ? JSON.parse(memberData) : null),
        isAdminMode: firebaseAdmin ? true : isAdminMode,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading auth state:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [firebaseAdmin, firebaseMember]);

  // Save to storage
  const saveToStorage = useCallback((key: string, data: any) => {
    try {
      if (data) {
        storage.setItem(key, JSON.stringify(data));
      } else {
        storage.removeItem(key);
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }, []);

  // Admin authentication
  const loginAdmin = useCallback(async (email: string, password: string) => {
    if (!isAuthAvailable()) {
      throw new Error('Service d\'authentification non disponible');
    }

    try {
      const admin = await firebaseLoginAdmin(email, password);
      setAuthState(prev => ({
        ...prev,
        currentAdmin: admin,
        isAdminMode: true
      }));
      saveToStorage(STORAGE_KEYS.CURRENT_ADMIN, admin);
      saveToStorage(STORAGE_KEYS.IS_ADMIN_MODE, 'true');
      return admin;
    } catch (error) {
      console.error('Error logging in admin:', error);
      throw error;
    }
  }, [firebaseLoginAdmin, saveToStorage, isAuthAvailable]);

  const registerAdmin = useCallback(async (adminData: {
    name: string;
    email: string;
    password: string;
    gymName: string;
    phone?: string;
  }) => {
    if (!isAuthAvailable()) {
      throw new Error('Service d\'authentification non disponible');
    }

    try {
      const admin = await firebaseRegisterAdmin(adminData);
      setAuthState(prev => ({
        ...prev,
        currentAdmin: admin,
        isAdminMode: true
      }));
      saveToStorage(STORAGE_KEYS.CURRENT_ADMIN, admin);
      saveToStorage(STORAGE_KEYS.IS_ADMIN_MODE, 'true');
      return admin;
    } catch (error) {
      console.error('Error registering admin:', error);
      throw error;
    }
  }, [firebaseRegisterAdmin, saveToStorage, isAuthAvailable]);

  const logoutAdmin = useCallback(async () => {
    try {
      if (isAuthAvailable()) {
        await firebaseLogoutAdmin();
      }
      setAuthState(prev => ({
        ...prev,
        currentAdmin: null,
        currentMember: null,
        isAdminMode: false
      }));
      storage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
      storage.removeItem(STORAGE_KEYS.CURRENT_MEMBER);
      storage.removeItem(STORAGE_KEYS.IS_ADMIN_MODE);
    } catch (error) {
      console.error('Error logging out admin:', error);
      throw error;
    }
  }, [firebaseLogoutAdmin, isAuthAvailable]);

  // Member authentication
  const loginMember = useCallback(async (name: string, adminId?: string) => {
    try {
      // Use current admin's ID if not provided
      const targetAdminId = adminId || authState.currentAdmin?.id;
      if (!targetAdminId) {
        throw new Error('Aucun admin sélectionné');
      }

      let member: Member;

      if (isAuthAvailable()) {
        member = await firebaseLoginMember(name, targetAdminId);
      } else {
        // Fallback local creation
        member = {
          id: Date.now().toString(),
          name,
          visits: 0,
          totalRewards: 0,
          level: 'Bronze',
          joinDate: new Date().toISOString(),
          lastVisit: null,
          adminId: targetAdminId
        };
      }

      setAuthState(prev => ({
        ...prev,
        currentMember: member,
        isAdminMode: false
      }));
      saveToStorage(STORAGE_KEYS.CURRENT_MEMBER, member);
      saveToStorage(STORAGE_KEYS.IS_ADMIN_MODE, 'false');
      return member;
    } catch (error) {
      console.error('Error logging in member:', error);
      throw error;
    }
  }, [firebaseLoginMember, authState.currentAdmin, saveToStorage, isAuthAvailable]);

  const logoutMember = useCallback(async () => {
    try {
      if (isAuthAvailable()) {
        await firebaseLogoutMember();
      }
      setAuthState(prev => ({
        ...prev,
        currentMember: null,
        isAdminMode: !!prev.currentAdmin
      }));
      storage.removeItem(STORAGE_KEYS.CURRENT_MEMBER);
      saveToStorage(STORAGE_KEYS.IS_ADMIN_MODE, authState.currentAdmin ? 'true' : 'false');
    } catch (error) {
      console.error('Error logging out member:', error);
      throw error;
    }
  }, [firebaseLogoutMember, authState.currentAdmin, saveToStorage, isAuthAvailable]);

  // Mode switching
  const switchToAdminMode = useCallback(async () => {
    if (!authState.currentAdmin) {
      throw new Error('Aucun admin connecté');
    }

    try {
      if (isAuthAvailable()) {
        await firebaseSwitchToAdminMode();
      }
      setAuthState(prev => ({ ...prev, isAdminMode: true }));
      saveToStorage(STORAGE_KEYS.IS_ADMIN_MODE, 'true');
    } catch (error) {
      console.error('Error switching to admin mode:', error);
      throw error;
    }
  }, [authState.currentAdmin, firebaseSwitchToAdminMode, saveToStorage, isAuthAvailable]);

  const switchToMemberMode = useCallback(async () => {
    try {
      if (isAuthAvailable()) {
        await firebaseSwitchToMemberMode();
      }
      setAuthState(prev => ({ ...prev, isAdminMode: false }));
      saveToStorage(STORAGE_KEYS.IS_ADMIN_MODE, 'false');
    } catch (error) {
      console.error('Error switching to member mode:', error);
      throw error;
    }
  }, [firebaseSwitchToMemberMode, saveToStorage, isAuthAvailable]);

  // Utility functions
  const isAuthenticated = useCallback(() => {
    return !!(authState.currentAdmin || authState.currentMember);
  }, [authState]);

  const hasAdminAccess = useCallback(() => {
    return !!(authState.currentAdmin && authState.isAdminMode);
  }, [authState]);

  const getCurrentAdminId = useCallback(() => {
    return authState.currentAdmin?.id || null;
  }, [authState.currentAdmin]);

  return {
    // State
    ...authState,
    error: firebaseError,

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

    // Utilities
    isAuthenticated,
    hasAdminAccess,
    getCurrentAdminId,
    isAuthAvailable
  };
};