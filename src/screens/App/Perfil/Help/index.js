import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  ArrowLeft, 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Book,
  Headphones,
  Clock
} from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { styles } from './styles';
import { useTheme } from '../../../../contexts/ThemeProvider';

export default function Help({ navigation: navProp }) {
  const navigation = navProp || useNavigation();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqData = [
    {
      id: 1,
      question: "Como alterar minha senha?",
      answer: "Vá para Perfil > Segurança > Alterar Senha. Digite sua senha atual e a nova senha duas vezes para confirmar."
    },
    {
      id: 2,
      question: "Como fazer uma reserva de área comum?",
      answer: "Acesse a aba Reservas, escolha a área desejada, selecione data e horário disponível, e confirme a reserva."
    },
    {
      id: 3,
      question: "Como reportar um problema ou ocorrência?",
      answer: "Na aba Ocorrências, toque no botão '+' para criar um novo chamado. Descreva o problema e anexe fotos se necessário."
    },
    {
      id: 4,
      question: "Como autorizar um visitante?",
      answer: "Vá para a aba Visitantes, toque em 'Novo Visitante', preencha os dados e defina o período de autorização."
    },
    {
      id: 5,
      question: "Como visualizar documentos do condomínio?",
      answer: "Acesse Perfil > Documentos para visualizar regulamentos, atas de assembleias e outros documentos importantes."
    },
    {
      id: 6,
      question: "Como desativar notificações?",
      answer: "Vá para Perfil > Preferências > Notificações e ajuste as configurações conforme sua preferência."
    },
    {
      id: 7,
      question: "Como atualizar meus dados pessoais?",
      answer: "Acesse Perfil > Editar Perfil para atualizar nome, telefone, e-mail e outras informações pessoais."
    },
    {
      id: 8,
      question: "O que fazer se esquecer minha senha?",
      answer: "Na tela de login, toque em 'Esqueci minha senha' e siga as instruções enviadas para seu e-mail cadastrado."
    }
  ];

  const contactOptions = [
    {
      icon: Phone,
      title: "Telefone",
      subtitle: "(11) 3456-7890",
      description: "Seg a Sex, 8h às 18h",
      action: () => Linking.openURL('tel:+551134567890')
    },
    {
      icon: Mail,
      title: "E-mail",
      subtitle: "suporte@condoway.com",
      description: "Resposta em até 24h",
      action: () => Linking.openURL('mailto:suporte@condoway.com')
    },
    {
      icon: MessageCircle,
      title: "Chat Online",
      subtitle: "Suporte via chat",
      description: "Disponível 24/7",
      action: () => Alert.alert('Chat', 'Funcionalidade em desenvolvimento')
    }
  ];

  const filteredFaq = faqData.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const ContactCard = ({ option }) => (
    <TouchableOpacity style={[styles.contactCard, { borderBottomColor: theme.colors.border }]} onPress={option.action}>
      <View style={[styles.contactIcon, { backgroundColor: theme.colors.primary + '22' }]}>
        <option.icon size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.contactContent}>
        <Text style={[styles.contactTitle, { color: theme.colors.text }]}>{option.title}</Text>
        <Text style={[styles.contactSubtitle, { color: theme.colors.primary }]}>{option.subtitle}</Text>
        <Text style={[styles.contactDescription, { color: theme.colors.textSecondary }]}>{option.description}</Text>
      </View>
      <ExternalLink size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const FaqItem = ({ item }) => (
    <View style={[styles.faqItem, { borderBottomColor: theme.colors.border }]}>      
      <TouchableOpacity style={styles.faqHeader} onPress={() => toggleFaq(item.id)}>
        <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>{item.question}</Text>
        {expandedFaq === item.id ? 
          <ChevronUp size={20} color={theme.colors.primary} /> : 
          <ChevronDown size={20} color={theme.colors.textSecondary} />
        }
      </TouchableOpacity>
      {expandedFaq === item.id && (
        <Animatable.View animation="fadeInDown" duration={300} style={styles.faqAnswer}>
          <Text style={[styles.faqAnswerText, { color: theme.colors.textSecondary }]}>{item.answer}</Text>
        </Animatable.View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Animatable.View animation="fadeInDown" duration={400} style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border, shadowColor: theme.colors.shadow }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.colors.background }]}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Ajuda e Suporte</Text>
        <View style={styles.placeholder} />
      </Animatable.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200} style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <Clock size={20} color={theme.colors.success} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{'< 2h'}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Tempo médio de resposta</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <Headphones size={20} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>24/7</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Suporte disponível</Text>
          </View>
        </Animatable.View>

        {/* FAQ Search */}
        <Animatable.View animation="fadeInUp" duration={600} delay={400} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>PERGUNTAS FREQUENTES</Text>
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <View style={[styles.searchBar, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              <Search size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}                
                placeholder="Buscar nas perguntas frequentes..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>
          </View>
        </Animatable.View>

        {/* FAQ List */}
        <Animatable.View animation="fadeInUp" duration={600} delay={500} style={styles.faqContainer}>
          <View style={[styles.faqList, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            {filteredFaq.map((item, index) => (
              <Animatable.View
                key={item.id}
                animation="fadeInUp"
                duration={400}
                delay={600 + (index * 50)}
              >
                <FaqItem item={item} />
              </Animatable.View>
            ))}
          </View>
        </Animatable.View>

        

        {/* Contact Options (moved below Support Message) */}
        <Animatable.View animation="fadeInUp" duration={600} delay={300} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>ENTRE EM CONTATO</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            {contactOptions.map((option, index) => (
              <ContactCard key={index} option={option} />
            ))}
          </View>
        </Animatable.View>

        {/* Additional Resources */}
        <Animatable.View animation="fadeInUp" duration={600} delay={800} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>RECURSOS ADICIONAIS</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <TouchableOpacity style={styles.resourceItem}>
              <Book size={20} color={theme.colors.primary} />
              <Text style={[styles.resourceText, { color: theme.colors.text }]}>Manual do Usuário</Text>
              <ExternalLink size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceItem}>
              <HelpCircle size={20} color={theme.colors.primary} />
              <Text style={[styles.resourceText, { color: theme.colors.text }]}>Centro de Ajuda Online</Text>
              <ExternalLink size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animatable.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
