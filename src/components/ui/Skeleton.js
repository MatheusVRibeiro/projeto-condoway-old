// src/components/ui/Skeleton.js
import React from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';

const Skeleton = ({ width, height, borderRadius }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: Platform.OS !== 'web',
      })
    ).start();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={[styles.skeleton, { width, height, borderRadius, overflow: 'hidden' }]}>
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          transform: [{ translateX: translateX }],
          backgroundColor: 'rgba(0,0,0,0.12)',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
});

export default Skeleton;