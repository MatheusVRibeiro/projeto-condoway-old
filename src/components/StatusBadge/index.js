import React from 'react';
import { View, Text } from 'react-native';
import { AlertCircle, CheckCircle2, UserCheck, XCircle, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeProvider';

// Sistema de status para visitantes
// Aguardando (amarelo) - Status padrão de aguardando
// Aguardando Chegada (azul) - Aprovado, mas ainda não chegou
// Presente (verde) - Check-in feito, está no condomínio
// Finalizado (cinza) - Check-out feito, saiu do condomínio
// Recusado/Cancelado (vermelho) - Aprovação negada ou cancelado

const getStatusConfig = (status) => {
  const configs = {
    'Pendente': {
      label: 'Pendente',
      color: '#F59E0B',
      gradient: ['#F59E0B', '#FBBF24'],
      icon: AlertCircle,
      textColor: '#FFFFFF'
    },
    'Aguardando': {
      label: 'Aguardando',
      color: '#F59E0B',
      gradient: ['#F59E0B', '#FBBF24'],
      icon: Clock,
      textColor: '#FFFFFF'
    },
    'Presente': {
      label: 'No Condomínio',
      color: '#10B981',
      gradient: ['#10B981', '#34D399'],
      icon: UserCheck,
      textColor: '#FFFFFF'
    },
    'Entrou': {
      label: 'No Condomínio',
      color: '#10B981',
      gradient: ['#10B981', '#34D399'],
      icon: UserCheck,
      textColor: '#FFFFFF'
    },
    'Finalizado': {
      label: 'Finalizado',
      color: '#6B7280',
      gradient: ['#6B7280', '#9CA3AF'],
      icon: CheckCircle2,
      textColor: '#FFFFFF'
    },
    'Recusado': {
      label: 'Recusado',
      color: '#EF4444',
      gradient: ['#EF4444', '#F87171'],
      icon: XCircle,
      textColor: '#FFFFFF'
    },
    'Cancelado': {
      label: 'Cancelado',
      color: '#EF4444',
      gradient: ['#EF4444', '#F87171'],
      icon: XCircle,
      textColor: '#FFFFFF'
    }
  };
  
  return configs[status] || configs['Aguardando'];
};

export default function StatusBadge({ status, style, compact = false, showIcon = true }) {
  const { theme } = useTheme();
  const config = getStatusConfig(status);
  const Icon = config.icon;

  if (compact) {
    // Versão compacta (apenas ícone com gradiente)
    return (
      <LinearGradient
        colors={config.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[{
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: config.color,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3
        }, style]}
      >
        <Icon size={16} color={config.textColor} strokeWidth={2.5} />
      </LinearGradient>
    );
  }

  // Versão completa (com texto)
  return (
    <LinearGradient
      colors={config.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 6,
        shadowColor: config.color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 3
      }, style]}
    >
      {showIcon && <Icon size={14} color={config.textColor} strokeWidth={2.5} />}
      <Text style={{
        color: config.textColor,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3
      }}>
        {config.label}
      </Text>
    </LinearGradient>
  );
}
