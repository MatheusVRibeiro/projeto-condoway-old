import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Seção de Tema
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 32,
    lineHeight: 20,
  },
  
  themeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  
  themeOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    position: 'relative',
    minHeight: 80,
    justifyContent: 'center',
  },
  
  themeOptionText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Estilos complementares que podem ser usados se necessário
  
  // Animações customizadas
  fadeIn: {
    from: {
      opacity: 0,
      translateY: 20,
    },
    to: {
      opacity: 1,
      translateY: 0,
    },
  },
  
  slideInRight: {
    from: {
      opacity: 0,
      translateX: 50,
    },
    to: {
      opacity: 1,
      translateX: 0,
    },
  },
  
  // Estados especiais
  pressedItem: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
  
  // Variações de layout
  compactMode: {
    paddingVertical: 12,
  },
  
  expandedMode: {
    paddingVertical: 20,
  },
  
  // Indicadores visuais
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  
  activeIndicator: {
    backgroundColor: '#10b981',
  },
  
  inactiveIndicator: {
    backgroundColor: '#ef4444',
  },
  
  // Helpers para responsividade
  mobileLayout: {
    paddingHorizontal: 16,
  },
  
  tabletLayout: {
    paddingHorizontal: 32,
    maxWidth: 600,
    alignSelf: 'center',
  },
});
