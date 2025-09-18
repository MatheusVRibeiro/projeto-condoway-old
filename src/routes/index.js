import { useAuth } from '../contexts/AuthContext';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import AppStack from './AppStack';
import Login from '../screens/Auth/Login';
import SignUp from '../screens/Auth/SignUp';
import ForgotPassword from '../screens/Auth/ForgotPassword';
import ResetPassword from '../screens/Auth/ResetPassword';
import Onboarding from '../screens/App/Onboarding';
import Help from '../screens/App/Help';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './routeNames';

const RootStack = createNativeStackNavigator();

export default function Routes() {
  const { user, loading } = useAuth();
  const { showOnboarding } = useOnboardingStatus();
  
  // Mostrar loading enquanto verifica estado de autenticação e onboarding
  if (loading || showOnboarding === null) {
    return null; // ou uma tela de loading
  }
  
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {showOnboarding ? (
        // 1. Primeira vez - mostrar Onboarding
        <>
          <RootStack.Screen name="Onboarding" component={Onboarding} />
          <RootStack.Screen name={ROUTES.LOGIN} component={Login} />
          <RootStack.Screen name={ROUTES.SIGNUP} component={SignUp} />
          <RootStack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPassword} />
          <RootStack.Screen name={ROUTES.RESET_PASSWORD} component={ResetPassword} />
          <RootStack.Screen name="Help" component={Help} />
        </>
      ) : !user ? (
        // 2. Onboarding concluído mas não logado - mostrar Auth
        <>
          <RootStack.Screen name={ROUTES.LOGIN} component={Login} />
          <RootStack.Screen name={ROUTES.SIGNUP} component={SignUp} />
          <RootStack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPassword} />
          <RootStack.Screen name={ROUTES.RESET_PASSWORD} component={ResetPassword} />
          <RootStack.Screen name="Help" component={Help} />
        </>
      ) : (
        // 3. Logado - mostrar App direto
        <RootStack.Screen name="MainTabs" component={AppStack} />
      )}
    </RootStack.Navigator>
  );
}
