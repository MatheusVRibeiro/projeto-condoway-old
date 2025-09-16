import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { userProfile } from '../screens/App/Perfil/mock';

export const useProfile = () => {
  const [profile, setProfile] = useState(userProfile);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) return;
    
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true, 
      aspect: [1, 1], 
      quality: 1 
    });
    
    if (!pickerResult.canceled) {
      setProfile(p => ({ ...p, avatarUrl: pickerResult.assets[0].uri }));
    }
  };

  const getUserTypeLabel = (userType) => ({
    morador: 'Morador',
    proprietario: 'Proprietário',
    sindico: 'Síndico',
    porteiro: 'Porteiro'
  }[userType] || 'Morador');

  return {
    profile,
    handlePickImage,
    getUserTypeLabel
  };
};
