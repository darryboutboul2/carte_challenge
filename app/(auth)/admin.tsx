import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import AdminLogin from '@/components/AdminLogin';

export default function AdminAuthScreen() {
  const { loginAdmin, registerAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await loginAdmin(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Erreur lors de la connexion admin:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (adminData: {
    name: string;
    email: string;
    password: string;
    gymName: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    try {
      await registerAdmin(adminData);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Erreur lors de la création du compte admin:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur lors de la création du compte');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1e1b4b', '#581c87', '#be185d']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <AdminLogin
          onLogin={handleLogin}
          onRegister={handleRegister}
          isLoading={isLoading}
        />
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
});