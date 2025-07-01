import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAdminData } from '@/hooks/useAdminData';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function AdminScreen() {
  const { currentAdmin, hasAdminAccess } = useAuth();
  const {
    clubInfo,
    rewards,
    users,
    updateClubInfo,
    addReward,
    removeReward,
    addUser,
    removeUser,
    isLoading
  } = useAdminData();

  const [activeTab, setActiveTab] = useState<'club' | 'rewards' | 'users'>('club');
  const [editingClub, setEditingClub] = useState(false);
  const [clubForm, setClubForm] = useState(clubInfo);
  const [newReward, setNewReward] = useState({
    name: '',
    description: '',
    requiredVisits: '',
    rarity: 'common' as const,
    emoji: ''
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Redirect if no admin access
  if (!hasAdminAccess()) {
    router.replace('/(tabs)');
    return null;
  }

  const handleSaveClubInfo = () => {
    updateClubInfo(clubForm);
    setEditingClub(false);
    Alert.alert('Succès', 'Informations du club mises à jour');
  };

  const handleAddReward = () => {
    if (!newReward.name || !newReward.requiredVisits) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    addReward({
      ...newReward,
      requiredVisits: parseInt(newReward.requiredVisits),
      id: Date.now().toString()
    });

    setNewReward({
      name: '',
      description: '',
      requiredVisits: '',
      rarity: 'common',
      emoji: ''
    });

    Alert.alert('Succès', 'Récompense ajoutée');
  };

  const handleAddUser = () => {
    if (!newUser.name || (!newUser.email && !newUser.phone)) {
      Alert.alert('Erreur', 'Veuillez remplir le nom et au moins un contact');
      return;
    }

    addUser({
      ...newUser,
      id: Date.now().toString(),
      visits: 0,
      totalRewards: 0,
      level: 'Bronze',
      joinDate: new Date().toISOString(),
      lastVisit: null
    });

    setNewUser({ name: '', email: '', phone: '' });
    Alert.alert('Succès', 'Utilisateur ajouté');
  };

  const TabButton = ({ tab, title, icon }: { tab: string; title: string; icon: React.ReactNode }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab as any)}
    >
      {icon}
      <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderClubTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Informations du club</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditingClub(!editingClub)}
        >
          <MaterialCommunityIcons name="credit-card" size={20} color="white" />
          <Text style={styles.editButtonText}>
            {editingClub ? 'Annuler' : 'Modifier'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nom du club</Text>
          <TextInput
            style={[styles.input, !editingClub && styles.inputDisabled]}
            value={clubForm.name}
            onChangeText={(text) => setClubForm({ ...clubForm, name: text })}
            editable={editingClub}
            placeholder="Nom du club"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Téléphone</Text>
          <TextInput
            style={[styles.input, !editingClub && styles.inputDisabled]}
            value={clubForm.phone}
            onChangeText={(text) => setClubForm({ ...clubForm, phone: text })}
            editable={editingClub}
            placeholder="+33 1 23 45 67 89"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={[styles.input, !editingClub && styles.inputDisabled]}
            value={clubForm.email}
            onChangeText={(text) => setClubForm({ ...clubForm, email: text })}
            editable={editingClub}
            placeholder="contact@club.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Adresse</Text>
          <TextInput
            style={[styles.input, !editingClub && styles.inputDisabled]}
            value={clubForm.address}
            onChangeText={(text) => setClubForm({ ...clubForm, address: text })}
            editable={editingClub}
            placeholder="123 Rue du Fitness, 75001 Paris"
            placeholderTextColor="#9ca3af"
            multiline
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Site web</Text>
          <TextInput
            style={[styles.input, !editingClub && styles.inputDisabled]}
            value={clubForm.website}
            onChangeText={(text) => setClubForm({ ...clubForm, website: text })}
            editable={editingClub}
            placeholder="https://www.club.com"
            placeholderTextColor="#9ca3af"
            keyboardType="url"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Instagram</Text>
          <TextInput
            style={[styles.input, !editingClub && styles.inputDisabled]}
            value={clubForm.instagram}
            onChangeText={(text) => setClubForm({ ...clubForm, instagram: text })}
            editable={editingClub}
            placeholder="https://instagram.com/club"
            placeholderTextColor="#9ca3af"
            keyboardType="url"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Facebook</Text>
          <TextInput
            style={[styles.input, !editingClub && styles.inputDisabled]}
            value={clubForm.facebook}
            onChangeText={(text) => setClubForm({ ...clubForm, facebook: text })}
            editable={editingClub}
            placeholder="https://facebook.com/club"
            placeholderTextColor="#9ca3af"
            keyboardType="url"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Horaires</Text>
          <TextInput
            style={[styles.input, !editingClub && styles.inputDisabled]}
            value={clubForm.hours}
            onChangeText={(text) => setClubForm({ ...clubForm, hours: text })}
            editable={editingClub}
            placeholder="Lun-Ven: 6h-23h, Sam: 8h-20h, Dim: 9h-18h"
            placeholderTextColor="#9ca3af"
            multiline
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Message d'accueil</Text>
          <TextInput
            style={[styles.input, styles.textArea, !editingClub && styles.inputDisabled]}
            value={clubForm.welcomeMessage}
            onChangeText={(text) => setClubForm({ ...clubForm, welcomeMessage: text })}
            editable={editingClub}
            placeholder="Message affiché sur la page Contact"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
          />
        </View>

        {editingClub && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveClubInfo}>
            <LinearGradient colors={['#10b981', '#059669']} style={styles.saveButtonGradient}>
              <MaterialCommunityIcons name="content-save" size={20} color="white" />
              <Text style={styles.saveButtonText}>Sauvegarder</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderRewardsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Gestion des récompenses</Text>

      {/* Formulaire d'ajout */}
      <View style={styles.addForm}>
        <Text style={styles.addFormTitle}>Ajouter une récompense</Text>
        
        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 2 }]}>
            <Text style={styles.inputLabel}>Nom *</Text>
            <TextInput
              style={styles.input}
              value={newReward.name}
              onChangeText={(text) => setNewReward({ ...newReward, name: text })}
              placeholder="Nom de la récompense"
              placeholderTextColor="#9ca3af"
            />
          </View>
          
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Emoji</Text>
            <TextInput
              style={styles.input}
              value={newReward.emoji}
              onChangeText={(text) => setNewReward({ ...newReward, emoji: text })}
              placeholder="🎁"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={styles.input}
            value={newReward.description}
            onChangeText={(text) => setNewReward({ ...newReward, description: text })}
            placeholder="Description de la récompense"
            placeholderTextColor="#9ca3af"
            multiline
          />
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Passages requis *</Text>
            <TextInput
              style={styles.input}
              value={newReward.requiredVisits}
              onChangeText={(text) => setNewReward({ ...newReward, requiredVisits: text })}
              placeholder="10"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Rareté</Text>
            <View style={styles.raritySelector}>
              {['common', 'rare', 'epic', 'legendary'].map((rarity) => (
                <TouchableOpacity
                  key={rarity}
                  style={[
                    styles.rarityButton,
                    newReward.rarity === rarity && styles.rarityButtonActive
                  ]}
                  onPress={() => setNewReward({ ...newReward, rarity: rarity as any })}
                >
                  <Text style={[
                    styles.rarityButtonText,
                    newReward.rarity === rarity && styles.rarityButtonTextActive
                  ]}>
                    {rarity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddReward}>
          <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.addButtonGradient}>
            <MaterialCommunityIcons name="plus" size={20} color="white" />
            <Text style={styles.addButtonText}>Ajouter la récompense</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Liste des récompenses */}
      <View style={styles.rewardsList}>
        <Text style={styles.listTitle}>Récompenses existantes ({rewards.length})</Text>
        {rewards.map((reward) => (
          <View key={reward.id} style={styles.rewardItem}>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
              <View style={styles.rewardDetails}>
                <Text style={styles.rewardName}>{reward.name}</Text>
                <Text style={styles.rewardDescription}>{reward.description}</Text>
                <Text style={styles.rewardRequirement}>
                  {reward.requiredVisits} passages • {reward.rarity}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                Alert.alert(
                  'Supprimer la récompense',
                  `Êtes-vous sûr de vouloir supprimer "${reward.name}" ?`,
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { 
                      text: 'Supprimer', 
                      style: 'destructive',
                      onPress: () => removeReward(reward.id)
                    }
                  ]
                );
              }}
            >
              <MaterialCommunityIcons name="trash-can" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderUsersTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Gestion des utilisateurs</Text>

      {/* Formulaire d'ajout */}
      <View style={styles.addForm}>
        <Text style={styles.addFormTitle}>Ajouter un utilisateur</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nom complet *</Text>
          <TextInput
            style={styles.input}
            value={newUser.name}
            onChangeText={(text) => setNewUser({ ...newUser, name: text })}
            placeholder="Nom et prénom"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={newUser.email}
              onChangeText={(text) => setNewUser({ ...newUser, email: text })}
              placeholder="email@exemple.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={newUser.phone}
              onChangeText={(text) => setNewUser({ ...newUser, phone: text })}
              placeholder="06 12 34 56 78"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
          <LinearGradient colors={['#10b981', '#059669']} style={styles.addButtonGradient}>
            <MaterialCommunityIcons name="plus" size={20} color="white" />
            <Text style={styles.addButtonText}>Ajouter l'utilisateur</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Liste des utilisateurs */}
      <View style={styles.usersList}>
        <Text style={styles.listTitle}>Utilisateurs ({users.length})</Text>
        {users.map((user) => (
          <View key={user.id} style={styles.userItem}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userDetails}>
                {user.visits} passages • {user.totalRewards} récompenses • {user.level}
              </Text>
              {user.email && (
                <Text style={styles.userContact}>📧 {user.email}</Text>
              )}
              {user.phone && (
                <Text style={styles.userContact}>📱 {user.phone}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                Alert.alert(
                  'Supprimer l\'utilisateur',
                  `Êtes-vous sûr de vouloir supprimer "${user.name}" ?`,
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { 
                      text: 'Supprimer', 
                      style: 'destructive',
                      onPress: () => removeUser(user.id)
                    }
                  ]
                );
              }}
            >
              <MaterialCommunityIcons name="trash-can" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#1e1b4b', '#581c87', '#be185d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Administration</Text>
            <Text style={styles.headerSubtitle}>{currentAdmin?.gymName}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TabButton
            tab="club"
            title="Club"
            icon={<MaterialCommunityIcons name="cog" size={20} color={activeTab === 'club' ? '#ec4899' : '#9ca3af'} />}
          />
          <TabButton
            tab="rewards"
            title="Récompenses"
            icon={<MaterialCommunityIcons name="gift" size={20} color={activeTab === 'rewards' ? '#ec4899' : '#9ca3af'} />}
          />
          <TabButton
            tab="users"
            title="Utilisateurs"
            icon={<FontAwesome5 name="users" size={20} color={activeTab === 'users' ? '#ec4899' : '#9ca3af'} />}
          />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {activeTab === 'club' && renderClubTab()}
          {activeTab === 'rewards' && renderRewardsTab()}
          {activeTab === 'users' && renderUsersTab()}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  headerContent: {
    flex: 1,
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 4,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    borderWidth: 1,
    borderColor: '#ec4899',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  tabButtonTextActive: {
    color: '#ec4899',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 24,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  addForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  addFormTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  raritySelector: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  rarityButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    alignItems: 'center',
  },
  rarityButtonActive: {
    backgroundColor: '#ec4899',
  },
  rarityButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  rarityButtonTextActive: {
    color: 'white',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  rewardsList: {
    gap: 12,
  },
  usersList: {
    gap: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rewardInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardEmoji: {
    fontSize: 24,
  },
  rewardDetails: {
    flex: 1,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  rewardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  rewardRequirement: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userContact: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
});