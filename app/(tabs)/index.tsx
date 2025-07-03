import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useFitnessLoyalty } from '@/hooks/useFitnessLoyalty';
import { useMotivation } from '@/hooks/useMotivation';
import MemberLogin from '@/components/MemberLogin';
import VisitButton from '@/components/VisitButton';
import RewardModal from '@/components/RewardModal';
import MotivationModal from '@/components/MotivationModal';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function HomeScreen() {
  // 1) Hooks EN HAUT du composant
  const {
    currentAdmin,
    currentMember,
    isAdminMode,
    loginMember,
    switchToMemberMode,
    isLoading: authLoading,
  } = useAuth();

  const {
    currentMember: fitnessCurrentMember,
    isLoading: loyaltyLoading,
    loginMember: fitnessLogin,
    addVisit,
    getProgressToNextReward,
    getRecentVisits,
  } = useFitnessLoyalty();

  const { getMotivationMessage } = useMotivation();

  // États locaux
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showMotivationModal, setShowMotivationModal] = useState(false);
  const [currentMotivation, setCurrentMotivation] = useState<any>(null);
  const [isProcessingVisit, setIsProcessingVisit] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const activeMember = fitnessCurrentMember || currentMember;

  // 2) handleMemberLogin corrigé avec gestion d'état
  const handleMemberLogin = async (name: string) => {
    console.log('📍 Début de handleMemberLogin avec:', name);

    if (isLoggingIn) {
      console.log('⚠️ Connexion déjà en cours, ignorer');
      return;
    }

    setIsLoggingIn(true);

    try {
      if (currentAdmin) {
        console.log('🔑 Connexion via admin:', currentAdmin.id);
        await loginMember(name, currentAdmin.id);
      } else {
        console.log('🏃 Connexion via fitness loyalty');
        await fitnessLogin(name);
      }
      console.log('✅ Connexion réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la connexion membre:', error);
      Alert.alert(
        'Erreur de connexion',
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de la connexion'
      );
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 3) handleValidateVisit devient async
  const handleValidateVisit = async () => {
    if (!activeMember) return;
    setIsProcessingVisit(true);

    try {
      const result = await addVisit();
      if (result) {
        const motivationMsg = getMotivationMessage(
          result.member.visits,
          result.member.totalRewards
        );
        if (motivationMsg) {
          setCurrentMotivation(motivationMsg);
          setShowMotivationModal(true);
        }
        if (result.newReward) {
          setTimeout(() => setShowRewardModal(true), motivationMsg ? 2000 : 500);
        }
      }
    } finally {
      setTimeout(() => setIsProcessingVisit(false), 2000);
    }
  };

  const handleSwitchToMemberMode = async () => {
    await switchToMemberMode();
  };

  const getMemberLevelEmoji = (level: string) => {
    switch (level) {
      case 'Bronze':
        return '🥉';
      case 'Argent':
        return '🥈';
      case 'Or':
        return '🥇';
      case 'Platine':
        return '💎';
      default:
        return '🏃';
    }
  };

  const getMemberLevelColor = (level: string): [string, string] => {
    switch (level) {
      case 'Bronze':
        return ['#cd7f32', '#b8690a'];
      case 'Argent':
        return ['#c0c0c0', '#a8a8a8'];
      case 'Or':
        return ['#ffd700', '#ffb347'];
      case 'Platine':
        return ['#e5e4e2', '#d3d3d3'];
      default:
        return ['#6b7280', '#4b5563'];
    }
  };

  if (authLoading || loyaltyLoading) {
    return (
      <LinearGradient
        colors={['#1e1b4b', '#581c87', '#be185d']}
        style={styles.loadingContainer}
      >
        <MaterialCommunityIcons name="loading" size={32} color="white" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </LinearGradient>
    );
  }

  // Cas écran de login : on wrappe dans un ScrollView pour autoriser la première tape
  if (!activeMember) {
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.wrapper}>
        <ScrollView
          contentContainerStyle={styles.loginContainer}
          keyboardShouldPersistTaps="handled"
        >
          <MemberLogin
            onLogin={handleMemberLogin}
            gymName={currentAdmin?.gymName || 'Carte Challenge'}
            onBackToAdmin={
              isAdminMode && currentAdmin
                ? () => router.replace('/(tabs)')
                : undefined
            }
            isLoading={isLoggingIn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  const progress = getProgressToNextReward();
  const recentVisits = getRecentVisits(3);
  const levelColors = getMemberLevelColor(activeMember.level);

  return (
    <LinearGradient
      colors={['#1e1b4b', '#581c87', '#be185d']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* En-tête */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Bonjour {activeMember.name}</Text>
            <Text style={styles.headerSubtitle}>
              Prêt pour votre entraînement chez{' '}
              {currentAdmin?.gymName || 'Carte Challenge'} ?
            </Text>
          </View>

          {/* Carte Membre */}
          <View style={styles.memberCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.cardGradient}
            >
              {/* ... contenu de la carte ... */}
            </LinearGradient>
          </View>

          {/* Progression */}
          {/* ... reste du contenu ... */}

          {/* Bouton Visite */}
          <VisitButton
            onValidateVisit={handleValidateVisit}
            isProcessing={isProcessingVisit}
          />

          {/* Activité récente */}
          {/* ... */}
        </ScrollView>
      </SafeAreaView>

      {/* Modales */}
      <RewardModal
        visible={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        visits={activeMember.visits}
        rewardCount={activeMember.totalRewards}
      />

      <MotivationModal
        visible={showMotivationModal}
        onClose={() => setShowMotivationModal(false)}
        message={currentMotivation}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    marginTop: 8,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  memberCard: {
    margin: 24,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  // ... gardez le reste de vos styles existants ...
});
