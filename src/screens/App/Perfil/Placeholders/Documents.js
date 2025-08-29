import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles';
import { FileText, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const mockDocuments = [
  { id: 1, name: 'Regulamento Interno.pdf', category: 'Regras', date: '2024-01-10' },
  { id: 2, name: 'Ata Assembleia 2024.pdf', category: 'Atas', date: '2024-03-15' },
  { id: 3, name: 'Comunicado Piscina.pdf', category: 'Comunicados', date: '2024-05-01' },
];

export default function Documents() {
  const navigation = useNavigation();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={[styles.sectionContainer, { margin: 20, marginTop: 32 }]}>  
        <Text style={styles.sectionTitle}>Documentos do Condomínio</Text>
        {mockDocuments.map(doc => (
          <TouchableOpacity key={doc.id} style={styles.documentItem} onPress={() => {/* TODO: abrir visualizador de PDF */}}>
            <View style={styles.documentIcon}>
              <FileText size={20} color="#ef4444" />
            </View>
            <View style={styles.documentContent}>
              <Text style={styles.documentName}>{doc.name}</Text>
              <Text style={styles.documentCategory}>{doc.category}</Text>
            </View>
            <View style={styles.documentAction}>
              <ChevronRight size={16} color="#64748b" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
