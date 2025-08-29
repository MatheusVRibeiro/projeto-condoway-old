import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Linking, Alert } from 'react-native';
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
  Send,
  Book,
  Headphones,
  Clock
} from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { styles } from './styles';

export default function Help() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [supportMessage, setSupportMessage] = useState('');

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

  const sendSupportMessage = () => {
    if (!supportMessage.trim()) {
      Alert.alert('Erro', 'Digite sua mensagem antes de enviar.');
      return;
    }
    Alert.alert('Sucesso', 'Mensagem enviada! Nossa equipe responderá em breve.');
    setSupportMessage('');
  };

  const ContactCard = ({ option }) => (
    <TouchableOpacity style={styles.contactCard} onPress={option.action}>
      <View style={styles.contactIcon}>
        <option.icon size={24} color="#2563eb" />
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactTitle}>{option.title}</Text>
        <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
        <Text style={styles.contactDescription}>{option.description}</Text>
      </View>
      <ExternalLink size={20} color="#94a3b8" />
    </TouchableOpacity>
  );

  const FaqItem = ({ item }) => (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.faqHeader} onPress={() => toggleFaq(item.id)}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        {expandedFaq === item.id ? 
          <ChevronUp size={20} color="#2563eb" /> : 
          <ChevronDown size={20} color="#64748b" />
        }
      </TouchableOpacity>
      {expandedFaq === item.id && (
        <Animatable.View animation="fadeInDown" duration={300} style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
        </Animatable.View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animatable.View animation="fadeInDown" duration={400} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajuda e Suporte</Text>
        <View style={styles.placeholder} />
      </Animatable.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200} style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Clock size={20} color="#10b981" />
            <Text style={styles.statValue}>{'< 2h'}</Text>
            <Text style={styles.statLabel}>Tempo médio de resposta</Text>
          </View>
          <View style={styles.statCard}>
            <Headphones size={20} color="#2563eb" />
            <Text style={styles.statValue}>24/7</Text>
            <Text style={styles.statLabel}>Suporte disponível</Text>
          </View>
        </Animatable.View>

        {/* Contact Options */}
        <Animatable.View animation="fadeInUp" duration={600} delay={300} style={styles.section}>
          <Text style={styles.sectionTitle}>ENTRE EM CONTATO</Text>
          <View style={styles.sectionContent}>
            {contactOptions.map((option, index) => (
              <ContactCard key={index} option={option} />
            ))}
          </View>
        </Animatable.View>

        {/* FAQ Search */}
        <Animatable.View animation="fadeInUp" duration={600} delay={400} style={styles.section}>
          <Text style={styles.sectionTitle}>PERGUNTAS FREQUENTES</Text>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color="#64748b" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar nas perguntas frequentes..."
                placeholderTextColor="#94a3b8"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>
          </View>
        </Animatable.View>

        {/* FAQ List */}
        <Animatable.View animation="fadeInUp" duration={600} delay={500} style={styles.faqContainer}>
          <View style={styles.faqList}>
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

        {/* Support Message */}
        <Animatable.View animation="fadeInUp" duration={600} delay={700} style={styles.section}>
          <Text style={styles.sectionTitle}>ENVIE UMA MENSAGEM</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.messageLabel}>Descreva seu problema ou dúvida:</Text>
            <TextInput
              style={styles.messageInput}
              multiline
              numberOfLines={4}
              placeholder="Digite sua mensagem aqui..."
              placeholderTextColor="#94a3b8"
              value={supportMessage}
              onChangeText={setSupportMessage}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendSupportMessage}>
              <Send size={20} color="white" />
              <Text style={styles.sendButtonText}>Enviar Mensagem</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Additional Resources */}
        <Animatable.View animation="fadeInUp" duration={600} delay={800} style={styles.section}>
          <Text style={styles.sectionTitle}>RECURSOS ADICIONAIS</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.resourceItem}>
              <Book size={20} color="#2563eb" />
              <Text style={styles.resourceText}>Manual do Usuário</Text>
              <ExternalLink size={16} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceItem}>
              <HelpCircle size={20} color="#2563eb" />
              <Text style={styles.resourceText}>Centro de Ajuda Online</Text>
              <ExternalLink size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </Animatable.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
