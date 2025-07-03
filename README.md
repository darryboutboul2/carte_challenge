# Carte Challenge - Application de Fidélité Fitness

Une application mobile de fidélité pour salle de sport avec intégration Firebase.

## 🚀 Fonctionnalités

- **Système de fidélité** : Gagnez des récompenses tous les 10 passages
- **Scan QR Code** : Validation des passages par QR code
- **Géolocalisation** : Vérification de présence dans la salle
- **Niveaux de membres** : Bronze, Argent, Or, Platine
- **Interface admin** : Gestion des récompenses et utilisateurs
- **Synchronisation Firebase** : Données en temps réel

## 🔧 Configuration Firebase

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet
3. Activez Firestore Database
4. Configurez les règles de sécurité

### 2. Configuration de l'application

1. Copiez votre configuration Firebase
2. Remplacez les valeurs dans `config/firebase.ts` :

```typescript
const firebaseConfig = {
  apiKey: "votre-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "votre-app-id"
};
```

### 3. Règles Firestore

Configurez les règles de sécurité dans Firebase Console :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Club info - lecture publique, écriture admin
    match /clubInfo/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Rewards - lecture publique, écriture admin
    match /rewards/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Members - lecture/écriture pour tous (à sécuriser selon vos besoins)
    match /members/{document} {
      allow read, write: if true;
    }
    
    // Visits - lecture/écriture pour tous (à sécuriser selon vos besoins)
    match /visits/{document} {
      allow read, write: if true;
    }
    
    // Admins - lecture/écriture pour utilisateurs authentifiés
    match /admins/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📱 Structure des données

### Collections Firestore

#### `clubInfo`
```typescript
{
  name: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  instagram: string;
  facebook: string;
  welcomeMessage: string;
  hours: string;
  updatedAt: Timestamp;
}
```

#### `members`
```typescript
{
  name: string;
  email?: string;
  phone?: string;
  visits: number;
  totalRewards: number;
  level: string;
  joinDate: Timestamp;
  lastVisit?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `rewards`
```typescript
{
  name: string;
  description: string;
  requiredVisits: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  emoji: string;
  createdAt: Timestamp;
}
```

#### `visits`
```typescript
{
  memberId: string;
  memberName: string;
  date: Timestamp;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Timestamp;
}
```

#### `admins`
```typescript
{
  email: string;
  password: string; // Hashé
  createdAt: Timestamp;
  lastLogin?: Timestamp;
}
```

## 🔐 Authentification Admin

- **Mot de passe par défaut** : `admin123`
- **Accès** : Via le profil utilisateur → Administration

## 🌐 Mode hors ligne

L'application fonctionne en mode hors ligne avec :
- Stockage local de secours
- Synchronisation automatique lors de la reconnexion
- Indicateur de statut de connexion

## 🚀 Démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev
```

## 📦 Technologies utilisées

- **Expo Router** : Navigation
- **Firebase** : Base de données temps réel
- **Expo Location** : Géolocalisation
- **Expo Camera** : Scan QR Code
- **Lucide React Native** : Icônes
- **TypeScript** : Typage statique

## 🔧 Personnalisation

### Coordonnées de la salle
Modifiez les coordonnées dans `hooks/useGeolocation.ts` :

```typescript
const GYM_LOCATION: LocationCoords = {
  latitude: 48.877053,  // Votre latitude
  longitude: 2.817765   // Votre longitude
};
```

### Distance de validation
Ajustez la distance maximale pour valider un passage :

```typescript
const MAX_DISTANCE_METERS = 60; // Distance en mètres
```

## 📝 Notes importantes

- Configurez Firebase avant le premier lancement
- Testez la géolocalisation avec des coordonnées réelles
- Sécurisez les règles Firestore pour la production
- Changez le mot de passe admin par défaut

## 🐛 Dépannage

### Problèmes de connexion Firebase
- Vérifiez la configuration dans `config/firebase.ts`
- Contrôlez les règles Firestore
- Vérifiez la connexion internet

### Géolocalisation
- Autorisez l'accès à la localisation
- Testez avec des coordonnées réelles
- Vérifiez la précision GPS

### QR Code
- Autorisez l'accès à la caméra
- Utilisez un QR code valide contenant "carte-challenge"