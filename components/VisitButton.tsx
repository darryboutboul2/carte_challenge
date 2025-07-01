import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import QRScanner from './QRScanner';

interface VisitButtonProps {
  onValidateVisit: () => void;
  isProcessing?: boolean;
}

const VisitButton: React.FC<VisitButtonProps> = ({ onValidateVisit, isProcessing = false }) => {
  const [showScanner, setShowScanner] = useState(false);

  const handlePress = async () => {
    if (isProcessing) return;

    // Feedback haptique (seulement sur mobile)
    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        // Ignore haptic errors
      }
    }

    setShowScanner(true);
  };

  const handleScanSuccess = (data: string) => {
    console.log('QR Code scanné:', data);
    
    // Feedback haptique de succès
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        // Ignore haptic errors
      }
    }
    
    onValidateVisit();
  };

  const getButtonContent = () => {
    if (isProcessing) {
      return (
        <>
          <MaterialCommunityIcons name="check-circle" size={24} color="white" />
          <Text style={styles.buttonText}>Passage validé !</Text>
        </>
      );
    }

    return (
      <>
        <MaterialCommunityIcons name="qrcode" size={24} color="white" />
        <Text style={styles.buttonText}>Scanner QR Code</Text>
      </>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity 
          style={[styles.button, isProcessing && styles.buttonDisabled]} 
          onPress={handlePress}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={isProcessing ? ['#10b981', '#34d399'] : ['#be185d', '#ec4899']}
            style={styles.buttonGradient}
          >
            {getButtonContent()}
          </LinearGradient>
        </TouchableOpacity>
        
        {!isProcessing && (
          <Text style={styles.instructionText}>
            Scannez le QR code présent dans la salle
          </Text>
        )}
      </View>

      <QRScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 24,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  buttonDisabled: {
    elevation: 2,
    shadowOpacity: 0.15,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
    minWidth: 200,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  instructionText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 24,
  },
});

export default VisitButton;