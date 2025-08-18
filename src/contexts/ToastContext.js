import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from 'react-native-toast-message';

const ToastContext = createContext({
  showToast: () => {},
});

export const ToastProvider = ({ children }) => {
  const showToast = useCallback((options) => {
    Toast.show(options);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
