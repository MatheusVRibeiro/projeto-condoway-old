import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { styles } from './styles';
import { useTheme } from '../../contexts/ThemeProvider';

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  theme: propTheme,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconPress,
  showPasswordToggle = false,
  ...props
}) {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(!secureTextEntry);

  const handlePasswordToggle = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Safely try to get theme from context; use try/catch because useTheme throws when outside provider
  let contextTheme = null;
  try {
    contextTheme = useTheme();
  } catch (e) {
    contextTheme = null;
  }

  const theme = propTheme || contextTheme?.theme;

  // Defensive guard: if theme is not available yet, avoid rendering to prevent crashes
  if (!theme) return null;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      )}
      
      <View style={[
        styles.inputContainer,
        { 
          backgroundColor: theme.colors.card,
          borderColor: error ? '#dc2626' : theme.colors.border
        },
        !editable && styles.disabled
      ]}>
        {LeftIcon && (
          <View style={styles.leftIcon}>
            <LeftIcon size={20} color={theme.colors.textSecondary} />
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            { 
              color: theme.colors.text,
              textAlignVertical: multiline ? 'top' : 'center'
            },
            LeftIcon && styles.inputWithLeftIcon,
            (RightIcon || showPasswordToggle) && styles.inputWithRightIcon
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={showPasswordToggle ? !isPasswordVisible : secureTextEntry}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          {...props}
        />
        
        {showPasswordToggle && (
          <TouchableOpacity onPress={handlePasswordToggle} style={styles.rightIcon}>
            {isPasswordVisible ? (
              <EyeOff size={20} color={theme.colors.textSecondary} />
            ) : (
              <Eye size={20} color={theme.colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
        
        {RightIcon && !showPasswordToggle && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <RightIcon size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={[styles.error, { color: '#dc2626' }]}>{error}</Text>
      )}
    </View>
  );
}
