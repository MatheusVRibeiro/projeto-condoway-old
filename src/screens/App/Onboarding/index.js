import React, { useRef, useState } from 'react';
import { View, Text, ImageBackground, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../../contexts/ThemeProvider';
import { useOnboardingStatus } from '../../../hooks/useOnboardingStatus';
import { useAuth } from '../../../contexts/AuthContext';
import { ROUTES } from '../../../routes/routeNames';
import { styles } from './styles';
import { onboardingSlides } from './mock';

const { width } = Dimensions.get('window');

const Onboarding = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { completeOnboarding } = useOnboardingStatus();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const flatListRef = useRef();

  // Textos rotativos
  const rotatingTexts = [
    'Gerencie o seu condomínio de forma simples e moderna.',
    'Fique por dentro de avisos, reservas e notificações em tempo real.',
    'Organize suas tarefas e facilite o dia a dia do seu condomínio.',
  ];

  // Trocar texto a cada 3 segundos
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % rotatingTexts.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const handleNext = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleStart = async () => {
    await completeOnboarding();
    // Após completar o onboarding, navegar para Login
    navigation.navigate(ROUTES.LOGIN);
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <View style={[styles.slideContent, { pointerEvents: 'box-none' }]}>
        <Text style={[styles.title, { color: '#fff' }]}>{item.title}</Text>
        <Text style={[styles.subtitle, { color: '#e0e7ef' }]}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      {/* Full-screen background image */}
      <ImageBackground source={onboardingSlides[0].image} style={styles.illustration} resizeMode="cover" accessibilityLabel="Ilustração de fundo">
        <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }}>
          <Animatable.View animation="fadeInDown" duration={1200} style={styles.logoContainer}>
            <Image source={require('../../../../assets/condo.png')} style={styles.logo} accessibilityLabel="Logo" />
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" duration={1200} delay={400} style={styles.contentContainer}>
            <Animatable.Text 
              key={currentTextIndex}
              animation="fadeIn" 
              duration={800}
              style={[styles.subtitle, { color: '#fff' }]}
            >
              {rotatingTexts[currentTextIndex]}
            </Animatable.Text>
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" duration={1200} delay={600} style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleStart} accessibilityLabel="Acessar">
              <Text style={[styles.buttonText, styles.buttonTextPrimary]}>Acessar</Text>
            </TouchableOpacity>
          </Animatable.View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default Onboarding;
