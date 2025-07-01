import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdminData } from '@/hooks/useAdminData';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function ContactScreen() {
  const { clubInfo } = useAdminData();

  const handlePhoneCall = () => {
    Linking.openURL(`tel:${clubInfo.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${clubInfo.email}`);
  };

  const handleWebsite = () => {
    Linking.openURL(clubInfo.website);
  };

  const handleInstagram = () => {
    Linking.openURL(clubInfo.instagram);
  };

  const handleFacebook = () => {
    Linking.openURL(clubInfo.facebook);
  };

  const handleEmergency = () => {
    Alert.alert(
      'Urgence',
      'En cas d\'urgence médicale, appelez immédiatement le 15 (SAMU) ou le 112.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Appeler 15', onPress: () => Linking.openURL('tel:15') },
        { text: 'Appeler 112', onPress: () => Linking.openURL('tel:112') }
      ]
    );
  };

  const ContactItem = ({ icon, title, subtitle, onPress, style }: any) => (
    <TouchableOpacity style={[styles.contactItem, style]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.contactIcon}>
        {icon}
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#1e1b4b', '#581c87', '#be185d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Contact</Text>
            <Text style={styles.headerSubtitle}>
              Nous sommes là pour vous aider
            </Text>
          </View>

          {/* Quick Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact rapide</Text>
            <View style={styles.quickContactGrid}>
              <TouchableOpacity style={styles.quickContactButton} onPress={handlePhoneCall}>
                <LinearGradient colors={['#10b981', '#059669']} style={styles.quickButtonGradient}>
                  <MaterialCommunityIcons name="phone" size={24} color="white" />
                  <Text style={styles.quickButtonText}>Appeler</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickContactButton} onPress={handleEmail}>
                <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.quickButtonGradient}>
                  <MaterialCommunityIcons name="message-text" size={24} color="white" />
                  <Text style={styles.quickButtonText}>Message</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations</Text>
            
            <ContactItem
              icon={<MaterialCommunityIcons name="phone" size={20} color="#10b981" />}
              title="Téléphone"
              subtitle={clubInfo.phone}
              onPress={handlePhoneCall}
            />
            
            <ContactItem
              icon={<MaterialCommunityIcons name="email" size={20} color="#3b82f6" />}
              title="Email"
              subtitle={clubInfo.email}
              onPress={handleEmail}
            />
            
            <ContactItem
              icon={<MaterialCommunityIcons name="map-marker" size={20} color="#ec4899" />}
              title="Adresse"
              subtitle={clubInfo.address}
            />
            
            <ContactItem
              icon={<MaterialCommunityIcons name="earth" size={20} color="#8b5cf6" />}
              title="Site web"
              subtitle={clubInfo.website}
              onPress={handleWebsite}
            />
          </View>

          {/* Horaires */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Horaires d'ouverture</Text>
            <View style={styles.scheduleCard}>
              {clubInfo.hours.split('\n').map((line, index) => (
                <View key={index} style={styles.scheduleRow}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={styles.scheduleText}>{line}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Réseaux sociaux */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Réseaux sociaux</Text>
            <View style={styles.socialGrid}>
              <TouchableOpacity style={styles.socialButton} onPress={handleInstagram}>
                <MaterialCommunityIcons name="instagram" size={24} color="#e1306c" />
                <Text style={styles.socialText}>Instagram</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton} onPress={handleFacebook}>
                <MaterialCommunityIcons name="facebook" size={24} color="#1877f2" />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Urgence */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergency}>
              <MaterialCommunityIcons name="alert" size={24} color="#ef4444" />
              <View style={styles.emergencyContent}>
                <Text style={styles.emergencyTitle}>Urgence médicale</Text>
                <Text style={styles.emergencySubtitle}>
                  En cas d'urgence, appelez le 15 ou le 112
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Info supplémentaire */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Service client</Text>
            <Text style={styles.infoText}>
              {clubInfo.welcomeMessage}
            </Text>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  quickContactGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  quickContactButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  quickButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  scheduleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  scheduleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ef4444',
    gap: 12,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 2,
  },
  emergencySubtitle: {
    fontSize: 12,
    color: 'rgba(239, 68, 68, 0.8)',
  },
  infoSection: {
    margin: 24,
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
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
});