# ✅ Implementação de Notificações Push - Concluída

## 📦 O que foi implementado no Frontend

### 1. **Configuração do App (app.json)**
- ✅ Adicionado plugin `expo-notifications`
- ✅ Configurado ícone e cor das notificações
- ✅ Configurado comportamento para Android

### 2. **Serviço de Notificações (src/lib/notifications.js)**
- ✅ `registerForPushNotificationsAsync()` - Registra dispositivo e obtém token
- ✅ `addNotificationReceivedListener()` - Escuta notificações recebidas
- ✅ `addNotificationResponseReceivedListener()` - Escuta cliques em notificações
- ✅ `scheduleLocalNotification()` - Para testes locais
- ✅ Configuração de canal para Android
- ✅ Salvamento de token no AsyncStorage

### 3. **Endpoints da API (src/services/api.js)**
- ✅ `registrarTokenPush(userId, pushToken, platform)` - POST /usuario/push-token
- ✅ `removerTokenPush(userId, pushToken)` - DELETE /usuario/push-token
- ✅ Tratamento de erros sem bloquear login/logout

### 4. **Integração no AuthContext**
- ✅ Registro automático de token ao fazer login
- ✅ Remoção automática de token ao fazer logout
- ✅ Não bloqueia autenticação se push notification falhar

### 5. **Hook Customizado (usePushNotifications)**
- ✅ Listener para notificações em foreground (mostra Toast)
- ✅ Listener para cliques em notificações
- ✅ Navegação automática baseada no tipo de notificação
- ✅ Suporte para tipos: ENCOMENDA, RESERVA, OCORRENCIA, VISITANTE, COMUNICADO
- ✅ Cleanup automático dos listeners

### 6. **Integração no App.js**
- ✅ Hook `usePushNotifications` configurado no nível raiz
- ✅ Listeners ativos em toda a aplicação

---

## 🔧 O que precisa ser implementado no Backend

### 1. **Tabela no Banco de Dados**

```sql
CREATE TABLE push_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  push_token VARCHAR(255) NOT NULL,
  platform VARCHAR(10) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
  UNIQUE KEY unique_token (usuario_id, push_token)
);
```

### 2. **Endpoints da API**

#### POST /usuario/push-token
```javascript
router.post('/usuario/push-token', async (req, res) => {
  const { userId, pushToken, platform } = req.body;
  
  try {
    await db.query(
      `INSERT INTO push_tokens (usuario_id, push_token, platform) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE platform = ?, atualizado_em = NOW()`,
      [userId, pushToken, platform, platform]
    );
    
    res.json({ 
      sucesso: true, 
      mensagem: 'Token registrado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao registrar token:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao registrar token' 
    });
  }
});
```

#### DELETE /usuario/push-token
```javascript
router.delete('/usuario/push-token', async (req, res) => {
  const { userId, pushToken } = req.body;
  
  try {
    await db.query(
      'DELETE FROM push_tokens WHERE usuario_id = ? AND push_token = ?',
      [userId, pushToken]
    );
    
    res.json({ 
      sucesso: true, 
      mensagem: 'Token removido com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao remover token:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao remover token' 
    });
  }
});
```

### 3. **Função para Enviar Notificações**

