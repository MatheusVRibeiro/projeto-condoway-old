import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';

export const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        fontSize: 14,
        color: COLORS.textLabel,
        marginBottom: 8,
        fontWeight: FONTS.medium,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBackground,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
    },
    inputWrapperFocused: {
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    icon: {
        paddingLeft: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 10,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    eyeIcon: {
        padding: 12,
    },
});