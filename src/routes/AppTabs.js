import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, MessageSquareWarning, User, Package } from 'lucide-react-native';
import Dashboard from '../screens/App/Dashboard';
import Reservas from '../screens/App/Reservas';
import Ocorrencias from '../screens/App/Ocorrencias';
import Packages from '../screens/App/Packages';
import ProfileStack from './ProfileStack';

const AppTab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <AppTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
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
      <AppTab.Screen 
        name="PackagesTab" 
        component={Packages} 
        options={{
          tabBarLabel: 'Encomendas',
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
        }} 
      />
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
}
