import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import Toast from 'react-native-toast-message';

import Routes from './src/routes';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeProvider';
import { NotificationProvider } from './src/contexts/NotificationProvider';

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <NavigationContainer>
              <Routes />
            </NavigationContainer>
            <Toast />
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
