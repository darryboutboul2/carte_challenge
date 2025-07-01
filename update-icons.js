// update-icons.js
// Script pour remplacer automatiquement tous les imports et usages de 'lucide-react-native'
// par '@expo/vector-icons' dans un projet React Native / Expo.
// Usage: node update-icons.js depuis la racine du projet

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Table de correspondance entre composants Lucide et Expo Vector Icons
const mapping = {
  Trophy:      { lib: 'MaterialCommunityIcons', name: 'trophy' },
  Calendar:    { lib: 'MaterialCommunityIcons', name: 'calendar' },
  TrendingUp:  { lib: 'MaterialCommunityIcons', name: 'trending-up' },
  Award:       { lib: 'MaterialCommunityIcons', name: 'award' },
  Users:       { lib: 'FontAwesome5', name: 'users' },
  BarChart3:   { lib: 'MaterialCommunityIcons', name: 'chart-bar' },
  Settings:    { lib: 'MaterialCommunityIcons', name: 'cog' },
  Gift:        { lib: 'MaterialCommunityIcons', name: 'gift' },
  Phone:       { lib: 'MaterialCommunityIcons', name: 'phone' },
  Mail:        { lib: 'MaterialCommunityIcons', name: 'email' },
  MapPin:      { lib: 'MaterialCommunityIcons', name: 'map-marker' },
  Clock:       { lib: 'MaterialCommunityIcons', name: 'clock-outline' },
  Globe:       { lib: 'MaterialCommunityIcons', name: 'earth' },
  Instagram:   { lib: 'MaterialCommunityIcons', name: 'instagram' },
  Facebook:    { lib: 'MaterialCommunityIcons', name: 'facebook' },
  MessageCircle: { lib: 'MaterialCommunityIcons', name: 'message-text' },
  AlertTriangle: { lib: 'MaterialCommunityIcons', name: 'alert' },
  Plus:        { lib: 'MaterialCommunityIcons', name: 'plus' },
  Trash2:      { lib: 'MaterialCommunityIcons', name: 'trash-can' },
  Save:        { lib: 'MaterialCommunityIcons', name: 'content-save' },
  Edit3:       { lib: 'MaterialCommunityIcons', name: 'credit-card' },
  ArrowLeft:   { lib: 'MaterialCommunityIcons', name: 'arrow-left' },
  User:        { lib: 'MaterialCommunityIcons', name: 'account' },
  LogIn:       { lib: 'MaterialCommunityIcons', name: 'login' },
  Shield:      { lib: 'MaterialCommunityIcons', name: 'shield' },
  UserPlus:    { lib: 'MaterialCommunityIcons', name: 'account-plus' },
  Eye:         { lib: 'MaterialCommunityIcons', name: 'eye' },
  EyeOff:      { lib: 'MaterialCommunityIcons', name: 'eye-off' },
  QrCode:      { lib: 'MaterialCommunityIcons', name: 'qrcode' },
  CheckCircle: { lib: 'MaterialCommunityIcons', name: 'check-circle' },
  Loader:      { lib: 'MaterialCommunityIcons', name: 'loading' },
  RotateCcw:   { lib: 'MaterialCommunityIcons', name: 'rotate-3d-variant' },
  Sparkles:    { lib: 'MaterialCommunityIcons', name: 'sparkles' }
};

// Fichiers à traiter
const patterns = ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'];

patterns.forEach(pattern => {
  const files = glob.sync(pattern, { nodir: true });
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const orig = content;
    // Remplacer l'import Lucide
    content = content.replace(
      /import\s+\{[^}]+\}\s+from\s+['"]lucide-react-native['"];?/, 
      "import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';"
    );
    // Remplacer chaque icône
    for (const [oldName, { lib, name }] of Object.entries(mapping)) {
      const regex = new RegExp(`<${oldName}(\\s[^>]*)?/>`, 'g');
      content = content.replace(
        regex,
        `<${lib} name="${name}"$1/>`
      );
    }
    if (content !== orig) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Modifié :', file);
    }
  });
});
