import { useRef } from 'react';
import * as Animatable from 'react-native-animatable';

export const useAnimation = () => {
  const animationRef = useRef(null);

  const animations = {
    // Entradas
    fadeInUp: (duration = 400, delay = 0) => ({
      animation: 'fadeInUp',
      duration,
      delay,
      ref: animationRef
    }),
    
    fadeInDown: (duration = 400, delay = 0) => ({
      animation: 'fadeInDown',
      duration,
      delay,
      ref: animationRef
    }),
    
    slideInRight: (duration = 300, delay = 0) => ({
      animation: 'slideInRight',
      duration,
      delay,
      ref: animationRef
    }),
    
    // Saídas
    fadeOut: (duration = 300) => ({
      animation: 'fadeOut',
      duration,
      ref: animationRef
    }),
    
    // Ações
    pulse: (duration = 500) => ({
      animation: 'pulse',
      duration,
      ref: animationRef
    }),
    
    shake: (duration = 400) => ({
      animation: 'shake',
      duration,
      ref: animationRef
    }),
    
    // Zoom
    zoomIn: (duration = 300, delay = 0) => ({
      animation: 'zoomIn',
      duration,
      delay,
      ref: animationRef
    })
  };

  const animate = (animationType, options = {}) => {
    if (animationRef.current) {
      animationRef.current[animationType](options.duration || 400);
    }
  };

  return {
    animations,
    animate,
    animationRef
  };
};
