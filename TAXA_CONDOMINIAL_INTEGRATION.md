# 💰 Integração: Taxa Condominial

## ✅ Implementação Completa

### 🎯 Objetivo
Exibir a taxa condominial do condomínio na tela "Minha Unidade" buscando o valor mais recente da tabela `gerenciamento`.

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `gerenciamento`
```sql
CREATE TABLE Gerenciamento (
    ger_id INT AUTO_INCREMENT PRIMARY KEY,
    cond_id INT NOT NULL,
    ger_data DATE,
    ger_descricao VARCHAR(60),
    ger_valor DECIMAL(10,3),
    FOREIGN KEY (cond_id) REFERENCES Condominio(cond_id)
) ENGINE=InnoDB;
```

**Campos relevantes:**
- `cond_id` - ID do condomínio (FK)
- `ger_valor` - Valor da taxa (DECIMAL)
- `ger_data` - Data do lançamento
- `ger_descricao` - Descrição (ex: "Taxa Condominial Outubro 2024")

---

## 🔧 Backend

### Query SQL Atualizada:

```sql
SELECT 
    u.user_id,
    u.user_nome,
    u.user_email,
    u.user_telefone,
    u.user_tipo,
    u.user_push_token,
    u.user_data_cadastro,
    ua.userap_id,
    a.ap_id,
    a.ap_numero,
    a.ap_andar,
    b.bloc_id,
    b.bloc_nome,
    c.cond_id,
    c.cond_nome,
    c.cond_endereco,
    c.cond_cidade,
    c.cond_estado,
    g.ger_valor as taxa_condominio,    -- ✅ NOVO
    g.ger_data as taxa_data              -- ✅ NOVO
FROM usuarios u
LEFT JOIN usuario_apartamentos ua ON u.user_id = ua.user_id
LEFT JOIN apartamentos a ON ua.ap_id = a.ap_id
LEFT JOIN bloco b ON a.bloco_id = b.bloc_id
LEFT JOIN condominio c ON b.cond_id = c.cond_id
LEFT JOIN (
    SELECT cond_id, ger_valor, ger_data
    FROM gerenciamento
    WHERE ger_descricao LIKE '%taxa%' OR ger_descricao LIKE '%condomin%'
    ORDER BY ger_data DESC
    LIMIT 1
) g ON c.cond_id = g.cond_id
WHERE u.user_id = ?
LIMIT 1;
```

### 🔍 Explicação da Subquery:

```sql
LEFT JOIN (
    SELECT cond_id, ger_valor, ger_data
    FROM gerenciamento
    WHERE ger_descricao LIKE '%taxa%' OR ger_descricao LIKE '%condomin%'
    ORDER BY ger_data DESC
    LIMIT 1
) g ON c.cond_id = g.cond_id
```

**O que faz:**
1. Busca registros em `gerenciamento` onde a descrição contém "taxa" ou "condomin"
2. Ordena por data decrescente (mais recente primeiro)
3. Pega apenas o primeiro resultado (LIMIT 1)
4. Faz LEFT JOIN com o condomínio do usuário

**Por que LEFT JOIN?**
- Se não houver taxa cadastrada, ainda retorna os outros dados
- `taxa_condominio` será `NULL` se não houver registro

---

## 🎨 Frontend

### Formatação do Valor:

