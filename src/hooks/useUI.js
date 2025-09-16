import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

export const useModal = (initialState = false) => {
  const [isVisible, setIsVisible] = useState(initialState);

  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);
  const toggle = useCallback(() => setIsVisible(prev => !prev), []);

  return {
    isVisible,
    show,
    hide,
    toggle
  };
};

export const useConfirm = () => {
  const confirm = useCallback((title, message, onConfirm, onCancel) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancelar', style: 'cancel', onPress: onCancel },
        { text: 'Confirmar', style: 'destructive', onPress: onConfirm }
      ]
    );
  }, []);

  return { confirm };
};
