import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useFitnessLoyalty } from '@/hooks/useFitnessLoyalty';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { 
    currentAdmin, 
    currentMember, 
    isAdminMode, 
    logoutAdmin, 
    logoutMember, 
    switchToAdminMode, 
    switchToMemberMode 
  } = useAuth();
  const { getMemberStats } = useFitnessLoyalty();

  const handleLogoutAdmin = () => {
    Alert.alert(
      'Déconnexion Admin',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            await logoutAdmin();
            router.replace('/auth');
          }
        }
      ]
    );
  };

  const handleLogoutMember = () => {
    Alert.alert(
      'Déconnexion Membre',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: logoutMember 
        }
      ]
    );
  };

  const handleSwitchMode = async () => {
    try {
      if (isAdminMode) {
        await switchToMemberMode();
      } else {
        await switchToAdminMode();
      }
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur lors du changement de mode');
    }
  };

  if (!currentAdmin) {
    return (
      <LinearGradient colors={['#1e1b4b', '#581c87', '#be185d']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notLoggedIn}>
            <MaterialCommunityIcons name="account" size={64} color="rgba(255, 255, 255, 0.5)" />
            <Text style={styles.notLoggedInText}>
              Connectez-vous pour voir votre profil
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const stats = currentMember ? getMemberStats() : null;
  
  const getMemberLevelEmoji = (level: string) => {
    switch (level) {
      case 'Bronze': return '🥉';
      case 'Argent': return '🥈';
      case 'Or': return '🥇';
      case 'Platine': return '💎';
      default: return '🏃';
    }
  };

  const getMemberLevelColor = (level: string) => {
    switch (level) {
      case 'Bronze': return ['#cd7f32', '#b8690a'];
      case 'Argent': return ['#c0c0c0', '#a8a8a8'];
      case 'Or': return ['#ffd700', '#ffb347'];
      case 'Platine': return ['#e5e4e2', '#d3d3d3'];
      default: return ['#6b7280', '#4b5563'];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getNextLevelProgress = () => {
    if (!currentMember) return { current: 0, required: 30, percentage: 0 };
    
    const current = currentMember.visits;
    let required = 30;
    
    if (current >= 150) {
      required = 300;
    } else if (current >= 70) {
      required = 150;
    } else if (current >= 30) {
      required = 70;
    }
    
    const percentage = (current / required) * 100;
    return { current, required, percentage: Math.min(percentage, 100) };
  };

  const levelProgress = getNextLevelProgress();

  return (
    <LinearGradient colors={['#1e1b4b', '#581c87', '#be185d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profil</Text>
            <Text style={styles.headerSubtitle}>
              {isAdminMode ? 'Mode Administrateur' : 'Mode Membre'}
            </Text>
          </View>

          {/* Admin Profile Card */}
          {currentAdmin && (
            <View style={styles.profileCard}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)']}
                style={styles.cardGradient}
              >
                <View style={styles.profileHeader}>
                  <View style={styles.avatarContainer}>
                    <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.avatar}>
                      <MaterialCommunityIcons name="shield" size={24} color="white" />
                    </LinearGradient>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.adminName}>{currentAdmin.name}</Text>
                    <View style={styles.adminBadge}>
                      <Building2 size={16} color="#8b5cf6" />
                      <Text style={styles.adminBadgeText}>{currentAdmin.gymName}</Text>
                    </View>
                    <Text style={styles.adminEmail}>{currentAdmin.email}</Text>
                  </View>
                </View>

                <View style={styles.adminInfo}>
                  <MaterialCommunityIcons name="calendar" size={16} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={styles.adminInfoText}>
                    Admin depuis le {formatDate(currentAdmin.createdAt)}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Member Profile Card */}
          {currentMember && (
            <View style={styles.profileCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.cardGradient}
              >
                <View style={styles.profileHeader}>
                  <View style={styles.avatarContainer}>
                    <LinearGradient 
                      colors={getMemberLevelColor(currentMember.level)} 
                      style={styles.avatar}
                    >
                      <Text style={styles.avatarEmoji}>
                        {getMemberLevelEmoji(currentMember.level)}
                      </Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.memberName}>{currentMember.name}</Text>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>Membre {currentMember.level}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.joinInfo}>
                  <MaterialCommunityIcons name="calendar" size={16} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={styles.joinText}>
                    Membre depuis le {formatDate(currentMember.joinDate)}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Member Stats */}
          {currentMember && (
            <>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="trophy" size={24} color="#fbbf24" />
                  <Text style={styles.statNumber}>{currentMember.visits}</Text>
                  <Text style={styles.statLabel}>Passages totaux</Text>
                </View>
                
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="award" size={24} color="#ec4899" />
                  <Text style={styles.statNumber}>{currentMember.totalRewards}</Text>
                  <Text style={styles.statLabel}>Récompenses</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="trending-up" size={24} color="#10b981" />
                  <Text style={styles.statNumber}>{Math.floor(currentMember.visits / 7)}</Text>
                  <Text style={styles.statLabel}>Semaines actives</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Target size={24} color="#8b5cf6" />
                  <Text style={styles.statNumber}>{currentMember.visits % 10}</Text>
                  <Text style={styles.statLabel}>Vers récompense</Text>
                </View>
              </View>

              {/* Level Progress */}
              <View style={styles.progressSection}>
                <Text style={styles.sectionTitle}>Progression niveau suivant</Text>
                <View style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressText}>
                      {levelProgress.current} / {levelProgress.required} passages
                    </Text>
                    <Text style={styles.progressPercentage}>
                      {Math.round(levelProgress.percentage)}%
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${levelProgress.percentage}%` }]} />
                  </View>
                  {levelProgress.current < levelProgress.required && (
                    <Text style={styles.progressSubtext}>
                      Encore {levelProgress.required - levelProgress.current} passage{levelProgress.required - levelProgress.current > 1 ? 's' : ''} pour le niveau suivant
                    </Text>
                  )}
                </View>
              </View>

              {/* Recent Activity */}
              {stats && stats.recentVisits.length > 0 && (
                <View style={styles.activitySection}>
                  <Text style={styles.sectionTitle}>Activité récente</Text>
                  {stats.recentVisits.map((visit, index) => (
                    <View key={visit.id} style={styles.activityItem}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color="#6b7280" />
                      <Text style={styles.activityText}>
                        {new Date(visit.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Actions */}
          <View style={styles.actionsSection}>
            {/* Mode Switch */}
            {currentAdmin && (
              <TouchableOpacity style={styles.actionButton} onPress={handleSwitchMode}>
                <MaterialCommunityIcons name="rotate-3d-variant" size={20} color="white" />
                <Text style={styles.actionButtonText}>
                  {isAdminMode ? 'Passer en mode Membre' : 'Passer en mode Admin'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Admin Actions */}
            {currentAdmin && isAdminMode && (
              <TouchableOpacity 
                style={styles.adminButton} 
                onPress={() => router.push('/admin')}
              >
                <MaterialCommunityIcons name="cog" size={20} color="#8b5cf6" />
                <Text style={styles.adminButtonText}>Configuration</Text>
              </TouchableOpacity>
            )}

            {/* Member Logout */}
            {currentMember && (
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutMember}>
                <LogOut size={20} color="#f59e0b" />
                <Text style={styles.logoutButtonText}>Déconnexion Membre</Text>
              </TouchableOpacity>
            )}

            {/* Admin Logout */}
            {currentAdmin && (
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutAdmin}>
                <LogOut size={20} color="#ef4444" />
                <Text style={styles.logoutButtonText}>Déconnexion Admin</Text>
              </TouchableOpacity>
            )}
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
  scrollView: {
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
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
  profileCard: {
    margin: 24,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  profileInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
    gap: 4,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  adminEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  memberName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  joinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  joinText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adminInfoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 4,
  },
  progressSection: {
    marginHorizontal: 24,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activitySection: {
    marginHorizontal: 24,
    marginVertical: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  activityText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionsSection: {
    margin: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  adminButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});