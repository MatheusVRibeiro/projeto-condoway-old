// UI Hooks
export { useModal, useConfirm } from './useUI';
export { useAnimation } from './useAnimation';

// Business Logic Hooks
export { useProfile } from './useProfile';
export { useCondominio } from './useCondominio';

// Pagination Hooks
export { usePaginatedOcorrencias } from './usePaginatedOcorrencias';
export { usePaginatedVisitantes } from './usePaginatedVisitantes';

// Legacy Hooks (manter compatibilidade)
export { default as useAsync } from './useAsync';
// export { default as useBiometrics } from './useBiometrics'; // removido: suporte a biometria/Face ID
export { default as useOnboardingStatus } from './useOnboardingStatus';
export { default as useTheme } from './useTheme';
export { default as useUser } from './useUser';
