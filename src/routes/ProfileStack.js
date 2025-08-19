import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Perfil from '../screens/App/Perfil';
import Settings from '../screens/App/Settings';
import Help from '../screens/App/Help';

const ProfileStackNavigator = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <ProfileStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNavigator.Screen name="ProfileMain" component={Perfil} />
      <ProfileStackNavigator.Screen name="Settings" component={Settings} />
      <ProfileStackNavigator.Screen name="Help" component={Help} />
    </ProfileStackNavigator.Navigator>
  );
}
