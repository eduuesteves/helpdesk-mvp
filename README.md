# HELPDESK-MVP

Sistema de monitoramento de chamados.

## Backend 💻

- [x] Criar a pasta raiz do projeto.
- [x] Criar as pastas backend e frontend.
- [x] Executar o script SQL no seu banco PostgreSQL local para criar as tabelas.
- [x] Entrar na pasta backend e inicializar o projeto Node (npm init -y).
- [x] Instalar as dependências do Express e TypeScript.
- [x] Criar o arquivo de configuração do compilador TS (tsconfig.json).
- [x] Criar o arquivo principal do servidor (server.ts) com uma rota de teste (Health Check).
- [x] Instalar o driver do PostgreSQL (pg).
- [x] Criar o arquivo .env com a sua Connection String do banco.
- [x] Criar o arquivo de configuração do banco (database.ts).
- [x] Testar a conexão no server.ts.
- [x] Instalar a biblioteca de criptografia bcrypt.
- [x] Criar o Controller de Usuários (userController.ts).
- [x] Criar o arquivo de Rotas de Usuários (userRoutes.ts).
- [x] Registrar as rotas de usuários no arquivo principal (server.ts).
- [x] Instalar a biblioteca jsonwebtoken.
- [x] Adicionar a variável de ambiente JWT_SECRET no .env.
- [x] Criar o método de login dentro do UserController.
- [x] Adicionar a rota POST /login no arquivo routes.ts.
- [x] Criar a pasta middlewares dentro de src.
- [x] Criar o arquivo auth.ts.
- [x] Criar uma rota de teste protegida para validar o middleware.
- [x] Atualizar o arquivo routes.ts.
- [x] Criar o arquivo TicketController.ts na pasta de controllers.
- [x] Implementar a lógica de inserção de tickets associando o autor logado.
- [x] Adicionar a rota protegida POST /tickets no arquivo routes.ts.
- [x] Adicionar o método listAll no TicketController.ts.
- [x] Implementar a lógica de filtragem SQL condicional (Se ADMIN busca tudo, se EMPLOYEE busca apenas os dele).
- [x] Registrar a rota protegida GET /tickets no arquivo routes.ts.
- [x] Adicionar o método update no TicketController.ts.
- [x] Validar se o usuário logado é um ADMIN.
- [x] Validar se o novo status enviado é permitido (OPEN, IN_PROGRESS, RESOLVED).
- [x] Registrar a rota protegida PATCH /tickets/:id no arquivo routes.ts.
- [x] Criar o arquivo CommentController.ts na pasta de controllers.
- [x] Implementar a lógica para criar um comentário atrelado ao ticket e ao usuário logado.
- [x] Implementar a lógica para listar todos os comentários de um ticket específico.
- [x] Registrar as duas rotas protegidas no arquivo routes.ts.

## Frontend 🎨

- [x] Inicializar o projeto React + TypeScript usando o Vite.
- [x] Instalar o Axios para comunicação com a API.
- [x] Criar a instância base do Axios configurada para apontar para o nosso backend.
- [x] Criar o contexto de autenticação (AuthContext.tsx).
- [x] Criar uma interface visual simples para a tela de Login (Login.tsx).
- [x] Atualizar o App.tsx para gerenciar as rotas visuais baseadas no login.
- [x] Criar o arquivo Dashboard.tsx na pasta pages.
- [x] Criar a tipagem TypeScript para o objeto Ticket.
- [x] Buscar os dados da API (GET /tickets) e exibi-los em uma tabela organizada.
- [x] Atualizar o arquivo App.tsx para renderizar a página de Dashboard.
- [x] Criar o componente TicketDetails.tsx.
- [x] Implementar a busca e criação de comentários vinculados ao ticket.
- [x] Implementar a alteração de status (exclusiva para ADMIN).
- [x] Integrar o clique da linha da tabela no Dashboard.tsx para abrir esse novo componente.

## Versão 2

- [x] Instalar a biblioteca zod.
- [x] Criar a pasta schemas dentro de src.
- [x] Criar o arquivo authSchema.ts para definir as regras do Cadastro e do Login.
- [x] Atualizar o UserController.ts para validar os dados antes de executar as queries.
- [x] Configurar os scripts de compilação no package.json do Backend.
- [x] Ajustar a conexão do PostgreSQL para aceitar certificados SSL na nuvem.
- [x] Tornar a URL da API dinâmica no Frontend usando as variáveis do Vite.

## Versão 3

- [x] Criar a tabela companies.
- [x] Alterar a tabela users para incluir a coluna company_id.
- [x] Alterar a tabela tickets para incluir a coluna company_id.
- [x] Rodar o script de migração no DBeaver.
- [x] Atualizar a interface AuthenticatedRequest no middleware de autenticação.
- [x] Alterar o UserController.ts para incluir o company_id no Token JWT durante o Login.
- [x] Modificar o TicketController.ts para aplicar o filtro WHERE company_id = $1 na criação e listagem.
- [x] Criar o schema do Zod para validação do cadastro empresarial.
- [x] Implementar o método registerBusiness no UserController.ts com suporte a Transações SQL.
- [x] Registrar a rota pública /api/auth/register-business no arquivo de rotas.
- [x] Criar a rota protegida /api/users/employee no Backend.
- [x] Implementar a lógica de inserção forçando o company_id do Admin logado.
- [x] Criar o formulário visual de "Adicionar Membro da Equipa" no Frontend React (exclusivo para utilizadores ADMIN).
- [x] Criar o método listTeam no UserController.ts (filtrado por company_id).
- [x] Registar a rota protegida GET /users/team no routes.ts.
- [x] Atualizar o Dashboard.tsx no Frontend para procurar, armazenar e exibir a tabela de funcionários ativos.
- [x] Criar a coluna plan na tabela companies com valor padrão 'FREE'.
- [x] Atualizar o método create do TicketController.ts para contar chamados ativos (OPEN e IN_PROGRESS).
- [x] Barrar a criação retornando status 403 Forbidden caso o limite do plano gratuito seja atingido.
- [x] Calcular a soma de chamados ativos (OPEN + IN_PROGRESS) no componente.
- [x] Renderizar uma barra de progresso ou texto indicador acima do formulário.
- [x] Desativar o botão de criação e exibir um aviso corporativo caso o limite de 5 chamados seja atingido.
- [x] Mapear os status para nomes amigáveis em português (OPEN -> ABERTO, etc).
- [x] Modificar o método update no TicketController.ts.
- [x] Injetar o comentário automatizado do sistema atrelado ao ID do Admin que realizou a mudança.