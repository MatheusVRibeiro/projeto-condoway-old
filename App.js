import 'react-native-gesture-handler';
import React from 'react';
import Navegacao from './src/routes';
import { AppLoading } from 'expo'; // Expo's AppLoading component is deprecated
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

export default function App() {
  // Carrega as variações da fonte que vamos usar
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Enquanto as fontes não forem carregadas, não exibe nada (ou um loading)
  if (!fontsLoaded) {
    return null; 
  }

  // Após carregar, exibe o aplicativo
  return <Navegacao />;
}