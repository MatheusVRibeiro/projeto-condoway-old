import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';

import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

import Routes from './src/routes';
import { AuthProvider } from './src/contexts/AuthContext';
import Toast from 'react-native-toast-message';
// import { registerForPushNotificationsAsync } from './src/lib/notifications'; // Comentado

export default function App() {
  // const notificationListener = useRef(); // Comentado
  // const responseListener = useRef(); // Comentado

  /*
  // Comentámos todo o bloco useEffect que lida com as notificações
  useEffect(() => {
    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificação recebida:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Resposta à notificação:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
  */

  let [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  const colorScheme = useColorScheme();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Routes />
        </NavigationContainer>
        <Toast />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
