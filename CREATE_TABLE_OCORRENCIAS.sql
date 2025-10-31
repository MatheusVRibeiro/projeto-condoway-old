-- =====================================================
-- SCRIPT PARA CRIAR TABELA DE OCORRÊNCIAS
-- =====================================================
-- Banco de dados: condowaydb
-- Executar este script no MySQL Workbench ou via terminal
-- =====================================================

USE condowaydb;

-- Criar tabela de ocorrências
CREATE TABLE IF NOT EXISTS ocorrencias (
  oco_id INT PRIMARY KEY AUTO_INCREMENT,
  userap_id INT NOT NULL,
  oco_categoria VARCHAR(100) NOT NULL,
  oco_descricao TEXT NOT NULL,
  oco_localizacao VARCHAR(255),
  oco_prioridade ENUM('Baixa', 'Media', 'Alta') DEFAULT 'Media',
  oco_status ENUM('Aberta', 'Em Andamento', 'Resolvida', 'Fechada') DEFAULT 'Aberta',
  oco_imagem VARCHAR(500),
  oco_data_ocorrencia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  oco_data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Chave estrangeira para usuario_apartamento
  FOREIGN KEY (userap_id) REFERENCES usuario_apartamento(userap_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para melhorar performance
CREATE INDEX idx_userap_id ON ocorrencias(userap_id);
CREATE INDEX idx_status ON ocorrencias(oco_status);
CREATE INDEX idx_data ON ocorrencias(oco_data_ocorrencia);

-- Inserir dados de exemplo para teste
INSERT INTO ocorrencias (userap_id, oco_categoria, oco_descricao, oco_localizacao, oco_prioridade, oco_status) VALUES
(5, 'Vazamento', 'Vazamento no banheiro', 'Apto 101', 'Alta', 'Aberta'),
(5, 'Barulho', 'Barulho excessivo após 22h', 'Vizinho', 'Media', 'Aberta'),
(5, 'Iluminação', 'Luz do corredor queimada', 'Corredor 1º andar', 'Baixa', 'Em Andamento');

-- Verificar se os dados foram inseridos
SELECT * FROM ocorrencias;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Abra o MySQL Workbench
-- 2. Conecte-se ao servidor MySQL
-- 3. Cole este script completo
-- 4. Execute (Ctrl+Shift+Enter ou clique no botão ⚡)
-- 5. Verifique se apareceu "3 rows affected"
-- =====================================================
