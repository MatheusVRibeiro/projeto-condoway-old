import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { morador, avisosImportantes, encomendas, ultimasAtualizacoes } from './mock';

// Importe os ícones necessários
import { Bell, AlertTriangle, Calendar, Box, UserPlus, MessageSquareWarning } from 'lucide-react-native';

// Componente reutilizável para o card de ação rápida
const AcaoCard = ({ icon: Icon, title, badgeCount, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.actionCard}>
    {badgeCount > 0 && (
      <View style={styles.actionBadge}>
        <Text style={styles.actionBadgeText}>{badgeCount}</Text>
      </View>
    )}
    <Icon color="#2563eb" size={32} style={styles.actionCardIcon} />
    <Text style={styles.actionCardTitle}>{title}</Text>
  </TouchableOpacity>
);

export default function Dashboard() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          {/* === HEADER === */}
          <View style={[styles.header, styles.section]}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Boa noite, {morador.nome}! 👋</Text>
              <Text style={styles.subtitle}>{morador.condominio}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.notificationButton}>
                <Bell color="#4b5563" size={28} />
                {morador.notificacoesNaoLidas > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>{morador.notificacoesNaoLidas}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Image source={{ uri: morador.avatarUrl }} style={styles.avatar} />
            </View>
          </View>

          {/* === AVISOS IMPORTANTES === */}
          <View style={styles.section}>
            {/* O ideal aqui é um carrossel, mas começamos com um card simples */}
            <View style={styles.avisoCard}>
                <AlertTriangle size={20} color="#b91c1c" style={styles.avisoIcon} />
                <View style={styles.avisoTextContainer}>
                    <Text style={styles.avisoTitle}>{avisosImportantes[0].titulo}</Text>
                    <Text style={styles.avisoText}>{avisosImportantes[0].texto}</Text>
                </View>
            </View>
          </View>

          {/* === AÇÕES RÁPIDAS === */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ações Rápidas</Text>
            <View style={styles.actionsGrid}>
                <AcaoCard icon={Calendar} title="Reservar Espaço" onPress={() => navigation.navigate('Reservas')} />
                <AcaoCard icon={Box} title="Minhas Encomendas" badgeCount={encomendas.quantidade} onPress={() => navigation.navigate('Packages')} />
                <AcaoCard icon={UserPlus} title="Liberar Visitante" onPress={() => alert('Função indisponível')} />
                <AcaoCard icon={MessageSquareWarning} title="Abrir Ocorrência" onPress={() => navigation.navigate('Ocorrencias')} />
            </View>
          </View>

          {/* === ÚLTIMAS ATUALIZAÇÕES === */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Últimas Atualizações</Text>
            <View style={styles.updatesCard}>
              {Object.entries(ultimasAtualizacoes).map(([data, itens]) => (
                <View key={data} style={styles.updateGroup}>
                  <Text style={styles.updateDate}>{data}</Text>
                  {itens.map(item => {
                    const Icone = item.icone;
                    const isClickable = ['reservations', 'packages', 'notifications', 'issues', 'profile'].includes(item.tipo);
                    return (
                      <TouchableOpacity key={item.id} disabled={!isClickable} style={styles.updateItem}>
                        <View style={styles.updateIconContainer}>
                          <Icone color="#4b5563" size={20} />
                        </View>
                        <View style={styles.updateTextContainer}>
                          <Text style={styles.updateText}>{item.texto}</Text>
                        </View>
                        <Text style={styles.updateTime}>{item.hora}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}