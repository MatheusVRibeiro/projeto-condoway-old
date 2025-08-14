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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: COLORS.textTitle,
    },
    subtitle: {
        fontSize: 18,
        fontFamily: FONTS.semibold,
        color: COLORS.primary,
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: COLORS.primary,
        fontFamily: FONTS.semibold,
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        // CORREÇÃO AQUI: Aumentamos a margem superior para compensar a remoção do divisor
        marginTop: 24, 
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loginButtonText: {
        color: COLORS.card,
        fontSize: 16,
        fontFamily: FONTS.bold,
        marginLeft: 8,
    },
});