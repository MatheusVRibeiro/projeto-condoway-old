import React, { useRef, useState } from 'react';
import { View, Text, SafeAreaView, ImageBackground, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useOnboardingStatus } from '../../../hooks/useOnboardingStatus';
import { useAuth } from '../../../contexts/AuthContext';
import { ROUTES } from '../../../routes/routeNames';
import { styles } from './styles';
import { onboardingSlides } from './mock';

const { width } = Dimensions.get('window');

const Onboarding = () => {
  const navigation = useNavigation();
  const { completeOnboarding } = useOnboardingStatus();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef();

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
    // Use reset para garantir que a rota exista no estado da navegação
    if (user) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'AppStack' }],
        })
      );
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: ROUTES.LOGIN }],
        })
      );
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.slideContent} pointerEvents="box-none">
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Full-screen background image driven by currentIndex */}
      <ImageBackground source={onboardingSlides[currentIndex].image} style={styles.illustration} imageStyle={{ resizeMode: 'cover' }} accessibilityLabel="Ilustração de fundo">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.logoContainer}>
            <Image source={require('../../../../assets/condo.png')} style={styles.logo} accessibilityLabel="Logo" />
            <Text style={styles.logoText}>Condoway</Text>
          </View>
          <FlatList
            ref={flatListRef}
            data={onboardingSlides}
            renderItem={renderItem}
            keyExtractor={item => item.key}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={[styles.carousel, { flex: 1 }]}
            contentContainerStyle={{ justifyContent: 'center', minHeight: Dimensions.get('window').height }}
            getItemLayout={(data, index) => ({ length: Dimensions.get('window').width, offset: Dimensions.get('window').width * index, index })}
          />
          <View style={styles.dotsContainer}>
            {onboardingSlides.map((_, idx) => (
              <View key={idx} style={[styles.dot, currentIndex === idx && styles.dotActive]} />
            ))}
          </View>
          {currentIndex === onboardingSlides.length - 1 ? (
            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleStart} accessibilityLabel="Começar agora">
              <Text style={[styles.buttonText, styles.buttonTextPrimary]}>Começar agora</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleNext} accessibilityLabel="Próximo slide">
              <Text style={styles.buttonText}>Próximo</Text>
            </TouchableOpacity>
          )}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default Onboarding;
