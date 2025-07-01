// components/ErrorBoundary.tsx

import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // MàJ de l'état pour afficher l'UI de secours
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: unknown): void {
    // On peut envoyer l'erreur à un service de logs
    console.error('ErrorBoundary caught an error:', error, info);
  }

  handleReload = () => {
    // Remet l'état à false pour réafficher l'arbre des composants
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oups, une erreur est survenue.</Text>
          <Text style={styles.message}>
            Veuillez appuyer sur le bouton ci-dessous pour réessayer.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleReload}
            activeOpacity={0.8}
          >
            <Feather name="refresh-cw" size={24} color="white" />
            <Text style={styles.buttonText}>Recharger</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return <>{this.props.children}</>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#1e1b4b',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#581c87',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
