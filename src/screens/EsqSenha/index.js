import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    TextInput
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles } from './styles';
import { COLORS } from '../../constants/theme';

export default function EsqSenha({ navigation }) {
    const [email, setEmail] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [linkSent, setLinkSent] = useState(false); // Novo estado para controlar a UI

    const handleResetPassword = () => {
        if (!email) {
            // Usamos um Alert aqui porque o card ainda não mudou
            Alert.alert("Campo Vazio", "Por favor, insira seu e-mail.");
            return;
        }
        // Em vez de um Alert, apenas mudamos o estado para mostrar o novo card
        setLinkSent(true);
    };

    // Card de Sucesso (renderizado quando linkSent for true)
    if (linkSent) {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        <Feather name="check-circle" size={32} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Link Enviado!</Text>
                    <Text style={styles.subtitle}>
                        Verifique sua caixa de entrada e pasta de spam. Enviamos um link seguro para o e-mail: 
                        <Text style={{ fontFamily: FONTS.bold, color: COLORS.textPrimary }}> {email}</Text>
                    </Text>
                    <TouchableOpacity style={styles.successButton} onPress={() => navigation.goBack()}>
                        <Feather name="arrow-left" size={20} color={COLORS.primary} />
                        <Text style={styles.successButtonText}>Voltar para o Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Card Padrão (renderizado quando linkSent for false)
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.iconContainer}>
                    <Feather name="key" size={28} color={COLORS.primary} />
                </View>

                <Text style={styles.title}>Recuperar Senha</Text>
                <Text style={styles.subtitle}>
                    Insira seu e-mail de cadastro e enviaremos um link para você criar uma nova senha.
                </Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>E-mail Cadastrado</Text>
                    <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
                        <Feather name="mail" size={20} color={isFocused ? COLORS.primary : COLORS.icon} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="seu@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholderTextColor={COLORS.textSecondary}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                    <Feather name="send" size={20} color={COLORS.card} />
                    <Text style={styles.buttonText}>Enviar Link de Recuperação</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={16} color={COLORS.primary} />
                    <Text style={styles.backButtonText}>Voltar para o Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}