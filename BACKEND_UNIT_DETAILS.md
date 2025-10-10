# 🔧 Backend - Endpoint `/usuario/perfil/:id`

## 📋 Instruções para atualizar o controller

Cole esse código no arquivo `src/controllers/Usuario.js`:

```javascript
async buscarPerfilCompleto(request, response) {
    try {
        const userId = request.params.id;

        if (!userId) {
            return response.status(400).json({
                sucesso: false,
                mensagem: 'ID do usuário não fornecido.'
            });
        }

        // Query completa com JOINS para buscar todos os dados necessários
        const sql = `
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
                g.ger_valor as taxa_condominio
            FROM usuarios u
            LEFT JOIN usuario_apartamentos ua ON u.user_id = ua.user_id
            LEFT JOIN apartamentos a ON ua.ap_id = a.ap_id
            LEFT JOIN bloco b ON a.bloco_id = b.bloc_id
            LEFT JOIN condominio c ON b.cond_id = c.cond_id
            LEFT JOIN (
                SELECT cond_id, ger_valor
                FROM gerenciamento
                WHERE ger_descricao LIKE '%taxa%' OR ger_descricao LIKE '%condomin%'
                ORDER BY ger_data DESC
                LIMIT 1
            ) g ON c.cond_id = g.cond_id
            WHERE u.user_id = ?
            LIMIT 1
        `;

        const [rows] = await bd.query(sql, [userId]);

        if (rows.length === 0) {
            return response.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado.'
            });
        }

        const perfil = rows[0];
        
        // Remove senha se existir (segurança)
        if (perfil.user_senha) delete perfil.user_senha;

        return response.status(200).json({
            sucesso: true,
            mensagem: 'Perfil do usuário carregado com sucesso.',
            dados: perfil
        });

    } catch (error) {
        console.error('❌ Erro ao buscar perfil completo:', error);
        return response.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor ao buscar perfil completo.',
            erro: error.message
        });
    }
}
```

## ⚠️ IMPORTANTE - Correção de nomes de tabelas

Baseado na estrutura do seu banco de dados:

1. **Tabelas devem estar em LOWERCASE**:
   - ✅ `usuarios` (não `Usuarios`)
   - ✅ `usuario_apartamentos` (não `Usuario_Apartamentos`)
   - ✅ `apartamentos` (não `Apartamentos`)
   - ✅ `bloco` (não `Bloco`)
   - ✅ `condominio` (não `Condominio`)

2. **FK em apartamentos**:
   - ✅ `a.bloco_id = b.bloc_id` (conforme CREATE TABLE)
   - A tabela `Apartamentos` tem FK `bloco_id` que aponta para `Bloco(bloc_id)`

3. **Campos retornados**:
   - `user_data_cadastro` - Data de cadastro do usuário
   - `cond_endereco` - Endereço do condomínio
   - `cond_cidade` - Cidade do condomínio
   - `cond_estado` - Estado do condomínio (ex: "SP")
   - `ap_numero` - Número do apartamento
   - `ap_andar` - Andar do apartamento
   - `bloc_nome` - Nome do bloco
   - `cond_nome` - Nome do condomínio
   - `taxa_condominio` - Valor da taxa condominial (decimal)

## 📦 Resposta esperada

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
    "user_push_token": "token_exemplo",
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
    "taxa_condominio": 485.50
  }
}
```

## 🧪 Como testar

### 1. Teste no HeidiSQL primeiro:

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
    g.ger_valor as taxa_condominio
FROM usuarios u
LEFT JOIN usuario_apartamentos ua ON u.user_id = ua.user_id
LEFT JOIN apartamentos a ON ua.ap_id = a.ap_id
LEFT JOIN bloco b ON a.bloco_id = b.bloc_id
LEFT JOIN condominio c ON b.cond_id = c.cond_id
LEFT JOIN (
    SELECT cond_id, ger_valor
    FROM gerenciamento
    WHERE ger_descricao LIKE '%taxa%' OR ger_descricao LIKE '%condomin%'
    ORDER BY ger_data DESC
    LIMIT 1
) g ON c.cond_id = g.cond_id
WHERE u.user_id = 1;
```

### 2. Se der erro, verifique:

- ✅ Nome correto das tabelas (lowercase vs uppercase)
- ✅ Nome da coluna FK em `apartamentos` é `bloco_id`?
- ✅ Campo `user_data_cadastro` existe na tabela `usuarios`?

### 3. Teste a API:

```bash
# No navegador ou Postman
GET http://10.67.23.46:3333/usuario/perfil/1
```

## ✅ Checklist

- [ ] Código colado no `src/controllers/Usuario.js`
- [ ] Query SQL testada no HeidiSQL sem erros
- [ ] Endpoint testado e retornando dados
- [ ] Campos `cond_endereco`, `cond_cidade`, `cond_estado`, `taxa_condominio` presentes na resposta
- [ ] Frontend atualizado (já feito! ✅)

