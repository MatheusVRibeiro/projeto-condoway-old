import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, FileText, Download, Eye, Search, Filter, Calendar, Folder } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { styles } from './styles';
import { userProfile } from '../mock';
import { useTheme } from '../../../../contexts/ThemeProvider';

export default function Documents() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [documents] = useState([
    ...userProfile.documents,
    { id: 5, name: "Convenção do Condomínio.pdf", category: "Regras do Condomínio", date: "2024-01-15", size: "2.5 MB" },
    { id: 6, name: "Regulamento da Piscina.pdf", category: "Regras do Condomínio", date: "2024-02-10", size: "1.2 MB" },
    { id: 7, name: "Ata Assembleia Março.pdf", category: "Assembleias", date: "2024-03-15", size: "3.1 MB" },
    { id: 8, name: "Protocolo de Emergência.pdf", category: "Segurança", date: "2024-01-20", size: "1.8 MB" },
    { id: 9, name: "Manual de Mudança.pdf", category: "Orientações", date: "2024-02-05", size: "2.2 MB" },
    { id: 10, name: "Formulário de Autorização.pdf", category: "Formulários", date: "2024-03-01", size: "0.8 MB" }
  ]);

  const categories = [
    { key: 'all', label: 'Todos', count: documents.length },
    { key: 'Regras do Condomínio', label: 'Regras', count: documents.filter(d => d.category === 'Regras do Condomínio').length },
    { key: 'Assembleias', label: 'Assembleias', count: documents.filter(d => d.category === 'Assembleias').length },
    { key: 'Orientações', label: 'Orientações', count: documents.filter(d => d.category === 'Orientações').length },
    { key: 'Segurança', label: 'Segurança', count: documents.filter(d => d.category === 'Segurança').length },
    { key: 'Formulários', label: 'Formulários', count: documents.filter(d => d.category === 'Formulários').length }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (document) => {
    Alert.alert(
      'Download',
      `Baixar ${document.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Baixar', onPress: () => Alert.alert('Sucesso', 'Download iniciado!') }
      ]
    );
  };

  const handleView = (document) => {
    Alert.alert('Visualizar', `Abrindo ${document.name}...`);
  };

  const CategoryFilter = ({ category, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.categoryFilter, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, isSelected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
      onPress={onPress}
    >
      <Text style={[styles.categoryFilterText, { color: theme.colors.textSecondary }, isSelected && { color: '#fff' }]}>
        {category.label}
      </Text>
      <View style={[styles.categoryCount, { backgroundColor: theme.colors.background }, isSelected && { backgroundColor: theme.colors.primary + '33' }]}>
        <Text style={[styles.categoryCountText, { color: theme.colors.textSecondary }, isSelected && { color: '#fff' }]}>
          {category.count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const DocumentItem = ({ document }) => {
    const getIconColor = (category) => {
      switch (category) {
        case 'Regras do Condomínio': return theme.colors.primary;
        case 'Assembleias': return theme.colors.success;
        case 'Orientações': return '#7c3aed';
        case 'Segurança': return theme.colors.error;
        case 'Formulários': return '#ea580c';
        default: return theme.colors.textSecondary;
      }
    };

    const getIconBg = (category) => {
      const base = theme.colors.primary + '22';
      switch (category) {
        case 'Regras do Condomínio': return theme.colors.primary + '22';
        case 'Assembleias': return theme.colors.success + '22';
        case 'Orientações': return '#7c3aed22';
        case 'Segurança': return theme.colors.error + '22';
        case 'Formulários': return '#ea580c22';
        default: return theme.colors.background;
      }
    };

    return (
      <View style={[styles.documentItem, { borderBottomColor: theme.colors.border }]}>
        <View style={[styles.documentIcon, { backgroundColor: getIconBg(document.category) }]}>
          <FileText size={24} color={getIconColor(document.category)} />
        </View>
        
        <View style={styles.documentContent}>
          <Text style={[styles.documentName, { color: theme.colors.text }]}>{document.name}</Text>
          <Text style={[styles.documentCategory, { color: theme.colors.primary }]}>{document.category}</Text>
          <View style={styles.documentMeta}>
            <Text style={[styles.documentDate, { color: theme.colors.textSecondary }]}>{document.date}</Text>
            <Text style={[styles.documentSize, { color: theme.colors.textSecondary }]}>{document.size}</Text>
          </View>
        </View>
        
        <View style={styles.documentActions}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]} onPress={() => handleView(document)}>
            <Eye size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]} onPress={() => handleDownload(document)}>
            <Download size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Animatable.View animation="fadeInDown" duration={400} style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border, shadowColor: theme.colors.shadow }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.colors.background }]}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Documentos</Text>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: theme.colors.primary + '22' }]}>
          <Filter size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </Animatable.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200} style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, shadowColor: theme.colors.shadow }]}>
            <Search size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}            
              placeholder="Buscar documentos..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
        </Animatable.View>

        {/* Category Filters */}
        <Animatable.View animation="fadeInUp" duration={600} delay={300} style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {categories.map((category) => (
              <CategoryFilter
                key={category.key}
                category={category}
                isSelected={selectedCategory === category.key}
                onPress={() => setSelectedCategory(category.key)}
              />
            ))}
          </ScrollView>
        </Animatable.View>

        {/* Documents List */}
        <Animatable.View animation="fadeInUp" duration={600} delay={400} style={styles.documentsContainer}>
          <View style={styles.documentsHeader}>
            <Text style={[styles.documentsTitle, { color: theme.colors.text }]}>
              {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''} encontrado{filteredDocuments.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <View style={[styles.documentsList, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            {filteredDocuments.map((document, index) => (
              <Animatable.View
                key={document.id}
                animation="fadeInUp"
                duration={400}
                delay={500 + (index * 50)}
              >
                <DocumentItem document={document} />
              </Animatable.View>
            ))}
          </View>
        </Animatable.View>

        {/* No Results */}
        {filteredDocuments.length === 0 && (
          <Animatable.View animation="fadeInUp" duration={600} delay={500} style={styles.noResultsContainer}>
            <Folder size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.noResultsTitle, { color: theme.colors.text }]}>Nenhum documento encontrado</Text>
            <Text style={[styles.noResultsText, { color: theme.colors.textSecondary }]}>
              {searchTerm ? 'Tente alterar os termos de busca' : 'Não há documentos nesta categoria'}
            </Text>
          </Animatable.View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
