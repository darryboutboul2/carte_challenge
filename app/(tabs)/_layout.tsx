import { Tabs } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

export default function TabLayout() {
  const { isAdminMode, hasAdminAccess } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1f2937',
          borderTopColor:   '#374151',
          borderTopWidth:   1,
          paddingBottom:    8,
          paddingTop:       8,
          height:          70,
        },
        tabBarActiveTintColor:   '#ec4899',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize:   12,
          fontWeight: '600',
          marginTop:   4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isAdminMode ? 'Dashboard' : 'Challenge',
          tabBarIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Récompenses',
          tabBarIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="gift" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ size, color }) => (
            <FontAwesome5 name="user-alt" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: 'Contact',
          tabBarIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="phone" size={size} color={color} />
          ),
        }}
      />
      {hasAdminAccess() && (
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            tabBarIcon: ({ size, color }) => (
              <MaterialCommunityIcons name="cog" size={size} color={color} />
            ),
          }}
        />
      )}
    </Tabs>
  );
}
