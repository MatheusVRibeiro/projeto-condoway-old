import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../contexts/ThemeProvider';
import { styles } from './styles';
import { categories, initialIssues } from './mock';
import { MessageSquareWarning, ArrowLeft, CheckCircle } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import BackButton from '../../../components/BackButton';

export default function Ocorrencias() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('registrar');
  const [myIssues, setMyIssues] = useState(initialIssues);
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('media');
  const [expandedId, setExpandedId] = useState(null);

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setStep(2);
  };

  const resetForm = () => {
    setStep(1);
    setCategory(null);
    setDescription('');
    setLocation('');
    setPriority('media');
  };

  const handleSubmit = () => {
    if (!description || !location) {
      Toast.show({ type: 'error', text1: 'Preencha todos os campos' });
      return;
    }
    const newIssue = {
      id: Date.now(),
      protocol: `OCO-${Date.now().toString().slice(-6)}`,
      category: category.title,
      title: category.title,
      description, location,
      date: new Date().toLocaleString('pt-BR'),
      status: "Enviada",
      priority,
      comments: [{ author: "Morador", text: description, date: new Date().toLocaleString('pt-BR') }]
    };
    setMyIssues(prev => [newIssue, ...prev]);
    setStep(3);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Em Análise': return { backgroundColor: '#fef9c3', color: '#a16207' };
      case 'Resolvida': return { backgroundColor: '#dcfce7', color: '#166534' };
      default: return { backgroundColor: '#dbeafe', color: '#1e40af' };
    }
  };

  const renderRegisterContent = () => {
    if (step === 1) {
      return (
        <View style={styles.categoryGrid}>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat.id} 
              style={[styles.categoryCard, { backgroundColor: theme.colors.card }]} 
              onPress={() => handleCategorySelect(cat)}
            >
              <cat.icon color={theme.colors.primary} size={32} />
              <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (step === 2) {
      return (
        <View>
          <TouchableOpacity onPress={resetForm} style={styles.formHeader}>
            <ArrowLeft color={theme.colors.text} size={20} />
            <Text style={{marginLeft: 8, color: theme.colors.text}}>Voltar</Text>
          </TouchableOpacity>
          <Text style={[styles.formTitle, { color: theme.colors.text }]}>Detalhes da Ocorrência</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Descreva o problema</Text>
            <TextInput
              style={[styles.input, styles.textarea, { 
                backgroundColor: theme.colors.card, 
                color: theme.colors.text,
                borderColor: theme.colors.border 
              }]}
              placeholder="Descreva com o máximo de detalhes o que está acontecendo..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Local Específico</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.card, 
                color: theme.colors.text,
                borderColor: theme.colors.border 
              }]}
              placeholder="Ex: Piscina, Garagem Bloco B..."
              placeholderTextColor={theme.colors.textSecondary}
              value={location}
              onChangeText={setLocation}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Prioridade</Text>
            <View style={styles.radioGroup}>
              {['baixa', 'media', 'alta'].map(p => (
                <TouchableOpacity key={p} style={styles.radioButton} onPress={() => setPriority(p)}>
                  <View style={[styles.radioCircle, { borderColor: theme.colors.border }]}>
                    {priority === p && <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} />}
                  </View>
                  <Text style={[styles.radioLabel, { color: theme.colors.text }]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.colors.primary }]} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Enviar Ocorrência</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (step === 3) {
      return (
        <View style={styles.confirmationContainer}>
          <CheckCircle color="#22c55e" size={64} />
          <Text style={[styles.confirmationTitle, { color: theme.colors.text }]}>Ocorrência Enviada!</Text>
          <Text style={[styles.confirmationText, { color: theme.colors.textSecondary }]}>
            O síndico foi notificado. Você pode acompanhar o andamento na aba "Minhas Ocorrências".
          </Text>
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: theme.colors.primary }]} 
            onPress={() => { resetForm(); setActiveTab('minhas'); }}
          >
            <Text style={styles.submitButtonText}>Ver Minhas Ocorrências</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderMyIssues = () => (
    <View>
      {myIssues.map(issue => {
        const statusStyle = getStatusStyle(issue.status);
        const isExpanded = expandedId === issue.id;

        return (
          <View key={issue.id} style={[styles.accordionItem, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity 
              style={styles.accordionTrigger} 
              onPress={() => setExpandedId(isExpanded ? null : issue.id)}
            >
              <View style={styles.triggerLeft}>
                <Text style={[styles.accordionTitle, { color: theme.colors.text }]}>{issue.title}</Text>
                <Text style={[styles.accordionSubtitle, { color: theme.colors.textSecondary }]}>
                  Protocolo: {issue.protocol}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>{issue.status}</Text>
              </View>
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.accordionContent}>
                {issue.comments.map((comment, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.commentBubble, 
                      comment.author === 'Morador' ? 
                        [styles.moradorBubble, { backgroundColor: theme.colors.primary + '20' }] : 
                        [styles.sindicoBubble, { backgroundColor: theme.colors.card }]
                    ]}
                  >
                    <Text style={[
                      comment.author === 'Morador' ? styles.moradorText : styles.sindicoText,
                      { color: theme.colors.text }
                    ]}>
                      {comment.text}
                    </Text>
                    <Text style={[styles.commentDate, { color: theme.colors.textSecondary }]}>
                      {comment.date}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.content}>
          <BackButton style={{ alignSelf: 'flex-start' }} />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              <MessageSquareWarning color={theme.colors.primary} size={28} />
              <Text style={[styles.headerTitleText, { color: theme.colors.text }]}>Ocorrências</Text>
            </Text>
          </View>

          {step === 1 && (
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton, 
                  { borderColor: theme.colors.border },
                  activeTab === 'registrar' && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setActiveTab('registrar')}
              >
                <Text style={[
                  styles.tabText, 
                  { color: activeTab === 'registrar' ? '#ffffff' : theme.colors.text }
                ]}>
                  Registrar Nova
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  { borderColor: theme.colors.border },
                  activeTab === 'minhas' && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setActiveTab('minhas')}
              >
                <Text style={[
                  styles.tabText,
                  { color: activeTab === 'minhas' ? '#ffffff' : theme.colors.text }
                ]}>
                  Minhas Ocorrências
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.tabContent}>
            {activeTab === 'registrar' ? renderRegisterContent() : renderMyIssues()}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
