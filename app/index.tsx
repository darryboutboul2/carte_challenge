import React, { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import MemberLogin from '@/components/MemberLogin';
import { loginMember, fitnessLogin } from '@/hooks/useFitnessLoyalty';

export default function TabsIndex() {
  const { currentAdmin } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleMemberLogin = async (name: string) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      if (currentAdmin) {
        await loginMember(name, currentAdmin.id);
      } else {
        await fitnessLogin(name);
      }
    } catch (error) {
      console.error('Erreur de connexion :', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <MemberLogin onLogin={handleMemberLogin} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});
