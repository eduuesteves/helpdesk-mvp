# HELPDESK-MVP

Sistema de monitoramento de chamados.

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