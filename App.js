import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import Toast from 'react-native-toast-message'; // 1. Importe o Toast

import Routes from './src/routes'; 

export default function App() {
  let [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <>
      <NavigationContainer>
        <Routes />
      </NavigationContainer>
      <Toast /> 
      {/* 2. Adicione o componente Toast aqui, fora do NavigationContainer */}
    </>
  );
}