// src/routes/index.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackRoutes from "./stackNavigation";

export default function Navegacao() {
    return (
      <NavigationContainer>
        <StackRoutes />
      </NavigationContainer>
    );
}