import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles } from './styles';
import { COLORS } from '../../constants/theme';

// A linha 'export default' garante que o componente possa ser importado por outras telas.
export default function StyledInput({ label, iconName, isPassword, showPassword, setShowPassword, ...props }) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.inputContainer}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
                {iconName && (
                    <Feather name={iconName} size={20} color={isFocused ? COLORS.primary : COLORS.icon} style={styles.icon} />
                )}
                <TextInput
                    style={styles.input}
                    secureTextEntry={isPassword && !showPassword}
                    placeholderTextColor={COLORS.textSecondary}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    // Passa todas as outras props (value, onChangeText, etc.) para o TextInput
                    {...props} 
                />
                {isPassword && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Feather 
                            name={showPassword ? "eye-off" : "eye"} 
                            size={20} 
                            color={COLORS.icon}
                            style={styles.eyeIcon} 
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}