import React from 'react';
import { View, Text, Image } from 'react-native';
import Button from '../../components/Button';
import { styles } from './styles';

const Onboarding = React.memo(function Onboarding({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/condo.png')} style={styles.logo} />
      <Text style={styles.title}>Bem-vindo ao CondoWay!</Text>
      <Text style={styles.subtitle}>Gerencie o seu condomínio de forma simples e moderna.</Text>
      <Image source={require('../../../assets/onboarding-ilustracao.png')} style={styles.illustration} />
      <Button title="Começar" onPress={() => navigation.replace('Login')} style={styles.button} />
    </View>
  );
});

export default Onboarding;
