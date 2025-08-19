import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export function useOnboardingStatus() {
  const [showOnboarding, setShowOnboarding] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('onboardingSeen').then((value) => {
      setShowOnboarding(value !== 'true');
    });
  }, []);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('onboardingSeen', 'true');
    setShowOnboarding(false);
  };

  return { showOnboarding, completeOnboarding };
}
