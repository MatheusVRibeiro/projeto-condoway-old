import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

const useQRScanner = () => {
  const openQRScanner = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Scanner QR Code',
      'Esta funcionalidade estará disponível em breve!\n\n✅ Escaneie o código QR da encomenda\n✅ Confirmação rápida de retirada\n✅ Histórico automático',
      [{ text: 'Ok', style: 'default' }]
    );
  }, []);

  return {
    openQRScanner
  };
};

export default useQRScanner;
