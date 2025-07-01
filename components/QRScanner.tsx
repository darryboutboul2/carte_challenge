// components/QRScanner.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal
} from 'react-native';
// Terminal Mac : cd /Users/cedricroptin/firebase-carte-challenge
import { CameraView as Camera, CameraType, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MaterialCommunityIcons,
  FontAwesome5
} from '@expo/vector-icons';
import { useGeolocation } from '@/hooks/useGeolocation';

interface QRScannerProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({
  visible,
  onClose,
  onScanSuccess
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [showInvalidQRModal, setShowInvalidQRModal] = useState(false);
  const [showLocationErrorModal, setShowLocationErrorModal] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);

  const { validateLocationForVisit } = useGeolocation();

  // Réinitialisation à chaque ouverture du scanner
  useEffect(() => {
    if (visible) {
      setScanned(false);
      setShowInvalidQRModal(false);
      setShowLocationErrorModal(false);
      setLocationError('');
    }
  }, [visible]);

  // Lecture du QR
  const handleBarCodeScanned = async ({
    data
  }: {
    data: string
  }) => {
    if (scanned) return;
    setScanned(true);

    // Filtre du contenu
    if (
      !data.includes('carte-challenge') &&
      !data.includes('gym-visit') &&
      data !== 'DEMO_QR_CODE' &&
      data !== 'carte-challenge-visit-2025'
    ) {
      setShowInvalidQRModal(true);
      return;
    }

    // Vérification de la géoloc
    setIsValidatingLocation(true);
    try {
      const result = await validateLocationForVisit();
      if (result.isValid) {
        onScanSuccess(data);
        onClose();
      } else {
        const d = result.distance || 0;
        setLocationError(
          d > 0
            ? `Désolé, vous n'êtes pas à la salle !\nVous êtes à ${d}m du club.`
            : result.error || 'Erreur de géolocalisation'
        );
        setShowLocationErrorModal(true);
      }
    } catch {
      setLocationError('Impossible de vérifier votre position');
      setShowLocationErrorModal(true);
    } finally {
      setIsValidatingLocation(false);
    }
  };

  // Réessayer après erreur
  const handleRetry = () => {
    setShowInvalidQRModal(false);
    setShowLocationErrorModal(false);
    setScanned(false);
  };

  if (!visible) return null;

  // --- Permissions caméra ---
  if (!permission) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1e1b4b', '#581c87']}
          style={styles.loadingContainer}
        >
          <FontAwesome5 name="camera" size={48} color="white" />
          <Text style={styles.loadingText}>
            Chargement de la caméra...
          </Text>
        </LinearGradient>
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1e1b4b', '#581c87']}
          style={styles.permissionContainer}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <FontAwesome5
            name="exclamation-circle"
            size={64}
            color="white"
          />
          <Text style={styles.permissionTitle}>
            Accès à la caméra requis
          </Text>
          <Text style={styles.permissionText}>
            Pour scanner le QR code, nous avons besoin
            d'accéder à votre caméra.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <LinearGradient
              colors={['#be185d', '#ec4899']}
              style={styles.buttonGradient}
            >
              <MaterialCommunityIcons
                name="camera"
                size={20}
                color="white"
              />
              <Text style={styles.buttonText}>
                Autoriser la caméra
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // --- Simulation sur le Web ---
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1e1b4b', '#581c87']}
          style={styles.webScanContainer}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <FontAwesome5 name="camera" size={64} color="white" />
          <Text style={styles.webScanTitle}>
            Scanner QR Code
          </Text>
          <Text style={styles.webScanText}>
            La caméra n'est pas disponible sur le Web.{'\n'}
            Cliquez sur le bouton ci-dessous pour simuler un scan.
          </Text>
          <TouchableOpacity
            style={styles.simulateButton}
            onPress={() =>
              handleBarCodeScanned({
                data: 'carte-challenge-visit-2025'
              } as any)
            }
            disabled={isValidatingLocation}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.buttonGradient}
            >
              {isValidatingLocation ? (
                <>
                  <MaterialCommunityIcons
                    name="loading"
                    size={20}
                    color="white"
                  />
                  <Text style={styles.buttonText}>
                    Vérification...
                  </Text>
                </>
              ) : (
                <Text style={styles.buttonText}>
                  Simuler un scan
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // --- Interface Native Expo CameraView (alias Camera) ---
  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.7)',
            'transparent',
            'rgba(0,0,0,0.7)'
          ]}
          style={styles.overlay}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color="white"
            />
          </TouchableOpacity>

          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.instructionText}>
              Placez le QR code dans le cadre
            </Text>
            {isValidatingLocation && (
              <View style={styles.validatingContainer}>
                <MaterialCommunityIcons
                  name="loading"
                  size={24}
                  color="white"
                />
                <Text style={styles.validatingText}>
                  Vérification de votre position...
                </Text>
              </View>
            )}
          </View>

          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={() =>
                setFacing((f: CameraType) =>
                  f === 'back' ? 'front' : 'back'
                )
              }
            >
              <MaterialCommunityIcons
                name="camera-switch"
                size={20}
                color="white"
              />
              <Text style={styles.flipText}>
                Retourner
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Camera>

      {/* Modal QR invalide */}
      <Modal
        visible={showInvalidQRModal}
        transparent
        animationType="fade"
        onRequestClose={handleRetry}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              style={styles.modalGradient}
            >
              <FontAwesome5
                name="times-circle"
                size={48}
                color="white"
              />
              <Text style={styles.modalTitle}>
                QR Code invalide
              </Text>
              <Text style={styles.modalText}>
                Ce QR code ne correspond pas à un passage en salle.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleRetry}
                >
                  <LinearGradient
                    colors={[
                      'rgba(255,255,255,0.2)',
                      'rgba(255,255,255,0.1)'
                    ]}
                    style={styles.modalButtonGradient}
                  >
                    <MaterialCommunityIcons
                      name="reload"
                      size={20}
                      color="white"
                    />
                    <Text style={styles.modalButtonText}>
                      Réessayer
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={onClose}
                >
                  <LinearGradient
                    colors={[
                      'rgba(255,255,255,0.2)',
                      'rgba(255,255,255,0.1)'
                    ]}
                    style={styles.modalButtonGradient}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={20}
                      color="white"
                    />
                    <Text style={styles.modalButtonText}>
                      Fermer
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Modal erreur géolocalisation */}
      <Modal
        visible={showLocationErrorModal}
        transparent
        animationType="fade"
        onRequestClose={handleRetry}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.modalGradient}
            >
              <MaterialCommunityIcons
                name="map-marker"
                size={48}
                color="white"
              />
              <Text style={styles.modalTitle}>
                ❌ Tu n'es pas dans le club !
              </Text>
              <Text style={styles.modalText}>
                {locationError}
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleRetry}
                >
                  <LinearGradient
                    colors={[
                      'rgba(255,255,255,0.2)',
                      'rgba(255,255,255,0.1)'
                    ]}
                    style={styles.modalButtonGradient}
                  >
                    <MaterialCommunityIcons
                      name="reload"
                      size={20}
                      color="white"
                    />
                    <Text style={styles.modalButtonText}>
                      Réessayer
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={onClose}
                >
                  <LinearGradient
                    colors={[
                      'rgba(255,255,255,0.2)',
                      'rgba(255,255,255,0.1)'
                    ]}
                    style={styles.modalButtonGradient}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={20}
                      color="white"
                    />
                    <Text style={styles.modalButtonText}>
                      Fermer
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles complets (≈370 lignes)
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000
  },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between' },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative'
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#be185d',
    borderWidth: 3
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  validatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251,191,36,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8
  },
  validatingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  bottomControls: { alignItems: 'center', paddingBottom: 50 },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8
  },
  flipText: { color: 'white', fontSize: 14, fontWeight: '600' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16
  },
  loadingText: { color: 'white', fontSize: 18 },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  permissionTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center'
  },
  permissionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30
  },
  permissionButton: { borderRadius: 12, overflow: 'hidden' },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  webScanContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  webScanTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12
  },
  webScanText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30
  },
  simulateButton: { borderRadius: 12, overflow: 'hidden' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  modalContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    maxWidth: 320,
    width: '100%'
  },
  modalGradient: { padding: 24, alignItems: 'center' },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center'
  },
  modalText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%'
  },
  modalButton: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  modalButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  }
});

export default QRScanner;
