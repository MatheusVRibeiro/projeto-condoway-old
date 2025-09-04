import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs from './AppTabs';
import Visitantes from '../screens/App/Visitantes';
import Packages from '../screens/App/Packages';
import Notifications from '../screens/App/Notifications';

const AppStackNavigator = createNativeStackNavigator();

export default function AppStack() {
  return (
    <AppStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <AppStackNavigator.Screen name="MainTabs" component={AppTabs} />
      <AppStackNavigator.Screen name="Packages" component={Packages} />
      <AppStackNavigator.Screen name="Visitantes" component={Visitantes} />
      <AppStackNavigator.Screen name="Notifications" component={Notifications} options={{ headerShown: true, title: 'Notificações' }} />
    </AppStackNavigator.Navigator>
  );
}
