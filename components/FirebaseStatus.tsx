import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function FirebaseStatus() {
  const { error, isLoading } = useFirebaseData();

  // Ne pas afficher sur mobile pour éviter l'encombrement
  if (Platform.OS !== 'web') {
    return null;
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.statusIndicator}>
          <Wifi size={16} color="#fbbf24" />
          <Text style={styles.statusText}>Connexion...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={[styles.statusIndicator, styles.errorIndicator]}>
          <WifiOff size={16} color="#ef4444" />
          <Text style={[styles.statusText, styles.errorText]}>Mode hors ligne</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.statusIndicator, styles.successIndicator]}>
        <Wifi size={16} color="#10b981" />
        <Text style={[styles.statusText, styles.successText]}>Connecté</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  errorIndicator: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  successIndicator: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
  },
  errorText: {
    color: '#ef4444',
  },
  successText: {
    color: '#10b981',
  },
});