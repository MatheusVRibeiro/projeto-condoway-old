import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, MessageSquareWarning, User } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeProvider';

import Dashboard from '../screens/App/Dashboard';
import Reservas from '../screens/App/Reservas';
import Ocorrencias from '../screens/App/Ocorrencias';
import ProfileStack from './ProfileStack';

const AppTab = createBottomTabNavigator();


const AppTabs = React.memo(function AppTabs() {
  const { theme } = useTheme();
  
  return (
    <AppTab.Navigator
      detachInactiveScreens={true}
      lazy={true}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <AppTab.Screen 
        name="DashboardTab"
        component={Dashboard} 
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }} 
      />
      <AppTab.Screen 
        name="ReservasTab" 
        component={Reservas} 
        options={{
          tabBarLabel: 'Reservas',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }} 
      />
      <AppTab.Screen 
        name="OcorrenciasTab" 
        component={Ocorrencias} 
        options={{
          tabBarLabel: 'Ocorrências',
          tabBarIcon: ({ color, size }) => <MessageSquareWarning color={color} size={size} />,
        }} 
      />
      {/* Visitantes and Packages are intentionally handled by AppStack as stack screens above the tabs */}
      <AppTab.Screen 
        name="PerfilTab" 
        component={ProfileStack} 
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }} 
      />
    </AppTab.Navigator>
  );
});

export default AppTabs;
