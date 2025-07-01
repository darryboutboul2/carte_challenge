import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface RewardModalProps {
  visible: boolean;
  onClose: () => void;
  visits: number;
  rewardCount: number;
}

const RewardModal: React.FC<RewardModalProps> = ({ visible, onClose, visits, rewardCount }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#fbbf24', '#f59e0b', '#d97706']}
            style={styles.modal}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="gift" size={48} color="white" />
                <FontAwesome5
                  name="sparkles"
                  size={24}
                  color="white"
                  style={styles.sparkle}
                />
              </View>

              <Text style={styles.title}>🎉 Félicitations !</Text>
              <Text style={styles.subtitle}>Nouvelle récompense débloquée</Text>

              <View style={styles.stats}>
                <Text style={styles.statsText}>
                  {visits} passages • {rewardCount} récompense{rewardCount > 1 ? 's' : ''}
                </Text>
              </View>

              <Text style={styles.description}>
                Vous avez atteint 10 passages et débloqué une nouvelle récompense ! Consultez l'onglet Récompenses pour la découvrir.
              </Text>

              <TouchableOpacity style={styles.actionButton} onPress={onClose}>
                <Text style={styles.actionButtonText}>Voir mes récompenses</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    maxWidth: 340,
    width: '100%',
  },
  modal: {
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
  content: {
    alignItems: 'center',
    paddingTop: 16,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  sparkle: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  stats: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default RewardModal;
