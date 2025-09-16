import React from 'react';
import { TouchableOpacity, Image, View } from 'react-native';
import { Camera } from 'lucide-react-native';
import { styles } from './styles';

export default function AvatarPicker({ source, onPress, theme, size = 'default' }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.avatarContainer}>
      <Image 
        source={typeof source === 'string' ? { uri: source } : source} 
        style={[
          styles.avatar, 
          size === 'large' && styles.avatarLarge,
          { borderColor: theme.colors.card }
        ]} 
      />
      <View style={[
        styles.editAvatarBadge, 
        { backgroundColor: theme.colors.primary, borderColor: theme.colors.card }
      ]}>
        <Camera size={16} color="white" />
      </View>
    </TouchableOpacity>
  );
}
