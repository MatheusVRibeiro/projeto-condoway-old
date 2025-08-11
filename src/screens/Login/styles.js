// src/screens/Login/styles.js
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e3a8a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#4b5563',
        marginBottom: 40,
        textAlign: 'center',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16,
        borderColor: '#d1d5db',
        borderWidth: 1,
    },
    button: {
        width: '100%',
        backgroundColor: '#1e3a8a',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: 12,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#1e3a8a',
        fontWeight: '500',
    },
    signupContainer: {
        marginTop: 40,
        flexDirection: 'row',
    },
    signupText: {
        fontSize: 14,
        color: '#4b5563',
    },
    signupLink: {
        color: '#1e3a8a',
        fontWeight: 'bold',
        marginLeft: 4,
    },
});s