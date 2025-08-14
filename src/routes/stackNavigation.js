import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//Auth
import Login from '../screens/Login';
import SignUp from '../screens/SignUp'; // <-- CORREÇÃO AQUI
import ForgotPassword from '../screens/ForgotPassword';

//Home
import Dashboard from '../screens/Dashboard';

const Stack = createNativeStackNavigator();

export default function StackNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

      <Stack.Screen name="Dashboard" component={Dashboard} />
    </Stack.Navigator>
  );
}