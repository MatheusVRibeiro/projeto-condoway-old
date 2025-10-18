# 🔔 Guia de Implementação de Notificações Push

## 📋 O que é necessário

### 1. **Configuração do App (app.json)**
- Adicionar plugins de notificação
- Configurar permissões para Android e iOS
- Definir ícones e sons de notificação

### 2. **Backend (API)**
- Endpoint para registrar token do dispositivo
- Endpoint para enviar notificações
- Sistema de filas para envio em massa

### 3. **Frontend (React Native)**
- Solicitar permissões ao usuário
- Registrar token no backend
- Escutar notificações em foreground/background
- Navegar para tela específica ao clicar

### 4. **Servidor de Notificações (Expo Push Service)**
- Usar o serviço gratuito do Expo
- OU configurar Firebase Cloud Messaging (FCM)

---

## 🛠️ Implementação Passo a Passo

### **PASSO 1: Configurar app.json**

Adicione as permissões e plugins necessários:

```json
{
  "expo": {
    "plugins": [
      "expo-font",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#3b82f6",
          "sounds": ["./assets/notification-sound.wav"],
          "mode": "production"
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#3b82f6",
      "androidMode": "default",
      "androidCollapsedTitle": "#{unread_notifications} novas notificações"
    }
  }
}
```

### **PASSO 2: Melhorar o serviço de notificações**

Já existe `src/lib/notifications.js`, vamos melhorá-lo:

```javascript
// Adicionar função para enviar token ao backend
export async function sendPushTokenToBackend(userId, token) {
  try {
    await apiService.registrarTokenPush(userId, token);
    console.log('✅ Token registrado no backend:', token);
  } catch (error) {
    console.error('❌ Erro ao registrar token:', error);
  }
}

// Adicionar listener para notificações recebidas
export function addNotificationReceivedListener(callback) {
  return Notifications.addNotificationReceivedListener(callback);
}

// Adicionar listener para quando usuário clica na notificação
export function addNotificationResponseReceivedListener(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
```

### **PASSO 3: Adicionar endpoints na API**

Em `src/services/api.js`:

```javascript
// Registrar token de push notification
registrarTokenPush: async (userId, pushToken) => {
  const response = await api.post('/usuario/push-token', {
    userId,
    pushToken,
    platform: Platform.OS,
  });
  return response.data;
},

// Remover token (quando usuário faz logout)
removerTokenPush: async (userId, pushToken) => {
  const response = await api.delete('/usuario/push-token', {
    data: { userId, pushToken }
  });
  return response.data;
},
```

### **PASSO 4: Integrar no AuthContext**

Registrar token ao fazer login e remover ao fazer logout:

```javascript
import { registerForPushNotificationsAsync, sendPushTokenToBackend } from '../lib/notifications';

// No login, após autenticação bem-sucedida:
const pushToken = await registerForPushNotificationsAsync();
if (pushToken) {
  await sendPushTokenToBackend(userData.usuario_id, pushToken);
}

// No logout:
const pushToken = await AsyncStorage.getItem('pushToken');
if (pushToken) {
  await apiService.removerTokenPush(user.usuario_id, pushToken);
  await AsyncStorage.removeItem('pushToken');
}
```

### **PASSO 5: Configurar listeners no App.js**

Escutar notificações e navegar para telas específicas:

```javascript
import * as Notifications from 'expo-notifications';
import { useRef, useEffect } from 'react';

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Quando recebe notificação com app aberto
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notificação recebida:', notification);
      // Atualizar badge, mostrar toast, etc
    });

    // Quando usuário clica na notificação
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('👆 Usuário clicou na notificação:', data);
      
      // Navegar para tela específica baseado no tipo
      if (data.type === 'ENCOMENDA') {
        navigation.navigate('Encomendas');
      } else if (data.type === 'RESERVA') {
        navigation.navigate('Reservas');
      } else if (data.type === 'OCORRENCIA') {
        navigation.navigate('Ocorrencias');
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    // ... resto do app
  );
}
```

---

## 🔧 Backend - O que precisa implementar