```javascript
const fetch = require('node-fetch');

/**
 * Envia notificação push para um usuário específico
 * @param {number} userId - ID do usuário
 * @param {string} titulo - Título da notificação
 * @param {string} mensagem - Corpo da notificação
 * @param {object} data - Dados adicionais para navegação
 */
async function enviarNotificacaoPush(userId, titulo, mensagem, data = {}) {
  try {
    // Buscar tokens do usuário
    const [tokens] = await db.query(
      'SELECT push_token FROM push_tokens WHERE usuario_id = ?',
      [userId]
    );

    if (tokens.length === 0) {
      console.log(`Nenhum token encontrado para usuário ${userId}`);
      return;
    }

    // Criar mensagens para cada token
    const messages = tokens.map(t => ({
      to: t.push_token,
      sound: 'default',
      title: titulo,
      body: mensagem,
      data: data,
      badge: 1,
      priority: 'high',
    }));

    // Enviar via Expo Push Service
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log('✅ Notificação enviada:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error);
    throw error;
  }
}

/**
 * Envia notificação para múltiplos usuários
 * @param {array} userIds - Array de IDs de usuários
 * @param {string} titulo - Título da notificação
 * @param {string} mensagem - Corpo da notificação
 * @param {object} data - Dados adicionais
 */
async function enviarNotificacaoEmMassa(userIds, titulo, mensagem, data = {}) {
  try {
    // Buscar todos os tokens
    const [tokens] = await db.query(
      'SELECT push_token FROM push_tokens WHERE usuario_id IN (?)',
      [userIds]
    );

    if (tokens.length === 0) {
      console.log('Nenhum token encontrado para os usuários especificados');
      return;
    }

    // Criar mensagens (máximo 100 por vez - limite do Expo)
    const messages = tokens.map(t => ({
      to: t.push_token,
      sound: 'default',
      title: titulo,
      body: mensagem,
      data: data,
      badge: 1,
      priority: 'high',
    }));

    // Dividir em chunks de 100
    const chunks = [];
    for (let i = 0; i < messages.length; i += 100) {
      chunks.push(messages.slice(i, i + 100));
    }

    // Enviar cada chunk
    const results = [];
    for (const chunk of chunks) {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });

      const result = await response.json();
      results.push(result);
    }

    console.log(`✅ Notificações enviadas para ${messages.length} dispositivos`);
    return results;
  } catch (error) {
    console.error('❌ Erro ao enviar notificações em massa:', error);
    throw error;
  }
}

module.exports = {
  enviarNotificacaoPush,
  enviarNotificacaoEmMassa,
};
```

### 4. **Integrar nos Eventos Existentes**

#### Nova Encomenda
```javascript
// Quando portaria registra nova encomenda
router.post('/encomendas', async (req, res) => {
  // ... código de criação da encomenda ...
  
  // Enviar notificação
  await enviarNotificacaoPush(
    apartamentoUserId,
    '📦 Nova Encomenda',
    'Você tem uma nova encomenda aguardando retirada',
    { 
      type: 'ENCOMENDA', 
      encomendaId: novaEncomendaId 
    }
  );
  
  res.json({ sucesso: true, dados: novaEncomenda });
});
```

#### Reserva Confirmada
```javascript
// Quando síndico aprova reserva
router.put('/reservas/:id/aprovar', async (req, res) => {
  // ... código de aprovação ...
  
  await enviarNotificacaoPush(
    usuarioId,
    '✅ Reserva Confirmada',
    `Sua reserva de ${ambiente} foi aprovada`,
    { 
      type: 'RESERVA', 
      reservaId: reservaId 
    }
  );
  
  res.json({ sucesso: true });
});
```

#### Reserva Negada
```javascript
// Quando síndico nega reserva
router.put('/reservas/:id/negar', async (req, res) => {
  const { motivo } = req.body;
  // ... código de negação ...
  
  await enviarNotificacaoPush(
    usuarioId,
    '❌ Reserva Negada',
    `Sua reserva foi negada. Motivo: ${motivo}`,
    { 
      type: 'RESERVA', 
      reservaId: reservaId 
    }
  );
  
  res.json({ sucesso: true });
});
```

#### Lembrete de Reserva
```javascript
// Agendar com cron job para rodar diariamente
async function enviarLembretesReserva() {
  // Buscar reservas confirmadas para amanhã
  const [reservas] = await db.query(`
    SELECT r.*, u.usuario_id, a.amb_nome
    FROM reservas r
    JOIN apartamentos ap ON r.apartamento_id = ap.apartamento_id
    JOIN usuarios u ON ap.apartamento_id = u.apartamento_id
    JOIN ambientes a ON r.ambiente_id = a.ambiente_id
    WHERE r.status = 'Confirmada'
    AND DATE(r.data_reserva) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
  `);

  for (const reserva of reservas) {
    await enviarNotificacaoPush(
      reserva.usuario_id,
      '⏰ Lembrete de Reserva',
      `Sua reserva de ${reserva.amb_nome} é amanhã às ${reserva.hora_inicio}`,
      { 
        type: 'RESERVA', 
        reservaId: reserva.reserva_id 
      }
    );
  }
}
```

