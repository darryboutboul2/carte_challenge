// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Permet à Metro de charger les fichiers .cjs du SDK Firebase
  config.resolver.sourceExts.push('cjs');

  // Désactive la résolution stricte par "exports" (utile pour certains modules internes)
  config.resolver.unstable_enablePackageExports = false;

  return config;
})();
