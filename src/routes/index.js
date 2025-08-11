import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import StackNavigation from "./stackNavigation";

export default function Navegacao() {
    return (
    <NavigationContainer>
      <StackNavigation />
    </NavigationContainer>
  );
}