import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFitnessLoyalty } from '@/hooks/useFitnessLoyalty';

export default function AuthScreen() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginMember } = useFitnessLoyalty();

  const handleLogin = async () => {
    if (name.trim().length < 2) {
      Alert.alert('Erreur', 'Veuillez entrer un nom valide (minimum 2 caractères)');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Tentative de connexion avec le nom:', name.trim());
      await loginMember(name.trim());
      console.log('Connexion réussie, redirection vers les tabs');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      Alert.alert('Erreur', 'Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminAccess = () => {
    router.push('/(auth)/admin');
  };

  return (
    <LinearGradient
      colors={['#1e1b4b', '#581c87', '#be185d']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="account" size={64} color="white" />
          <Text style={styles.title}>Carte Challenge</Text>
          <Text style={styles.subtitle}>Salle de Sport Premium</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Votre nom</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Entrez votre nom"
            placeholderTextColor="#9ca3af"
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            editable={!isLoading}
          />
          
          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <LinearGradient
              colors={isLoading ? ['#6b7280', '#4b5563'] : ['#be185d', '#ec4899']}
              style={styles.buttonGradient}
            >
              <MaterialCommunityIcons name="login" size={20} color="white" />
              <Text style={styles.buttonText}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.adminButton} 
            onPress={handleAdminAccess}
            disabled={isLoading}
          >
            <MaterialCommunityIcons name="shield" size={16} color="#8b5cf6" />
            <Text style={styles.adminButtonText}>Accès Administrateur</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Système de fidélité • 10 passages = 1 récompense
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#e5e7eb',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 300,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 24,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  adminButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  footer: {
    marginTop: 48,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 20,
  },
});