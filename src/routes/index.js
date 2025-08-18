

import { useAuth } from '../contexts/AuthContext';
import AppStack from './AppStack';
import Login from '../screens/Auth/Login';
import SignUp from '../screens/Auth/SignUp';
import ForgotPassword from '../screens/Auth/ForgotPassword';
import ResetPassword from '../screens/Auth/ResetPassword';
import Onboarding from '../screens/Auxiliary/Onboarding';
import Help from '../screens/Auxiliary/Help';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './routeNames';

const AuthStack = createNativeStackNavigator();

// Navegador para o fluxo de autenticação (pré-login)
function AuthRoutes() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Onboarding" component={Onboarding} />
      <AuthStack.Screen name={ROUTES.LOGIN} component={Login} />
      <AuthStack.Screen name={ROUTES.SIGNUP} component={SignUp} />
      <AuthStack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPassword} />
      <AuthStack.Screen name={ROUTES.RESET_PASSWORD} component={ResetPassword} />
      <AuthStack.Screen name="Help" component={Help} />
    </AuthStack.Navigator>
  );
}

// O AuthProvider deve envolver a app no App.js, então aqui só consumimos o contexto
export default function Routes() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <AppStack /> : <AuthRoutes />;
}
