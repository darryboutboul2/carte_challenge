import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const {
    currentAdmin,
    currentMember,
    isAdminMode,
    loginMember: authLoginMember,
    switchToMemberMode,
    isLoading: authLoading,
  } = useAuth();

  const {
    currentMember: fitnessCurrentMember,
    isLoading: loyaltyLoading,
    addVisit,
    getProgressToNextReward,
    getRecentVisits,
  } = useFitnessLoyalty();

  const { getMotivationMessage } = useMotivation();

  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showMotivationModal, setShowMotivationModal] = useState(false);
  const [currentMotivation, setCurrentMotivation] = useState<any>(null);
  const [isProcessingVisit, setIsProcessingVisit] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const activeMember = fitnessCurrentMember || currentMember;

  const handleMemberLogin = async (name: string) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    try {
      // on appelle toujours authLoginMember :
      // - si on est admin, il gère la création via admin.id
      // - sinon, il tombe en fallback fitness-loyalty
      await authLoginMember(name.trim(), currentAdmin?.id);
      // une fois connecté, on force la navigation
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        'Erreur de connexion',
        error instanceof Error
          ? error.message
          : 'Un problème est survenu'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleValidateVisit = async () => {
    if (!activeMember) return;
    setIsProcessingVisit(true);
    try {
      const result = await addVisit();
      if (result) {
        const msg = getMotivationMessage(
          result.member.visits,
          result.member.totalRewards
        );
        if (msg) {
          setCurrentMotivation(msg);
          setShowMotivationModal(true);
        }
        if (result.newReward) {
          setTimeout(() => setShowRewardModal(true), msg ? 2000 : 500);
        }
      }
    } finally {
      setTimeout(() => setIsProcessingVisit(false), 2000);
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

  // Écran de connexion si pas encore de member
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
                ? () => switchToMemberMode()
                : undefined
            }
            isLoading={isLoggingIn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Écran principal une fois connecté
  const progress = getProgressToNextReward();
  const recentVisits = getRecentVisits(3);

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
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Bonjour {activeMember.name}
            </Text>
            <Text style={styles.headerSubtitle}>
              Prêt pour votre entraînement chez{' '}
              {currentAdmin?.gymName || 'Carte Challenge'} ?
            </Text>
          </View>

          <View style={styles.memberCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>
                    {activeMember.name}
                  </Text>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>
                      {activeMember.level}
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name="trophy"
                  size={32}
                  color="#fbbf24"
                />
              </View>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {activeMember.visits}
                  </Text>
                  <Text style={styles.statLabel}>Passages</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {activeMember.totalRewards}
                  </Text>
                  <Text style={styles.statLabel}>Récompenses</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {Math.floor(activeMember.visits / 7)}
                  </Text>
                  <Text style={styles.statLabel}>Semaines</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>
              Progression vers la prochaine récompense
            </Text>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                  {progress.current} / {progress.required} passages
                </Text>
                <Text style={styles.progressPercentage}>
                  {Math.round(progress.percentage)}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${progress.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressSubtext}>
                Plus que {progress.required - progress.current} passage
                {progress.required - progress.current > 1 ? 's' : ''} !
              </Text>
            </View>
          </View>

          <VisitButton
            onValidateVisit={handleValidateVisit}
            isProcessing={isProcessingVisit}
          />

          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Activité récente</Text>
            {recentVisits.length > 0 ? (
              recentVisits.map((visit) => (
                <View key={visit.id} style={styles.activityItem}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={16}
                    color="#6b7280"
                  />
                  <Text style={styles.activityText}>
                    {new Date(visit.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noActivityText}>
                Aucune activité récente
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

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
  wrapper: { flex: 1 },
  loginContainer: { flex: 1, justifyContent: 'center', padding: 16 },
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
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
  header: { padding: 24, paddingBottom: 16 },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  memberCard: { margin: 24, marginTop: 8, borderRadius: 16, overflow: 'hidden' },
  cardGradient: { padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    overflow: 'hidden',
  },
  levelText: { fontSize: 14, fontWeight: '600', color: 'white' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 4,
  },
  progressSection: { marginHorizontal: 24, marginBottom: 8 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: { fontSize: 16, fontWeight: '600', color: 'white' },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 4,
  },
  progressSubtext: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  activitySection: { marginHorizontal: 24, marginBottom: 32 },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  activityText: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  noActivityText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    padding: 20,
  },
});
