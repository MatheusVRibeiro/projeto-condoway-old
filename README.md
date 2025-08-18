# Projeto Condoway

## Descrição
Aplicativo para gestão de condomínio, com autenticação, navegação protegida, telas de ocorrências, visitantes, reservas, perfil, entre outros.

## Estrutura
- Navegação modularizada (stacks, tabs, rotas nomeadas)
- Contexto global de autenticação e toasts
- Componentes reutilizáveis (Button, SplashScreen)
- Hooks customizados (useUser)
- Temas centralizados (cores, fontes)

## Scripts
- `npm start` — inicia o projeto
- `npm test` — executa os testes

## Melhores práticas implementadas
- Persistência de sessão com AsyncStorage
- SplashScreen global enquanto carrega autenticação
- Toasts globais via contexto
- Componentes reutilizáveis e padronizados
- Separação de navegadores em arquivos próprios
- Centralização de nomes de rotas
- Hooks customizados para acesso ao usuário
- Padronização de estilos via theme.js
- Estrutura pronta para testes automatizados
- Lazy loading de telas (pronto para expandir)
- Comentários e documentação nos arquivos principais

## Como rodar
1. Instale as dependências: `npm install`
2. Inicie o app: `npm start`

## Licença
MIT
