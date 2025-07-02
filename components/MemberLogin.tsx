import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface MemberLoginProps {
  onLogin: (name: string) => Promise<void>;
  onBackToAdmin?: () => void;
  gymName?: string;
  isLoading?: boolean;
}

const MemberLogin: React.FC<MemberLoginProps> = ({
  onLogin,
  onBackToAdmin,
  gymName,
  isLoading = false
}) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    console.log('🔄 handleLogin appelé avec:', name, 'isLoading:', isLoading, 'isSubmitting:', isSubmitting);

    if (isLoading || isSubmitting) {
      console.log('⚠️ Connexion déjà en cours, ignorer');
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('Erreur', 'Veuillez entrer un nom valide (minimum 2 caractères)');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 Début de la connexion pour:', name.trim());
      await onLogin(name.trim());
      console.log('✅ Connexion terminée avec succès');
    } catch (error) {
      console.error('❌ Erreur dans handleLogin:', error);
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Erreur de connexion'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = isLoading || isSubmitting || name.trim().length < 2;

  return (
    <LinearGradient
      colors={['#1e1b4b', '#581c87', '#be185d']}
      style={styles.container}
    >
      <View style={styles.content}>
        {onBackToAdmin && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBackToAdmin}
            disabled={isLoading || isSubmitting}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
            <Text style={styles.backButtonText}>Retour Admin</Text>
          </TouchableOpacity>
        )}

        <View style={styles.header}>
          <MaterialCommunityIcons name="account" size={64} color="white" />
          <Text style={styles.title}>Carte Challenge</Text>
          {gymName && <Text style={styles.gymName}>{gymName}</Text>}
          <Text style={styles.subtitle}>Système de Fidélité</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Votre nom</Text>
          <TextInput
            style={[styles.input, isButtonDisabled && styles.inputDisabled]}
            value={name}
            onChangeText={setName}
            placeholder="Entrez votre nom"
            placeholderTextColor="#9ca3af"
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            editable={!isLoading && !isSubmitting}
            autoCorrect={false}
            autoComplete="name"
          />

          <TouchableOpacity
            style={[
              styles.loginButton, 
              isButtonDisabled && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={isButtonDisabled}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isButtonDisabled 
                  ? ['#6b7280', '#4b5563'] 
                  : ['#be185d', '#ec4899']
              }
              style={styles.buttonGradient}
            >
              {(isLoading || isSubmitting) ? (
                <MaterialCommunityIcons name="loading" size={20} color="white" />
              ) : (
                <MaterialCommunityIcons name="login" size={20} color="white" />
              )}
              <Text style={styles.buttonText}>
                {(isLoading || isSubmitting) ? 'Connexion...' : 'Se connecter'}
              </Text>
            </LinearGradient>
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
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
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
  gymName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fbbf24',
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
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
  inputDisabled: {
    opacity: 0.6,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
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

export default MemberLogin;