#### Comunicado Geral
```javascript
// Enviar para todos os moradores
router.post('/comunicados', async (req, res) => {
  const { titulo, mensagem } = req.body;
  
  // Buscar todos os usuários ativos
  const [usuarios] = await db.query(
    'SELECT usuario_id FROM usuarios WHERE ativo = 1'
  );
  
  const userIds = usuarios.map(u => u.usuario_id);
  
  await enviarNotificacaoEmMassa(
    userIds,
    `📢 ${titulo}`,
    mensagem,
    { 
      type: 'COMUNICADO' 
    }
  );
  
  res.json({ sucesso: true });
});
```

---

## 🧪 Como Testar

### 1. **Teste em Dispositivo Físico**
```bash
# Rodar o app no dispositivo
npx expo start
# Escanear QR Code com Expo Go (Android) ou Camera (iOS)
```

### 2. **Obter Token**
- Faça login no app
- Verifique o console: o token será exibido
- Copie o token (formato: `ExponentPushToken[xxxxxxxxxxxxxx]`)

### 3. **Enviar Notificação de Teste**
Use o [Expo Push Notification Tool](https://expo.dev/notifications):

```json
{
  "to": "ExponentPushToken[seu-token-aqui]",
  "sound": "default",
  "title": "🧪 Teste de Notificação",
  "body": "Esta é uma notificação de teste",
  "data": {
    "type": "ENCOMENDA",
    "encomendaId": 123
  }
}
```

### 4. **Testar Navegação**
- Envie notificação com diferentes tipos
- Clique na notificação
- Verifique se navega para tela correta

### 5. **Testar via cURL**
```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[seu-token-aqui]",
    "title": "Nova Encomenda",
    "body": "Você tem uma encomenda aguardando",
    "data": {
      "type": "ENCOMENDA",
      "encomendaId": 123
    }
  }'
```

---

## 📋 Checklist Final

### Frontend (✅ Completo)
- [x] Configuração do app.json
- [x] Serviço de notificações
- [x] Endpoints na API
- [x] Integração no AuthContext
- [x] Hook customizado
- [x] Integração no App.js
- [x] Navegação por tipo

### Backend (⏳ Pendente)
- [ ] Criar tabela push_tokens
- [ ] Implementar POST /usuario/push-token
- [ ] Implementar DELETE /usuario/push-token
- [ ] Criar função enviarNotificacaoPush
- [ ] Criar função enviarNotificacaoEmMassa
- [ ] Integrar em endpoints de encomendas
- [ ] Integrar em endpoints de reservas
- [ ] Integrar em endpoints de ocorrências
- [ ] Criar sistema de lembretes (cron job)
- [ ] Implementar comunicados gerais

### Testes
- [ ] Testar registro de token no login
- [ ] Testar remoção de token no logout
- [ ] Testar notificação em foreground
- [ ] Testar notificação em background
- [ ] Testar navegação por tipo
- [ ] Testar em Android
- [ ] Testar em iOS

---

## 📚 Recursos Adicionais

- [Expo Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push Notification Tool](https://expo.dev/notifications)
- [Push Notification Best Practices](https://docs.expo.dev/push-notifications/sending-notifications/)

---

## 🎯 Próximos Passos

1. **Backend:** Implementar endpoints e função de envio
2. **Testes:** Testar em dispositivo físico
3. **Integração:** Conectar eventos do backend com envio de notificações
4. **Otimização:** Adicionar filas para envio em massa
5. **Produção:** Configurar certificados para iOS (se necessário)

**Status:** Frontend 100% implementado ✅ | Backend aguardando implementação ⏳
