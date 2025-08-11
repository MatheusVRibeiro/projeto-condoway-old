// src/screens/Login/index.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { styles } from './styles'; // Importando os estilos

export default function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // Lógica de login temporária
        if (email === 'morador@email.com' && password === '123456') {
            Alert.alert("Login bem-sucedido!", "Redirecionando para a Home...");
            // Navegar para a tela Home (descomentar quando ela for criada)
            // navigation.navigate('Home');
        } else {
            Alert.alert("Erro no Login", "E-mail ou senha inválidos.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>CondoWay</Text>
            <Text style={styles.subtitle}>Seu condomínio, mais conectado e inteligente.</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                    style={styles.input}
                    placeholder="voce@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Senha</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Sua senha"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
            </View>

            <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('EsqSenha')}
            >
                <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Não tem uma conta?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CadUsuario')}>
                    <Text style={styles.signupLink}>Cadastre-se</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}