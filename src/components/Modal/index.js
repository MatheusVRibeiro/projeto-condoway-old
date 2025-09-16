import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { X } from 'lucide-react-native';
import { styles } from './styles';
import Button from '../Button';

export default function ModalComponent({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closable = true,
  actions,
  size = 'medium', // small, medium, large, fullscreen
  theme
}) {
  const handleBackdropPress = () => {
    if (closable) {
      onClose();
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.modalSmall;
      case 'large':
        return styles.modalLarge;
      case 'fullscreen':
        return styles.modalFullscreen;
      default:
        return styles.modalMedium;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={closable ? onClose : undefined}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[
              styles.modal,
              getSizeStyle(),
              { backgroundColor: theme?.colors?.card || 'white' }
            ]}>
              {/* Header */}
              {(title || showCloseButton) && (
                <View style={styles.header}>
                  {title && (
                    <Text style={[
                      styles.title,
                      { color: theme?.colors?.text || '#000' }
                    ]}>
                      {title}
                    </Text>
                  )}
                  {showCloseButton && closable && (
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={onClose}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X 
                        size={24} 
                        color={theme?.colors?.text || '#666'} 
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Content */}
              <View style={styles.content}>
                {children}
              </View>

              {/* Actions */}
              {actions && (
                <View style={styles.actions}>
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || 'primary'}
                      onPress={action.onPress}
                      style={[
                        styles.actionButton,
                        index > 0 && styles.actionButtonMargin
                      ]}
                    >
                      {action.label}
                    </Button>
                  ))}
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
