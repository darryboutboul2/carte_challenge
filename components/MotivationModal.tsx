// components/MotivationModal.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotivationMessage } from '@/types';

interface MotivationModalProps {
  visible: boolean;
  onClose: () => void;
  message: MotivationMessage | null;
}

/**
 * Renvoie un tuple de deux couleurs, ce qui satisfait
 * le type attendu par LinearGradient.colors.
 */
const getGradientColors = (category: string): readonly [string, string] => {
  switch (category) {
    case 'welcome':
      return ['#3b82f6', '#1d4ed8'] as const;
    case 'achievement':
      return ['#fbbf24', '#f59e0b'] as const;
    case 'reward_alert':
      return ['#10b981', '#059669'] as const;
    default:
      return ['#8b5cf6', '#7c3aed'] as const;
  }
};

const MotivationModal: React.FC<MotivationModalProps> = ({
  visible,
  onClose,
  message
}) => {
  if (!message) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={getGradientColors(message.category)}
            style={styles.modal}
          >
            {/* Bouton fermer */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color="white"
              />
            </TouchableOpacity>

            <View style={styles.content}>
              {/* Icône éclair */}
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={32}
                color="white"
              />

              {/* Texte du message */}
              <Text style={styles.message}>
                {message.message}
              </Text>

              {/* Bouton Continuer */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onClose}
              >
                <Text style={styles.actionButtonText}>
                  Continuer
                </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    maxWidth: 320,
    width: '100%'
  },
  modal: {
    padding: 24,
    alignItems: 'center'
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4
  },
  content: {
    alignItems: 'center',
    paddingTop: 8
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: 20
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  }
});

export default MotivationModal;
