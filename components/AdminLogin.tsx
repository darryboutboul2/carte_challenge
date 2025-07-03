import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface AdminLoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (data: {
    name: string;
    email: string;
    password: string;
    gymName: string;
    phone?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onRegister, isLoading = false }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gymName: '',
    phone: ''
  });

  const handleSubmit = async () => {
    if (isRegisterMode) {
      if (!formData.name || !formData.email || !formData.password || !formData.gymName) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      if (formData.password.length < 6) {
        Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
        return;
      }

      try {
        await onRegister({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          gymName: formData.gymName.trim(),
          phone: formData.phone.trim() || undefined
        });
      } catch (error) {
        Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur lors de la création du compte');
      }
    } else {
      if (!formData.email || !formData.password) {
        Alert.alert('Erreur', 'Veuillez entrer votre email et mot de passe');
        return;
      }

      try {
        await onLogin(formData.email.trim().toLowerCase(), formData.password);
      } catch (error) {
        Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur de connexion');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      gymName: '',
      phone: ''
    });
    setShowPassword(false);
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    resetForm();
  };

  return (
    <LinearGradient
      colors={['#1e1b4b', '#581c87', '#be185d']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="shield" size={64} color="white" />
            <Text style={styles.title}>
              {isRegisterMode ? 'Créer un compte Admin' : 'Connexion Admin'}
            </Text>
            <Text style={styles.subtitle}>
              {isRegisterMode 
                ? 'Créez votre salle de sport' 
                : 'Gérez votre salle de sport'
              }
            </Text>
          </View>

          <View style={styles.form}>
            {isRegisterMode && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nom complet *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    placeholder="Votre nom et prénom"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nom de la salle *</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="office-building" size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.inputWithIcon]}
                      value={formData.gymName}
                      onChangeText={(text) => setFormData({ ...formData, gymName: text })}
                      placeholder="Nom de votre salle de sport"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Téléphone</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    placeholder="+33 1 23 45 67 89"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="admin@exemple.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  placeholder={isRegisterMode ? "Minimum 6 caractères" : "Votre mot de passe"}
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <MaterialCommunityIcons name="eye-off" size={20} color="#9ca3af" />
                  ) : (
                    <MaterialCommunityIcons name="eye" size={20} color="#9ca3af" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isLoading ? ['#6b7280', '#4b5563'] : ['#be185d', '#ec4899']}
                style={styles.buttonGradient}
              >
                {isRegisterMode ? (
                  <MaterialCommunityIcons name="account-plus" size={20} color="white" />
                ) : (
                  <MaterialCommunityIcons name="login" size={20} color="white" />
                )}
                <Text style={styles.buttonText}>
                  {isLoading 
                    ? (isRegisterMode ? 'Création...' : 'Connexion...') 
                    : (isRegisterMode ? 'Créer le compte' : 'Se connecter')
                  }
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.toggleButton} 
              onPress={toggleMode}
              disabled={isLoading}
            >
              <Text style={styles.toggleButtonText}>
                {isRegisterMode 
                  ? 'Déjà un compte ? Se connecter' 
                  : 'Pas de compte ? Créer une salle'
                }
              </Text>
            </TouchableOpacity>
          </View>

          {isRegisterMode && (
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>🎯 Fonctionnalités incluses</Text>
              <Text style={styles.infoText}>
                • Système de fidélité automatique{'\n'}
                • Scan QR Code avec géolocalisation{'\n'}
                • Gestion des membres et récompenses{'\n'}
                • Interface d'administration complète{'\n'}
                • Synchronisation temps réel{'\n'}
                • 30 jours d'essai gratuit
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#e5e7eb',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputContainer: {
    position: 'relative',
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 18,
    padding: 4,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitButtonDisabled: {
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
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#e5e7eb',
    textDecorationLine: 'underline',
  },
  infoSection: {
    marginTop: 32,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoTitle: {
    fontSize: 16,
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

export default AdminLogin;