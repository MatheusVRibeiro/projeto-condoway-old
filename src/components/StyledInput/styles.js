import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';

export const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.textLabel,
        marginBottom: 8,
    },
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1, // Borda padrão
        borderColor: COLORS.inputBorder,
        backgroundColor: COLORS.card,
    },
    // CORREÇÃO AQUI
    wrapperFocused: {
        borderColor: COLORS.primary,
        borderWidth: 2, // Borda mais grossa ao focar
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
    eyeIcon: {
        padding: 12,
    },
});