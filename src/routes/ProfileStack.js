import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Perfil from '../screens/App/Perfil';
import Settings from '../screens/App/Settings';
import NotificationPreferences from '../screens/App/Settings/NotificationPreferences';
import Help from '../screens/App/Help';
import EditProfile from '../screens/App/Perfil/EditProfile';
import Security from '../screens/App/Perfil/Security';
import UnitDetails from '../screens/App/Perfil/UnitDetails';
import Documents from '../screens/App/Perfil/Documents';
import HelpSupport from '../screens/App/Perfil/Help';
import About from '../screens/App/Perfil/Placeholders/About';
import ChangePassword from '../screens/App/Perfil/Placeholders/ChangePassword';

const ProfileStackNavigator = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <ProfileStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNavigator.Screen name="ProfileMain" component={Perfil} />
      <ProfileStackNavigator.Screen name="Settings" component={Settings} />
      <ProfileStackNavigator.Screen name="NotificationPreferences" component={NotificationPreferences} />
      <ProfileStackNavigator.Screen name="Help" component={HelpSupport} />
      <ProfileStackNavigator.Screen name="EditProfile" component={EditProfile} />
      <ProfileStackNavigator.Screen name="Security" component={Security} />
      <ProfileStackNavigator.Screen name="UnitDetails" component={UnitDetails} />
      <ProfileStackNavigator.Screen name="Documents" component={Documents} />
      <ProfileStackNavigator.Screen name="About" component={About} />
      <ProfileStackNavigator.Screen name="ChangePassword" component={ChangePassword} />
    </ProfileStackNavigator.Navigator>
  );
}
