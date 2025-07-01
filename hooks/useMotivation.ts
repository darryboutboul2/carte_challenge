import { useMemo } from 'react';
import { MotivationMessage } from '@/types';

const MOTIVATION_MESSAGES: MotivationMessage[] = [
  {
    id: '1',
    category: 'welcome',
    message: '🎉 Bienvenue dans votre parcours fitness ! Chaque passage compte.',
    condition: (visits) => visits === 0
  },
  {
    id: '2',
    category: 'beginner',
    message: '💪 Premier passage validé ! C\'est le début d\'une belle aventure.',
    condition: (visits) => visits === 1
  },
  {
    id: '3',
    category: 'progress',
    message: '🔥 5 passages déjà ! Vous êtes sur la bonne voie.',
    condition: (visits) => visits === 5
  },
  {
    id: '4',
    category: 'reward_alert',
    message: '🏆 Plus que 2 passages avant votre prochaine récompense !',
    condition: (visits) => visits % 10 === 8
  },
  {
    id: '5',
    category: 'reward_alert',
    message: '🎁 Plus qu\'un passage avant votre récompense !',
    condition: (visits) => visits % 10 === 9
  },
  {
    id: '6',
    category: 'achievement',
    message: '🥉 Félicitations ! Vous êtes maintenant membre Argent !',
    condition: (visits) => visits === 30
  },
  {
    id: '7',
    category: 'achievement',
    message: '🥈 Incroyable ! Niveau Or atteint !',
    condition: (visits) => visits === 70
  },
  {
    id: '8',
    category: 'achievement',
    message: '🥇 Exceptionnel ! Vous êtes maintenant Platine !',
    condition: (visits) => visits === 150
  },
  {
    id: '9',
    category: 'progress',
    message: '⚡ 25 passages ! Votre régularité est impressionnante.',
    condition: (visits) => visits === 25
  },
  {
    id: '10',
    category: 'progress',
    message: '🎯 100 passages ! Vous êtes un vrai champion !',
    condition: (visits) => visits === 100
  }
];

export const useMotivation = () => {
  const getMotivationMessage = (visits: number, rewards: number): MotivationMessage | null => {
    const applicableMessages = MOTIVATION_MESSAGES.filter(msg => 
      msg.condition(visits, rewards)
    );
    
    // Return the most specific message (last one that matches)
    return applicableMessages.length > 0 ? applicableMessages[applicableMessages.length - 1] : null;
  };

  const getRandomEncouragement = (): string => {
    const encouragements = [
      '💪 Continuez comme ça !',
      '🔥 Vous êtes en feu !',
      '⭐ Excellent travail !',
      '🎯 Objectif atteint !',
      '🚀 Vers de nouveaux sommets !',
      '💎 Performance de qualité !',
      '🏋️ Champion du fitness !',
      '⚡ Énergie au maximum !'
    ];
    
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  };

  const shouldShowMotivation = (visits: number, rewards: number): boolean => {
    return getMotivationMessage(visits, rewards) !== null;
  };

  return {
    getMotivationMessage,
    getRandomEncouragement,
    shouldShowMotivation
  };
};