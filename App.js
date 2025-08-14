import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

// Importa o componente de rotas centralizado
import Routes from './src/routes'; 

export default function App() {
  // Carregamento das fontes Poppins
  let [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  // Garante que o app só será renderizado após as fontes carregarem
  if (!fontsLoaded) {
    return null; 
  }

  // O NavigationContainer envolve o componente Routes, que gerencia as telas
  return (
    <NavigationContainer>
      <Routes />
    </NavigationContainer>
  );
}