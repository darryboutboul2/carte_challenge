// config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// importe tout depuis 'firebase/auth'
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "…",
  authDomain: "…",
  projectId: "…",
  storageBucket: "…",
  messagingSenderId: "…",
  appId: "…",
};

// 1. Initialise Firebase
const app = initializeApp(firebaseConfig);

// 2. Firestore
export const db = getFirestore(app);

// 3. Auth selon plateforme
export let auth;
if (Platform.OS === 'web') {
  // Web : persistance mémoire
  auth = getAuth(app);
  console.log('Auth web initialisé');
} else {
  // Mobile : persistance AsyncStorage
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log('Auth React Native initialisé avec AsyncStorage');
}
