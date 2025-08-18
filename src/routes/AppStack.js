
import React, { Suspense, lazy } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs from './AppTabs';
const Visitantes = lazy(() => import('../screens/App/Visitantes'));

const AppStackNavigator = createNativeStackNavigator();

export default function AppStack() {
  return (
    <AppStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <AppStackNavigator.Screen name="MainTabs" component={AppTabs} />
      <AppStackNavigator.Screen name="Visitantes">
        {() => (
          <Suspense fallback={null}>
            <Visitantes />
          </Suspense>
        )}
      </AppStackNavigator.Screen>
    </AppStackNavigator.Navigator>
  );
}