### **1. Tabela no Banco de Dados**

```sql
CREATE TABLE push_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  push_token VARCHAR(255) NOT NULL,
  platform VARCHAR(10) NOT NULL, -- 'ios' ou 'android'
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id),
  UNIQUE KEY unique_token (usuario_id, push_token)
);
```

### **2. Endpoint para Registrar Token**

```javascript
// POST /usuario/push-token
router.post('/usuario/push-token', async (req, res) => {
  const { userId, pushToken, platform } = req.body;
  
  try {
    await db.query(
      'INSERT INTO push_tokens (usuario_id, push_token, platform) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE platform = ?',
      [userId, pushToken, platform, platform]
    );
    res.json({ sucesso: true });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao registrar token' });
  }
});
```

### **3. Função para Enviar Notificação via Expo**

```javascript
const fetch = require('node-fetch');

async function enviarNotificacaoPush(userId, titulo, mensagem, data = {}) {
  // Buscar tokens do usuário
  const tokens = await db.query(
    'SELECT push_token FROM push_tokens WHERE usuario_id = ?',
    [userId]
  );

  const messages = tokens.map(t => ({
    to: t.push_token,
    sound: 'default',
    title: titulo,
    body: mensagem,
    data: data,
  }));

  // Enviar via Expo Push Service
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });
}

// Exemplo de uso:
// Nova encomenda chegou
await enviarNotificacaoPush(
  usuarioId,
  '📦 Nova Encomenda',
  'Você tem uma nova encomenda aguardando retirada',
  { type: 'ENCOMENDA', encomendaId: 123 }
);
```

---

## 🎯 Casos de Uso - Quando Enviar Notificações

1. **📦 Nova Encomenda**
   - Quando portaria registra nova encomenda
   - Notificar morador imediatamente

2. **✅ Reserva Confirmada**
   - Quando síndico aprova reserva
   - Notificar morador sobre confirmação

3. **❌ Reserva Negada**
   - Quando síndico nega reserva
   - Notificar morador sobre negação

4. **⏰ Lembrete de Reserva**
   - 1 dia antes da reserva confirmada
   - Notificar morador para não esquecer

5. **🔔 Nova Ocorrência (Síndico)**
   - Quando morador registra ocorrência
   - Notificar síndico/administração

6. **💬 Resposta em Ocorrência**
   - Quando administração responde ocorrência
   - Notificar morador que abriu

7. **📢 Comunicado Importante**
   - Avisos gerais do condomínio
   - Notificar todos os moradores

8. **👤 Visitante Autorizado**
   - Quando portaria libera visitante
   - Notificar morador que autorizou

---

## ✅ Checklist de Implementação

- [ ] Atualizar `app.json` com configurações de notificação
- [ ] Melhorar `src/lib/notifications.js` com novos listeners
- [ ] Adicionar endpoints na API (`registrarTokenPush`, `removerTokenPush`)
- [ ] Integrar registro de token no `AuthContext` (login/logout)
- [ ] Configurar listeners no `App.js` para navegação
- [ ] Criar tabela `push_tokens` no banco de dados
- [ ] Implementar função `enviarNotificacaoPush` no backend
- [ ] Testar em dispositivo físico (Android e iOS)
- [ ] Adicionar notificações nos eventos (encomenda, reserva, etc)
- [ ] Implementar sistema de preferências de notificação

---

## 🧪 Como Testar

1. **Obter token:**
   - Execute o app em dispositivo físico
   - Faça login
   - Veja o token no console

2. **Enviar notificação de teste:**
   - Use o [Expo Push Notification Tool](https://expo.dev/notifications)
   - Cole o token obtido
   - Envie uma notificação de teste

3. **Testar navegação:**
   - Envie notificação com `data: { type: 'ENCOMENDA' }`
   - Clique na notificação
   - Verifique se navega para tela correta

---

## 📚 Recursos Úteis

- [Expo Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push Notification Tool](https://expo.dev/notifications)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

---

**Pronto para começar?** Me avise qual passo você quer que eu implemente primeiro! 🚀
