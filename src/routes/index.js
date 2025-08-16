import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, MessageSquareWarning, User, Package } from 'lucide-react-native';

// Importe o hook de autenticação REAL do contexto
import { useAuth } from '../contexts/AuthContext';

// Importe suas telas de Autenticação
import Login from '../screens/Auth/Login';
import SignUp from '../screens/Auth/SignUp';
import ForgotPassword from '../screens/Auth/ForgotPassword';
import ResetPassword from '../screens/Auth/ResetPassword';

// Importe as telas principais do App
import Dashboard from '../screens/App/Dashboard';
import Reservas from '../screens/App/Reservas';
import Ocorrencias from '../screens/App/Ocorrencias';
import Perfil from '../screens/App/Perfil';
import Packages from '../screens/App/Packages';
import Settings from '../screens/App/Settings';
// 1. Importe o novo ecrã de Visitantes
import Visitantes from '../screens/App/Visitantes'; 

const AuthStack = createNativeStackNavigator();
const AppTab = createBottomTabNavigator();
const ProfileStackNavigator = createNativeStackNavigator();
// 2. Crie um novo StackNavigator principal para a App
const AppStackNavigator = createNativeStackNavigator(); 

function ProfileStack() {
  return (
    <ProfileStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNavigator.Screen name="ProfileMain" component={Perfil} />
      <ProfileStackNavigator.Screen name="Settings" component={Settings} />
    </ProfileStackNavigator.Navigator>
  );
}

// 3. Renomeie a sua antiga função AppRoutes para TabNavigator
//    Ela agora representa apenas a navegação por abas.
function TabNavigator() {
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

// 4. A função AppRoutes agora é o Stack principal, que contém
//    tanto a navegação por abas como os ecrãs que abrem por cima.
function AppRoutes() {
  return (
    <AppStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <AppStackNavigator.Screen name="MainTabs" component={TabNavigator} />
      <AppStackNavigator.Screen name="Visitantes" component={Visitantes} />
    </AppStackNavigator.Navigator>
  );
}

// Navegador para o fluxo de autenticação (pré-login)
function AuthRoutes() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="SignUp" component={SignUp} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />
      <AuthStack.Screen name="ResetPassword" component={ResetPassword} />
    </AuthStack.Navigator>
  );
}

// O AuthProvider deve envolver a app no App.js, então aqui só consumimos o contexto
export default function Routes() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <AppRoutes /> : <AuthRoutes />;
}