```javascript
monthlyFee: profileData?.taxa_condominio 
  ? `R$ ${Number(profileData.taxa_condominio).toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`
  : 'Não informado'
```

**Exemplos de formatação:**
- `485.50` → `"R$ 485,50"`
- `1250.00` → `"R$ 1.250,00"`
- `null` → `"Não informado"`

---

## 📦 Resposta da API

### Exemplo de sucesso:

```json
{
  "sucesso": true,
  "mensagem": "Perfil do usuário carregado com sucesso.",
  "dados": {
    "user_id": 1,
    "user_nome": "João Silva",
    "user_email": "joao@example.com",
    "user_telefone": "(11) 99999-9999",
    "user_tipo": "Morador",
    "user_data_cadastro": "2023-01-15T00:00:00.000Z",
    "userap_id": 1,
    "ap_id": 101,
    "ap_numero": "101",
    "ap_andar": 10,
    "bloc_id": 1,
    "bloc_nome": "Bloco A",
    "cond_id": 1,
    "cond_nome": "Residencial Parque das Flores",
    "cond_endereco": "Rua das Flores, 123",
    "cond_cidade": "São Paulo",
    "cond_estado": "SP",
    "taxa_condominio": 485.50,           // ✅ NOVO
    "taxa_data": "2024-10-01T00:00:00.000Z"  // ✅ NOVO (opcional)
  }
}
```

### Se não houver taxa cadastrada:

```json
{
  "sucesso": true,
  "dados": {
    ...
    "taxa_condominio": null,
    "taxa_data": null
  }
}
```

**Frontend exibirá:** "Não informado"

---

## 🧪 Como Testar

### 1. Inserir taxa no banco (se não existir):

```sql
INSERT INTO gerenciamento (cond_id, ger_data, ger_descricao, ger_valor)
VALUES (1, '2024-10-01', 'Taxa Condominial Outubro 2024', 485.50);
```

### 2. Testar query no HeidiSQL:

```sql
SELECT 
    c.cond_id,
    c.cond_nome,
    g.ger_valor as taxa_condominio,
    g.ger_data as taxa_data
FROM condominio c
LEFT JOIN (
    SELECT cond_id, ger_valor, ger_data
    FROM gerenciamento
    WHERE ger_descricao LIKE '%taxa%' OR ger_descricao LIKE '%condomin%'
    ORDER BY ger_data DESC
    LIMIT 1
) g ON c.cond_id = g.cond_id
WHERE c.cond_id = 1;
```

**Resultado esperado:**
```
cond_id | cond_nome                      | taxa_condominio | taxa_data
--------|--------------------------------|-----------------|------------
1       | Residencial Parque das Flores  | 485.500         | 2024-10-01
```

### 3. Testar endpoint da API:

```bash
GET http://10.67.23.46:3333/usuario/perfil/1
```

**Verificar:**
- ✅ `taxa_condominio` presente na resposta
- ✅ Valor correto (decimal)
- ✅ `taxa_data` presente

### 4. Verificar no app:

Abrir tela "Minha Unidade" e verificar:
- ✅ Seção "INFORMAÇÕES FINANCEIRAS"
- ✅ Valor exibido como "R$ 485,50"
- ✅ Se não houver taxa, exibe "Não informado"

---

## ⚠️ Observações Importantes

### 1. **Filtro por descrição**
```sql
WHERE ger_descricao LIKE '%taxa%' OR ger_descricao LIKE '%condomin%'
```

**Certifique-se que os registros de taxa contenham:**
- "taxa" ou
- "condomin" 

na descrição.

**Exemplos válidos:**
- ✅ "Taxa Condominial"
- ✅ "Taxa de Condomínio"
- ✅ "Condomínio Outubro 2024"
- ❌ "Manutenção" (não será encontrado)

### 2. **Apenas 1 valor por condomínio**

A subquery usa `LIMIT 1`, então retorna apenas a taxa mais recente. Se você quiser mostrar a taxa específica do apartamento, seria necessário:

1. Criar tabela `taxas_apartamentos`
2. Ou adicionar campo `ap_id` em `gerenciamento`

### 3. **Performance**

O LEFT JOIN com subquery é eficiente para poucos registros. Se a tabela `gerenciamento` crescer muito, considere:

- Criar índice: `CREATE INDEX idx_ger_cond_data ON gerenciamento(cond_id, ger_data DESC)`
- Ou criar view materializada

---

## ✅ Arquivos Modificados

1. **Backend:**
   - `BACKEND_UNIT_DETAILS.md` - Instruções atualizadas

2. **Frontend:**
   - `src/screens/App/Perfil/UnitDetails/index.js` - Formatação da taxa

3. **Documentação:**
   - Este arquivo (`TAXA_CONDOMINIAL_INTEGRATION.md`)

---

## 🚀 Próximos Passos

### Melhorias futuras:

1. **Histórico de taxas:**
   - Criar tela para ver histórico completo
   - Gráfico de evolução da taxa

2. **Status de pagamento:**
   - Criar tabela `pagamentos`
   - Mostrar se está em dia ou atrasado

3. **Boletos:**
   - Gerar boletos automaticamente
   - Enviar por email/push notification

4. **Taxas por apartamento:**
   - Permitir taxas diferentes por apto (área, vagas, etc.)
   - Calcular proporcional ao tamanho

