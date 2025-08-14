import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Ícones para as abas
import { Home, Calendar, MessageSquareWarning, User, Package } from 'lucide-react-native';

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
// A tela de Notificações pode ser acessada de outra forma, mas a incluímos aqui se necessário.
import Notifications from '../screens/App/Notifications';

// Simulação de um hook de autenticação.
// No futuro, você substituirá isso pelo seu Contexto de Autenticação.
const useAuth = () => {
  // Mude para `true` para ver as telas do app, `false` para ver as de login.
  const isLoggedIn = true; 
  return { isLoggedIn };
};

const AuthStack = createNativeStackNavigator();
const AppTab = createBottomTabNavigator();

// Navegador para as telas principais, com abas na parte inferior
function AppRoutes() {
  return (
    <AppTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb', // Azul primário
        tabBarInactiveTintColor: '#6b7280', // Cinza
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Poppins-Regular', // Adicione se estiver usando fontes customizadas
        },
      }}
    >
      <AppTab.Screen 
        name="DashboardTab" // Nome único para a rota da aba
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
        component={Perfil} 
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }} 
      />
    </AppTab.Navigator>
  );
}

// Navegador para o fluxo de autenticação
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


// Navegador principal que decide qual fluxo mostrar
export default function Routes() {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? <AppRoutes /> : <AuthRoutes />;
}