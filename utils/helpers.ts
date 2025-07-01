import { Platform } from 'react-native';
import { REWARD_SYSTEM } from './constants';
import type { MemberLevel } from '@/types';

/**
 * Détermine le niveau d'un membre basé sur ses visites
 */
export const getMemberLevel = (visits: number): MemberLevel => {
  if (visits >= REWARD_SYSTEM.levels.platinum.minVisits) return 'Platine';
  if (visits >= REWARD_SYSTEM.levels.gold.minVisits) return 'Or';
  if (visits >= REWARD_SYSTEM.levels.silver.minVisits) return 'Argent';
  return 'Bronze';
};

/**
 * Calcule le nombre de visites nécessaires pour le niveau suivant
 */
export const getVisitsToNextLevel = (currentVisits: number): number => {
  const levels = Object.values(REWARD_SYSTEM.levels);
  const nextLevel = levels.find(level => level.minVisits > currentVisits);
  return nextLevel ? nextLevel.minVisits - currentVisits : 0;
};

/**
 * Formate une date en français
 */
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  };
  return dateObj.toLocaleDateString('fr-FR', defaultOptions);
};

/**
 * Formate une date avec l'heure
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calcule la distance entre deux coordonnées (en mètres)
 */
export const calculateDistance = (
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number }
): number => {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Vérifie si l'application s'exécute sur le web
 */
export const isWeb = (): boolean => Platform.OS === 'web';

/**
 * Vérifie si l'application s'exécute sur mobile
 */
export const isMobile = (): boolean => Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Génère un ID unique
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Valide une adresse email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un numéro de téléphone français
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
};

/**
 * Nettoie et formate un numéro de téléphone
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('33')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0')) {
    return `+33${cleaned.slice(1)}`;
  }
  return phone;
};

/**
 * Débounce une fonction
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle une fonction
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};