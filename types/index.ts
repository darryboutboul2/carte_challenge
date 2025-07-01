export interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  visits: number;
  totalRewards: number;
  level: MemberLevel;
  joinDate: string;
  lastVisit: string | null;
  adminId: string; // Nouveau: ID de l'admin propriétaire
}

export interface Visit {
  id: string;
  memberId: string;
  adminId: string; // Nouveau: ID de l'admin propriétaire
  date: string;
  timestamp: number;
}

export interface Reward {
  id: string;
  memberId: string;
  adminId: string; // Nouveau: ID de l'admin propriétaire
  type: string;
  description: string;
  date: string;
  claimed: boolean;
  rarity: RewardRarity;
  requiredVisits: number;
}

export interface RewardCatalog {
  id: string;
  name: string;
  description: string;
  requiredVisits: number;
  rarity: RewardRarity;
  emoji: string;
  adminId: string; // Nouveau: ID de l'admin propriétaire
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gymName: string;
  createdAt: string;
  isActive: boolean;
  subscription?: {
    plan: 'free' | 'premium' | 'enterprise';
    expiresAt: string;
    features: string[];
  };
}

export interface ClubInfo {
  id?: string;
  adminId: string; // Nouveau: ID de l'admin propriétaire
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

export type MemberLevel = 'Bronze' | 'Argent' | 'Or' | 'Platine';
export type RewardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface MotivationMessage {
  id: string;
  category: 'welcome' | 'beginner' | 'progress' | 'reward_alert' | 'achievement';
  message: string;
  condition: (visits: number, rewards: number) => boolean;
}

export interface AuthState {
  currentAdmin: Admin | null;
  currentMember: Member | null;
  isAdminMode: boolean;
  isLoading: boolean;
}