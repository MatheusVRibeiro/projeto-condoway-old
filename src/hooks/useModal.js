import { useState, useCallback } from 'react';

const useModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const openModal = useCallback((item = null) => {
    setSelectedItem(item);
    setIsVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsVisible(false);
    setSelectedItem(null);
  }, []);

  return {
    isVisible,
    selectedItem,
    openModal,
    closeModal
  };
};

export default useModal;
