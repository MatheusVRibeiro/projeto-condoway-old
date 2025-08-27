import React, { Suspense, lazy } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs from './AppTabs';
const Visitantes = lazy(() => import('../screens/App/Visitantes'));
const Packages = lazy(() => import('../screens/App/Packages'));
const Notifications = lazy(() => import('../screens/App/Notifications'));

const AppStackNavigator = createNativeStackNavigator();

export default function AppStack() {
  return (
    <AppStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <AppStackNavigator.Screen name="MainTabs" component={AppTabs} />
      <AppStackNavigator.Screen name="Packages">
        {() => (
          <Suspense fallback={null}>
            <Packages />
          </Suspense>
        )}
      </AppStackNavigator.Screen>
      <AppStackNavigator.Screen name="Visitantes">
        {() => (
          <Suspense fallback={null}>
            <Visitantes />
          </Suspense>
        )}
      </AppStackNavigator.Screen>
      <AppStackNavigator.Screen name="Notifications" options={{ headerShown: true, title: 'Notificações' }}>
        {() => (
          <Suspense fallback={null}>
            <Notifications />
          </Suspense>
        )}
      </AppStackNavigator.Screen>
    </AppStackNavigator.Navigator>
  );
}
