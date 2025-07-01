import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
import { View, StyleSheet } from 'react-native';

export default function IndexRedirect() {
  const { currentAdmin, currentMember, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size={32} />
      </View>
    );
  }
  
  return (
    <Redirect href={currentAdmin || currentMember ? '/(tabs)' : '/(auth)'} />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
  },
});