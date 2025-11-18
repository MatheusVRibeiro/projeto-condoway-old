import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export function useOnboardingStatus() {
  const [showOnboarding, setShowOnboarding] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('onboardingSeen').then((value) => {
      setShowOnboarding(value !== 'true');
    });

    // Expor um callback global para que outros lugares (ex: AuthContext)
    // possam notificar quando o onboarding for marcado como concluído.
    global.onOnboardingChanged = (newValue) => {
      try {
        // newValue: string 'true'|'false' or boolean
        const val = (typeof newValue === 'string') ? newValue : (newValue ? 'true' : 'false');
        setShowOnboarding(val !== 'true');
      } catch (e) {
        console.warn('⚠️ [useOnboardingStatus] onOnboardingChanged error', e);
      }
    };
    return () => { global.onOnboardingChanged = null; };
  }, []);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('onboardingSeen', 'true');
    setShowOnboarding(false);
  };

  return { showOnboarding, completeOnboarding };
}
