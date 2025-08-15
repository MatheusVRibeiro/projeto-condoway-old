import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import Toast from 'react-native-toast-message';

// Importa o componente de rotas centralizado
import Routes from './src/routes'; 
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  // Carregamento das fontes Poppins
  let [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  // Garante que a app só será renderizada após as fontes carregarem
  if (!fontsLoaded) {
    return null; 
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <Routes />
      </NavigationContainer>
      {/* O Toast fica no final para aparecer por cima de tudo */}
      <Toast />
    </AuthProvider>
  );
}
