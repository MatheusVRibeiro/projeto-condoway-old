import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { Feather } from '@expo/vector-icons';
import { styles } from './styles';
import { COLORS } from '../../constants/theme';

export default function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Por favor, preencha todos os campos.");
            return;
        }
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        setIsLoading(false); 
        
        if (email.toLowerCase() === 'morador@condoway.com' && password === '123') {
            navigation.navigate('Home');
        } else {
            Alert.alert("Erro de Autenticação", "E-mail ou senha inválidos.");
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <View style={styles.container}>
                    <View style={styles.card}>
                        <View style={styles.header}>
                            <Image 
                                source={require('../../../assets/condoway-logo.png')} // Certifique-se que o logo existe
                                style={styles.logo} 
                            />
                            <Text style={styles.title}>Bem-vindo(a) ao</Text>
                            <Text style={styles.subtitle}>CondoWay Residence</Text>
                        </View>
                        
                        <View>
                            <Text style={styles.label}>E-mail</Text>
                            <View style={styles.inputWrapper}>
                                <Feather name="mail" size={20} color={COLORS.icon} style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="seu@email.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <View style={{ marginTop: 16 }}>
                            <Text style={styles.label}>Senha</Text>
                            <View style={styles.inputWrapper}>
                                <Feather name="lock" size={20} color={COLORS.icon} style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={COLORS.icon} style={styles.eyeIcon} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.optionsContainer}>
                            <View style={styles.checkboxContainer}>
                                <Checkbox value={rememberMe} onValueChange={setRememberMe} color={rememberMe ? COLORS.primary : undefined} />
                                <Text style={styles.checkboxLabel}>Lembrar-me</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('EsqSenha')}>
                                <Text style={styles.forgotPasswordText}>Esqueci a senha?</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#ffffff" /> : (
                                <>
                                    <Feather name="log-in" size={20} color="white" />
                                    <Text style={styles.loginButtonText}>Entrar</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}