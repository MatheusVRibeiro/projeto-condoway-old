import { StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../../constants/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: SIZES.borderRadius,
        padding: SIZES.padding,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: `${COLORS.primary}1A`, // Azul com 10% de opacidade
    },
    title: {
        fontSize: 22,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 12,
        textAlign: 'center', // Adicionado para garantir a centralização
    },
    subtitle: {
        fontSize: 15,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    // Estilos para o TextInput que usamos
    inputContainer: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
    },
    inputWrapperFocused: {
        borderColor: COLORS.primary,
    },
    icon: {
        paddingLeft: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 10,
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: COLORS.textPrimary,
    },
    button: {
        width: '100%',
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8, // Ajuste de margem
    },
    buttonText: {
        color: COLORS.card,
        fontSize: 16,
        fontFamily: FONTS.bold,
        marginLeft: 8,
    },
    backButton: {
        marginTop: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 14,
        color: COLORS.primary,
        fontFamily: FONTS.semibold,
        marginLeft: 4,
    },
    // NOVO ESTILO PARA O BOTÃO DE VOLTAR NO CARD DE SUCESSO
    successButton: {
        width: '100%',
        backgroundColor: `${COLORS.primary}1A`, // Fundo azul claro
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    successButtonText: {
        color: COLORS.primary, // Texto azul escuro
        fontSize: 16,
        fontFamily: FONTS.bold,
        marginLeft: 8,
    },
});