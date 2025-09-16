import React from 'react';
import { View, Text } from 'react-native';
import { MapPin, Star } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import AvatarPicker from '../AvatarPicker';
import { styles } from './styles';

export default function ProfileHeader({ profile, onPickImage, theme, getUserTypeLabel }) {
  return (
    <Animatable.View animation="fadeInDown" duration={400} style={[styles.profileCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <AvatarPicker 
        source={profile.avatarUrl}
        onPress={onPickImage}
        theme={theme}
      />
      
      <View style={styles.profileInfo}>
        <Text style={[styles.profileName, { color: theme.colors.text }]}>{profile.name}</Text>
        <View style={styles.locationRow}>
          <View style={styles.locationIcon}>
            <MapPin size={14} color={theme.colors.textSecondary} />
          </View>
          <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}>{profile.apartment} - {profile.block}</Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: theme.isDark ? '#78350f33' : '#fef3c7' }]}>
          <Star size={12} color="#f59e0b" fill="#f59e0b" />
          <Text style={[styles.roleText, { color: theme.isDark ? '#fbbf24' : '#92400e' }]}>{getUserTypeLabel(profile.userType)}</Text>
        </View>
      </View>
    </Animatable.View>
  );
}
