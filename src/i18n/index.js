import { I18n } from 'i18n-js';

const translations = {
  en: {
    welcome: 'Welcome',
    login: 'Login',
    logout: 'Logout',
    // ...
  },
  pt: {
    welcome: 'Bem-vindo',
    login: 'Entrar',
    logout: 'Sair',
    // ...
  },
};

const i18n = new I18n(translations);
i18n.locale = 'pt'; // ou detectar dinamicamente
export default i18n;
