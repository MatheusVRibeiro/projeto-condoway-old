import React, { useState } from 'react';
import { 
    View, 
    Text, 
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
import StyledInput from '../../../../src/components/StyledInput';


export default function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Atenção", "Por favor, preencha e-mail e senha.");
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
                            <Image source={require('../../../../assets/icon.png')} style={styles.logo} />
                            <Text style={styles.title}>Bem-vindo(a) ao</Text>
                            <Text style={styles.subtitle}>CondoWay Residence</Text>
                        </View>
                        
                        <StyledInput
                            label="E-mail"
                            iconName="mail"
                            placeholder="seu@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <StyledInput
                            label="Senha"
                            iconName="lock"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            isPassword={true}
                        />

                        <View style={styles.optionsContainer}>
                            <View style={styles.checkboxContainer}>
                                <Checkbox value={rememberMe} onValueChange={setRememberMe} color={rememberMe ? '#1976D2' : undefined} />
                                <Text style={styles.checkboxLabel}>Lembrar-me</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('EsqSenha')}>
                                <Text style={styles.forgotPasswordText}>Esqueci a senha?</Text>
                            </TouchableOpacity>
                        </View>

                        {/* A LINHA DIVISÓRIA FOI REMOVIDA DAQUI */}

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