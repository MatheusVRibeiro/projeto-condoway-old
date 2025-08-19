import React from 'react';
import { View, Text, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

// Componente da Ilustração (SVG)
const OnboardingIllustration = () => (
  <Svg width="300" height="220" viewBox="0 0 300 220">
    {/* Prédio */}
    <Rect x="90" y="20" width="120" height="180" rx="8" fill="#4A5568" />
    <Rect x="115" y="160" width="70" height="40" fill="#2D3748" />
    {/* Janelas */}
    <Rect x="105" y="40" width="20" height="25" fill="#A0AEC0" />
    <Rect x="140" y="40" width="20" height="25" fill="#A0AEC0" />
    <Rect x="175" y="40" width="20" height="25" fill="#A0AEC0" />
    <Rect x="105" y="80" width="20" height="25" fill="#A0AEC0" />
    <Rect x="140" y="80" width="20" height="25" fill="#A0AEC0" />
    <Rect x="175" y="80" width="20" height="25" fill="#A0AEC0" />
    <Rect x="105" y="120" width="20" height="25" fill="#A0AEC0" />
    <Rect x="140" y="120" width="20" height="25" fill="#A0AEC0" />
    <Rect x="175" y="120" width="20" height="25" fill="#A0AEC0" />
    {/* Pessoas e Natureza */}
    <Path d="M0 200 C 50 180, 100 180, 150 200 S 250 220, 300 200" fill="#38A169" />
    <Path d="M0 220 L 0 200 C 50 190, 100 190, 150 200 S 250 210, 300 200 L 300 220 Z" fill="#2F855A" />
    <Circle cx="50" cy="155" r="8" fill="#F6E05E" />
    <Rect x="42" y="163" width="16" height="30" fill="#F6E05E" />
    <Circle cx="250" cy="155" r="8" fill="#ED8936" />
    <Path d="M242 193 L 245 163 L 255 163 L 258 193 Z" fill="#ED8936" />
  </Svg>
);

export default function Onboarding() {
  const navigation = useNavigation();

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#2563eb']} // Gradiente de azul
        style={styles.gradient}
      >
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          
          <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
            <Image
              source={require('../../../../assets/condoway-t.png')}
              style={styles.logo}
            />
          </Animatable.View>

          <Animatable.View animation="zoomIn" duration={1000} style={styles.illustrationContainer}>
            <OnboardingIllustration />
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={1000} style={styles.mainContent}>
            <Text style={styles.title}>Sua vida em condomínio mais simples.</Text>
            <Text style={styles.subtitle}>Gerencie reservas, avisos e ocorrências em um só lugar.</Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={1000} delay={200} style={styles.footer}>
            <TouchableOpacity style={styles.button} onPress={handleStart}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
          </Animatable.View>

        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
