import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
// A linha abaixo importa a constante 'styles' do arquivo irmão.
import { styles } from './styles';

// A linha abaixo é crucial. Ela exporta a função como padrão.
export default function StyledInput({ label, iconName, isPassword, ...props }) {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const secureText = isPassword && !isPasswordVisible;

    return (
        // Esta linha aplica o estilo 'container' que importamos.
        <View style={styles.container}> 
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.wrapper, isFocused && styles.wrapperFocused]}>
                {iconName && (
                    <Feather name={iconName} size={20} color={isFocused ? COLORS.primary : COLORS.icon} style={styles.icon} />
                )}
                <TextInput
                    style={styles.input}
                    secureTextEntry={secureText}
                    placeholderTextColor={COLORS.textSecondary}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props} 
                />
                {isPassword && (
                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                        <Feather 
                            name={isPasswordVisible ? "eye-off" : "eye"} 
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