import React from 'react';
import { View, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts/ThemeProvider';
import styles from './styles';

const StepProgress = ({ currentStep = 1, totalSteps = 3, steps = [] }) => {
  const { theme } = useTheme();

  const defaultSteps = [
    { label: 'Categoria', description: 'Escolha o tipo' },
    { label: 'Detalhes', description: 'Descreva o problema' },
    { label: 'Confirmação', description: 'Revisar e enviar' },
  ];

  const stepLabels = steps.length > 0 ? steps : defaultSteps;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBg, { backgroundColor: theme.colors.border }]}>
          <Animatable.View
            animation="fadeInLeft"
            duration={400}
            style={[
              styles.progressBarFill,
              {
                backgroundColor: theme.colors.primary,
                width: `${(currentStep / totalSteps) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Steps Indicators */}
      <View style={styles.stepsContainer}>
        {stepLabels.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <View key={stepNumber} style={styles.stepItem}>
              {/* Step Circle */}
              <Animatable.View
                animation={isActive ? 'pulse' : undefined}
                iterationCount="infinite"
                duration={1500}
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: isCompleted
                      ? theme.colors.primary
                      : isActive
                      ? theme.colors.primary
                      : theme.colors.background,
                    borderColor: isCompleted || isActive ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                {isCompleted ? (
                  <Check size={12} color="#ffffff" strokeWidth={3} />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      { color: isActive ? '#ffffff' : theme.colors.textSecondary },
                    ]}
                  >
                    {stepNumber}
                  </Text>
                )}
              </Animatable.View>

              {/* Step Label */}
              <View style={styles.stepTextContainer}>
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: isActive ? theme.colors.primary : theme.colors.textSecondary,
                      fontWeight: isActive ? '700' : '600',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
                {step.description && (
                  <Text
                    style={[styles.stepDescription, { color: theme.colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {step.description}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default React.memo(StepProgress);
