// src/screens/CadUsuario/index.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from './styles'; // <-- ESSA LINHA É A SOLUÇÃO
import { 
    validateFullName, 
    validateEmail, 
    validateStrongPassword, 
    validateRequired 
} from '../../../utils/validation';

export default function CadUsuario({ navigation }) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState(null);

    const handleSignUp = () => {
        const newErrors = {};

        // Validação de nome completo
        if (!validateRequired(nome)) {
            newErrors.nome = 'Nome é obrigatório';
        } else if (!validateFullName(nome)) {
            newErrors.nome = 'Digite seu nome completo (mínimo 2 partes, ex: João Silva)';
        }

        // Validação de e-mail
        if (!validateRequired(email)) {
            newErrors.email = 'E-mail é obrigatório';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Digite um e-mail válido (ex: usuario@exemplo.com)';
        }

        // Validação de senha forte
        if (!validateRequired(password)) {
            newErrors.password = 'Senha é obrigatória';
        } else {
            const passwordValidation = validateStrongPassword(password);
            if (!passwordValidation.valid) {
                newErrors.password = passwordValidation.errors.join(', ');
            }
        }

        // Validação de confirmação de senha
        if (!validateRequired(confirmPassword)) {
            newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'As senhas não conferem';
        }

        setErrors(newErrors);

        // Se houver erros, exibe o primeiro
        if (Object.keys(newErrors).length > 0) {
            const firstError = Object.values(newErrors)[0];
            Alert.alert("Erro de validação", firstError);
            return;
        }

        // Tudo validado, prossegue com o cadastro
        Alert.alert("Cadastro realizado!", "Você será redirecionado para a tela de login.");
        navigation.navigate('Login');
    };

    // Atualiza a força da senha em tempo real
    const handlePasswordChange = (text) => {
        setPassword(text);
        if (text.length > 0) {
            const validation = validateStrongPassword(text);
            setPasswordStrength(validation);
        } else {
            setPasswordStrength(null);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <View style={styles.container}>
                    <Text style={styles.title}>Crie sua conta</Text>
                    <Text style={styles.subtitle}>É rápido e fácil.</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nome completo</Text>
                        <TextInput
                            style={[styles.input, errors.nome && { borderColor: 'red', borderWidth: 1 }]}
                            placeholder="Seu nome completo"
                            value={nome}
                            onChangeText={setNome}
                        />
                        {errors.nome && <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.nome}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>E-mail</Text>
                        <TextInput
                            style={[styles.input, errors.email && { borderColor: 'red', borderWidth: 1 }]}
                            placeholder="voce@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                        {errors.email && <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.email}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Senha</Text>
                        <TextInput
                            style={[styles.input, errors.password && { borderColor: 'red', borderWidth: 1 }]}
                            placeholder="Crie uma senha forte"
                            secureTextEntry
                            value={password}
                            onChangeText={handlePasswordChange}
                        />
                        {passwordStrength && (
                            <View style={{ marginTop: 4 }}>
                                <Text style={{ 
                                    color: passwordStrength.strength === 'Muito Forte' ? 'green' : 
                                           passwordStrength.strength === 'Forte' ? 'orange' : 'red',
                                    fontSize: 12,
                                    fontWeight: 'bold'
                                }}>
                                    Força: {passwordStrength.strength}
                                </Text>
                            </View>
                        )}
                        {errors.password && <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.password}</Text>}
                    </View>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirmar Senha</Text>
                        <TextInput
                            style={[styles.input, errors.confirmPassword && { borderColor: 'red', borderWidth: 1 }]}
                            placeholder="Repita a senha"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        {errors.confirmPassword && <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.confirmPassword}</Text>}
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                        <Text style={styles.buttonText}>Cadastrar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Já tenho uma conta</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}