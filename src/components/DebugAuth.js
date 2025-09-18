import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function DebugAuth() {
  const { user, isLoggedIn, loading } = useAuth();
  
  console.log('🔍 DebugAuth - user:', user, 'isLoggedIn:', isLoggedIn, 'loading:', loading);
  
  return (
    <View style={{ 
      position: 'absolute', 
      top: 50, 
      right: 10, 
      backgroundColor: 'rgba(0,0,0,0.8)', 
      padding: 10, 
      borderRadius: 5,
      zIndex: 9999
    }}>
      <Text style={{ color: 'white', fontSize: 10 }}>
        User: {user ? user.user_nome : 'null'}
      </Text>
      <Text style={{ color: 'white', fontSize: 10 }}>
        User ID: {user?.user_id || 'null'}
      </Text>
      <Text style={{ color: 'white', fontSize: 10 }}>
        Userap ID: {user?.userap_id || 'null'}
      </Text>
      <Text style={{ color: 'white', fontSize: 10 }}>
        Logged: {isLoggedIn ? 'yes' : 'no'}
      </Text>
      <Text style={{ color: 'white', fontSize: 10 }}>
        Loading: {loading ? 'yes' : 'no'}
      </Text>
    </View>
  );
}
