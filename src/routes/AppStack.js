import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs from './AppTabs';
import Visitantes from '../screens/App/Visitantes';
import AuthorizeVisitorScreen from '../screens/App/Visitantes/AuthorizeVisitorScreen';
import InvitationGeneratedScreen from '../screens/App/Visitantes/InvitationGeneratedScreen';
import Packages from '../screens/App/Packages';
import Notifications from '../screens/App/Notifications';
import { useTheme } from '../contexts/ThemeProvider';

const AppStackNavigator = createNativeStackNavigator();

export default function AppStack() {
  const { theme } = useTheme();

  return (
    <AppStackNavigator.Navigator
      screenOptions={{
        // Default header style uses app theme; most screens keep headerHidden (tabs)
        headerShown: false,
        headerStyle: {
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.border,
        },
        headerTintColor: theme.colors.text,
        headerTitleAlign: 'center',
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
        // Remove large shadows on header to match app look
        headerShadowVisible: false,
      }}
    >
  <AppStackNavigator.Screen name="Dashboard" component={AppTabs} />
      <AppStackNavigator.Screen
        name="Packages"
        component={Packages}
        options={{ headerShown: true, title: 'Encomendas' }}
      />
      <AppStackNavigator.Screen
        name="Visitantes"
        component={Visitantes}
        options={{ headerShown: true, title: 'Visitantes' }}
      />
      <AppStackNavigator.Screen name="AuthorizeVisitor" component={AuthorizeVisitorScreen} />
      <AppStackNavigator.Screen name="InvitationGenerated" component={InvitationGeneratedScreen} />
      <AppStackNavigator.Screen name="Notifications" component={Notifications} options={{ headerShown: true, title: 'Notificações' }} />
    </AppStackNavigator.Navigator>
  );
}
