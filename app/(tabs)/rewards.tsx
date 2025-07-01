import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFitnessLoyalty } from '@/hooks/useFitnessLoyalty';
import { useAdminData } from '@/hooks/useAdminData';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { RewardRarity } from '@/types';

export default function RewardsScreen() {
  const { currentMember } = useFitnessLoyalty();
  const { rewards: REWARD_CATALOG } = useAdminData();

  const getRarityColors = (rarity: RewardRarity) => {
    switch (rarity) {
      case 'common':
        return ['#6b7280', '#4b5563'];
      case 'rare':
        return ['#3b82f6', '#1d4ed8'];
      case 'epic':
        return ['#8b5cf6', '#7c3aed'];
      case 'legendary':
        return ['#fbbf24', '#f59e0b'];
    }
  };

  const getRarityIcon = (rarity: RewardRarity) => {
    switch (rarity) {
      case 'common':
        return <MaterialCommunityIcons name="gift" size={20} color="white" />;
      case 'rare':
        return <Star size={20} color="white" />;
      case 'epic':
        return <Zap size={20} color="white" />;
      case 'legendary':
        return <MaterialCommunityIcons name="trophy" size={20} color="white" />;
    }
  };

  const getRarityLabel = (rarity: RewardRarity) => {
    switch (rarity) {
      case 'common':
        return 'Commun';
      case 'rare':
        return 'Rare';
      case 'epic':
        return 'Épique';
      case 'legendary':
        return 'Légendaire';
    }
  };

  const isRewardAvailable = (requiredVisits: number) => {
    return currentMember ? currentMember.visits >= requiredVisits : false;
  };

  const getProgressToReward = (requiredVisits: number) => {
    if (!currentMember) return 0;
    return Math.min((currentMember.visits / requiredVisits) * 100, 100);
  };

  if (!currentMember) {
    return (
      <LinearGradient colors={['#1e1b4b', '#581c87', '#be185d']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notLoggedIn}>
            <MaterialCommunityIcons name="gift" size={64} color="rgba(255, 255, 255, 0.5)" />
            <Text style={styles.notLoggedInText}>
              Connectez-vous pour voir vos récompenses
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1e1b4b', '#581c87', '#be185d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Récompenses</Text>
          <Text style={styles.headerSubtitle}>
            {currentMember.visits} passages • {currentMember.totalRewards} récompense{currentMember.totalRewards > 1 ? 's' : ''}
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.rewardsGrid}>
            {REWARD_CATALOG.map((reward) => {
              const isAvailable = isRewardAvailable(reward.requiredVisits);
              const progress = getProgressToReward(reward.requiredVisits);
              const rarityColors = getRarityColors(reward.rarity);

              return (
                <TouchableOpacity
                  key={reward.id}
                  style={[styles.rewardCard, isAvailable && styles.rewardCardAvailable]}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isAvailable ? rarityColors : ['#374151', '#1f2937']}
                    style={styles.rewardGradient}
                  >
                    <View style={styles.rewardHeader}>
                      <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
                      <View style={styles.rarityBadge}>
                        {getRarityIcon(reward.rarity)}
                        <Text style={styles.rarityText}>
                          {getRarityLabel(reward.rarity)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.rewardName}>{reward.name}</Text>
                    <Text style={styles.rewardDescription}>{reward.description}</Text>

                    <View style={styles.requirementContainer}>
                      <Text style={styles.requirementText}>
                        {reward.requiredVisits} passages requis
                      </Text>
                      
                      {!isAvailable && (
                        <>
                          <View style={styles.progressContainer}>
                            <View style={styles.progressBarBg}>
                              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                            </View>
                            <Text style={styles.progressText}>
                              {Math.round(progress)}%
                            </Text>
                          </View>
                          <Text style={styles.remainingText}>
                            Encore {reward.requiredVisits - currentMember.visits} passage{reward.requiredVisits - currentMember.visits > 1 ? 's' : ''}
                          </Text>
                        </>
                      )}

                      {isAvailable && (
                        <View style={styles.availableBadge}>
                          <Text style={styles.availableText}>✅ Disponible</Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Comment ça marche ?</Text>
            <Text style={styles.infoText}>
              • Chaque 10 passages vous rapporte 1 crédit de récompense{'\n'}
              • Les récompenses ont différents niveaux de rareté{'\n'}
              • Plus vous venez régulièrement, plus vous débloquez de récompenses{'\n'}
              • Les récompenses légendaires nécessitent une assiduité exceptionnelle
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
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
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollView: {
    flex: 1,
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notLoggedInText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 16,
  },
  rewardsGrid: {
    padding: 24,
    paddingTop: 8,
    gap: 16,
  },
  rewardCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  rewardCardAvailable: {
    elevation: 8,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  rewardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardEmoji: {
    fontSize: 32,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  rewardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  rewardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 16,
  },
  requirementContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
  },
  requirementText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    minWidth: 35,
  },
  remainingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  availableBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  availableText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  infoSection: {
    margin: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
});