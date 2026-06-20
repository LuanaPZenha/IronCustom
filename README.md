# Iron Custom — Sistema de Gestão para Oficina de Motos Custom

Frontend React da **Iron Custom**, oficina mecânica especializada em motos custom. A aplicação cobre o ciclo completo da operação: ordens de serviço, CRM, estoque, projetos de customização, financeiro e gestão de usuários.

**Repositório (frontend):** [https://github.com/LuanaPZenha/IronCustom](https://github.com/LuanaPZenha/IronCustom)

> Este repositório contém **apenas o frontend**. Toda a lógica de negócio, autenticação e persistência fica no backend [**API Dual Persistence**](https://github.com/LuanaPZenha/ApiDualPersistence) — repositório local `api-dual-persistence`, referenciado pelo `docker-compose.yml`.

### Relação com a API Dual Persistence

O Iron Custom **consome exclusivamente** a [API Dual Persistence](https://github.com/LuanaPZenha/ApiDualPersistence): uma API REST Node.js/Express com **persistência híbrida** (PostgreSQL para usuários e autenticação JWT; MongoDB para clientes, veículos, peças, ordens de serviço e projetos).

| Camada | Responsabilidade |
|--------|------------------|
| **Frontend (este repo)** | Interface React, roteamento, formulários, Kanban, PDF, toasts |
| **API Dual Persistence** | Endpoints REST, validação, regras de negócio, JWT, acesso aos bancos |

Chamadas HTTP partem de `src/services/` via Axios (`VITE_API_URL`, padrão `/api`), com proxy em dev (Vite) e em produção (Nginx) para o backend. Documentação interativa: **http://localhost:3000/api-docs** (Swagger).

### Subir a aplicação completa com Docker

Passos mínimos para subir **frontend + backend + PostgreSQL + MongoDB** de uma vez:

```bash
# 1. Clone os dois repositórios lado a lado
git clone https://github.com/LuanaPZenha/IronCustom.git oficina-motos-frontend
git clone https://github.com/LuanaPZenha/ApiDualPersistence.git api-dual-persistence

# 2. Configure o backend
cd api-dual-persistence
cp .env.example .env

# 3. Suba tudo a partir do frontend
cd ../oficina-motos-frontend
cp .env.example .env
docker compose up --build
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/api-docs |

Login padrão: `admin@example.com` / `Admin1234`

---

## Índice

1. [O que foi construído](#o-que-foi-construído)
2. [Stack tecnológica](#stack-tecnológica)
3. [Arquitetura e estrutura de pastas](#arquitetura-e-estrutura-de-pastas)
4. [Módulos da aplicação](#módulos-da-aplicação)
5. [Autenticação e permissões](#autenticação-e-permissões)
6. [Identidade visual e imagens](#identidade-visual-e-imagens)
7. [Integração com a API Dual Persistence](#integração-com-a-api-dual-persistence)
8. [Como executar](#como-executar)
9. [Variáveis de ambiente](#variáveis-de-ambiente)
10. [Docker e portas](#docker-e-portas)
11. [Scripts auxiliares](#scripts-auxiliares)
12. [Dados de demonstração](#dados-de-demonstração)
13. [Histórico de commits](#histórico-de-commits)

---

## O que foi construído

Sistema web completo para operação de uma oficina de motos custom, com:

| Área | Entregue |
|------|----------|
| **Autenticação JWT** | Login, sessão persistente, logout automático em 401 |
| **Dashboard** | Resumo operacional, alertas de estoque, atalhos para módulos |
| **Ordens de Serviço** | Kanban 6 colunas, orçamentos, conversão, checklist, fotos, PDF, WhatsApp |
| **CRM** | Clientes, múltiplas motos por cliente, histórico por placa, busca |
| **Estoque** | Peças com SKU, custo/venda, margem, alerta de estoque mínimo |
| **Projetos Custom** | Etapas passo a passo, moodboard de referências, status |
| **Financeiro** | Pagamentos, comissões de mecânicos, filtros por período |
| **Usuários** | CRUD restrito a admin (PostgreSQL no backend) |
| **UI/UX** | Tema escuro industrial, animações, imagens temáticas de motos |
| **Docker** | Ambiente dev (Vite + hot reload) e prod (Nginx) com backend e bancos |

---

## Stack tecnológica

| Camada | Tecnologia |
|--------|------------|
| Framework | React 18 |
| Build | Vite 6 |
| Estilo | Tailwind CSS 3 |
| Roteamento | React Router DOM 6 |
| HTTP | Axios (interceptors JWT) |
| PDF | jsPDF |
| Container | Docker + Docker Compose |
| Backend (externo) | [API Dual Persistence](https://github.com/LuanaPZenha/ApiDualPersistence) — Node.js + Express |
| Bancos (externo) | PostgreSQL (usuários) + MongoDB (dados da oficina) |

---

## Arquitetura e estrutura de pastas

```
oficina-motos-frontend/
├── public/
│   ├── images/
│   │   ├── cards/          # 24 imagens (01.jpg … 24.jpg) — cards principais
│   │   └── heroes/         # Banners por módulo (login, dashboard, etc.)
│   └── vite.svg
├── scripts/
│   └── download-moto-images.ps1   # Baixa imagens temáticas do Unsplash
├── src/
│   ├── components/         # UI reutilizável
│   │   ├── Button.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── ImageCard.jsx         # Card com imagem de fundo + overlay
│   │   ├── Input.jsx
│   │   ├── Layout.jsx            # Shell: sidebar + header + conteúdo
│   │   ├── Modal.jsx
│   │   ├── OrderFormModal.jsx    # Formulário completo de OS/orçamento
│   │   ├── PageHero.jsx          # Banner no topo de cada módulo
│   │   ├── Select.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Textarea.jsx
│   │   ├── ToastContainer.jsx
│   │   └── WorkshopBackground.jsx # Fundo animado (login)
│   ├── contexts/
│   │   ├── AuthContext.jsx       # Sessão, login, logout, isAdmin
│   │   └── ToastContext.jsx      # Notificações toast
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ServiceOrders.jsx     # Kanban + orçamentos
│   │   ├── Clients.jsx           # CRM
│   │   ├── Inventory.jsx         # Estoque de peças
│   │   ├── Projects.jsx          # Projetos custom
│   │   ├── Finance.jsx           # Financeiro
│   │   ├── Users.jsx             # Admin only
│   │   └── Items.jsx             # Legado (redireciona para /estoque)
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   └── PrivateRoute.jsx      # Guarda rotas + adminOnly
│   ├── services/                 # Camada de API (axios isolado)
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── clientService.js
│   │   ├── dashboardService.js
│   │   ├── itemService.js
│   │   ├── partService.js
│   │   ├── projectService.js
│   │   ├── serviceOrderService.js
│   │   ├── userService.js
│   │   └── vehicleService.js
│   ├── utils/
│   │   ├── constants.js          # Status OS, pagamentos, formatação
│   │   ├── pdf.js                # Geração de PDF de OS/orçamento
│   │   ├── theme.js              # Mapa de imagens locais
│   │   └── whatsapp.js           # Mensagem formatada + link wa.me
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                 # Estilos globais, animações, .card
├── docker-compose.yml            # Frontend + backend + postgres + mongo
├── Dockerfile                    # Estágios: development, build, production
├── nginx.conf                    # SPA + proxy /api em produção
├── vite.config.js                # Proxy dev /api → backend
├── tailwind.config.js            # Paleta workshop (laranja #ea580c)
├── .env.example
└── package.json
```

### Fluxo de dados

```
Browser → React (Vite/Nginx) → proxy /api → [API Dual Persistence](https://github.com/LuanaPZenha/ApiDualPersistence)
                                              ├── PostgreSQL (users, auth)
                                              └── MongoDB (clientes, veículos, peças, OS, projetos)
```

---

## Módulos da aplicação

### Login (`/login`)

- Tela cinematográfica com `WorkshopBackground` e card do formulário em `ImageCard`
- Autenticação via `POST /api/auth/login`
- Token JWT salvo em `localStorage` (`oficina_token`)
- Redireciona para `/dashboard` se já autenticado

### Dashboard (`/dashboard`)

- **PageHero** com imagem do módulo
- **4 cards de estatísticas** (com imagem): OS abertas, clientes, projetos ativos, OS não pagas
- **Alerta de estoque baixo** quando peças estão abaixo do mínimo
- **OS por status** — contagem por coluna do kanban
- **OS recentes** — últimas ordens cadastradas
- **Atalhos de navegação** — cards com imagem para cada módulo (Usuários só para admin)

### Ordens de Serviço (`/ordens-servico`)

Coração operacional da oficina.

**Kanban — 6 status:**

| Status (API) | Label |
|--------------|-------|
| `awaiting_evaluation` | Aguardando Avaliação |
| `awaiting_approval` | Aguardando Aprovação |
| `in_progress` | Em Andamento |
| `awaiting_part` | Aguardando Peça |
| `completed` | Concluído |
| `delivered` | Entregue |

**Funcionalidades:**

- Criar **orçamento** ou **OS** diretamente
- Seção de **orçamentos pendentes** com botão "Aprovar → OS"
- **Kanban horizontal** com scroll; cards de OS **sem imagem** (dados only)
- **Modal de detalhe**: alterar status, ver itens, avarias, fotos
- **Editar**, **PDF** (jsPDF), **WhatsApp** (mensagem formatada), **Converter em OS**, **Excluir**
- Formulário (`OrderFormModal`) com abas:
  - **Geral** — cliente, veículo, mecânico, mão de obra, comissão
  - **Itens** — peças do estoque + serviços avulsos
  - **Checklist** — combustível, km, avarias, observações
  - **Fotos** — upload em base64
  - **Pagamento** — método, parcelas, pago/não pago

### Clientes & Motos (`/clientes`)

- CRUD de **clientes** (nome, e-mail, telefone, WhatsApp, observações)
- **Múltiplas motos** por cliente (placa, chassi, marca, modelo, ano, cor)
- **Histórico de manutenção** por cliente (OS vinculadas)
- **Busca por placa** em toda a base
- Listagens e modais **sem imagem de fundo**

### Estoque (`/estoque`)

- CRUD de **peças** com SKU, categoria, descrição
- **Preço de custo** e **preço de venda** com cálculo de **margem %**
- **Estoque atual** e **estoque mínimo** (alerta no dashboard)
- Baixa automática de peças ao concluir OS (lógica no backend)
- Rota legada `/itens` redireciona para `/estoque`

### Projetos Custom (`/projetos`)

- Projetos de customização vinculados a cliente + moto
- **Etapas padrão**: Desmontagem → Preparação do Chassi → Pintura do Tanque → Adaptação Custom → Montagem Final → Acabamento
- Status: Planejamento, Em Andamento, Concluído
- **Moodboard** — upload de imagens de referência (base64)
- Modal de detalhe com progresso das etapas
- Cards de listagem **sem imagem**

### Financeiro (`/financeiro`)

- **Comissões de mecânicos** — horas × taxa × percentual de comissão
- **Pagamentos** de OS concluídas/entregues
- Métodos: Pix, Cartão de Crédito, Cartão de Débito, Dinheiro
- Filtros por **período** e **mecânico** (admin vê todos; mecânico vê só os seus)
- Marcar OS como paga / alterar forma de pagamento
- Cards e tabelas **sem imagem**

### Usuários (`/usuarios`) — somente admin

- CRUD de usuários do sistema
- Papéis: `admin` e `user` (mecânico)
- Senha obrigatória na criação; opcional na edição

---

## Autenticação e permissões

| Papel | Acesso |
|-------|--------|
| **admin** | Todos os módulos + Usuários + todos os mecânicos no Financeiro |
| **user** (mecânico) | Dashboard, OS, Clientes, Estoque, Projetos, Financeiro (só suas comissões) |

- Rotas protegidas por `PrivateRoute` (redireciona para `/login`)
- Rota `/usuarios` usa `PrivateRoute adminOnly`
- Token expirado ou inválido → logout automático (interceptor 401)
- Sidebar oculta "Usuários" para não-admins

---

## Identidade visual e imagens

### Paleta e tipografia

- Tema **escuro industrial** (`workshop-950` … `workshop-accent`)
- Cor de destaque: **laranja `#ea580c`**
- Fonte display: **Bebas Neue** | corpo: **Inter**
- Animações: gradient shift, ken burns, partículas no login

### Onde **tem** imagem

| Local | Componente / origem |
|-------|---------------------|
| Login | `ImageCard` + `WorkshopBackground` |
| Dashboard | `PageHero`, stats (`ImageCard`), seções, atalhos de módulo |
| Cada módulo | `PageHero` com hero em `public/images/heroes/` |
| Sidebar | Mini banner inferior (`MOTO_IMAGES.sidebar`) |

### Onde **não tem** imagem (listagens e cadastros)

- Cards do kanban de OS e orçamentos
- Listagens de clientes, motos, peças, usuários
- Grid de projetos e modais de detalhe
- Tabelas e filtros do financeiro
- Itens dentro de formulários (`OrderFormModal`)

### Arquivos de imagem

| Pasta | Conteúdo |
|-------|----------|
| `public/images/cards/` | 24 fotos (`01.jpg` … `24.jpg`) — motos, oficina, ferramentas |
| `public/images/heroes/` | Banners: `login.jpg`, `dashboard.jpg`, `service-orders.jpg`, `clients.jpg`, `inventory.jpg`, `projects.jpg`, `finance.jpg`, `users.jpg`, `sidebar.jpg` |

Configuração centralizada em `src/utils/theme.js` (`MOTO_IMAGES`, `CARD_IMAGES`, `MODULE_CARD_IMAGES`, helpers `cardImage()` / `cardImageFromId()`).

Para (re)baixar as imagens:

```powershell
.\scripts\download-moto-images.ps1
```

---

## Integração com a API Dual Persistence

Este frontend **não possui backend próprio** — todas as operações (login, CRUD, Kanban, dashboard, financeiro etc.) são delegadas à [**API Dual Persistence**](https://github.com/LuanaPZenha/ApiDualPersistence).

Base URL: `VITE_API_URL` (padrão `/api`). Em desenvolvimento com Docker, o Vite faz proxy para o container `backend`; em produção, o Nginx repassa `/api` para a mesma API.

Para clonar e configurar o backend separadamente:

```bash
git clone https://github.com/LuanaPZenha/ApiDualPersistence.git api-dual-persistence
cd api-dual-persistence
cp .env.example .env
```

### Endpoints consumidos

| Módulo | Método | Endpoint |
|--------|--------|----------|
| Login | POST | `/auth/login` |
| Perfil | GET | `/auth/profile` |
| Usuários | CRUD | `/users` |
| Clientes | CRUD | `/clients` |
| Veículos | CRUD | `/vehicles` |
| Peças | CRUD | `/parts` |
| OS | CRUD | `/service-orders` |
| OS Kanban | GET | `/service-orders/kanban` |
| OS Status | PATCH | `/service-orders/:id/status` |
| OS Pagamento | PATCH | `/service-orders/:id/payment` |
| Converter orçamento | POST | `/service-orders/:id/convert` |
| Comissões | GET | `/service-orders/commissions` |
| Projetos | CRUD | `/projects` |
| Dashboard | GET | `/dashboard/summary` |

Documentação interativa da API: **http://localhost:3000/api-docs** (Swagger)

### Serviços frontend

Cada domínio tem um service em `src/services/` que encapsula chamadas axios. Erros são normalizados por `extractErrorMessage()` em `api.js`.

---

## Como executar

### Pré-requisitos

- Node.js 20+ (dev local sem Docker)
- Docker e Docker Compose (recomendado)
- [API Dual Persistence](https://github.com/LuanaPZenha/ApiDualPersistence) clonada em `../api-dual-persistence` com `.env` configurado (ou use `docker compose up`, que sobe o backend automaticamente a partir desse diretório)

### Docker — desenvolvimento (recomendado)

```bash
cd oficina-motos-frontend
cp .env.example .env
docker compose up --build
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Swagger | http://localhost:3000/api-docs |

### Docker — produção (Nginx)

```bash
docker compose --profile production up --build frontend-prod backend postgres mongo
```

| Serviço | URL |
|---------|-----|
| Frontend (Nginx) | http://localhost:8080 |

### Desenvolvimento local (sem Docker)

```bash
# Terminal 1 — API Dual Persistence (em api-dual-persistence)
npm run dev

# Terminal 2 — frontend
cd oficina-motos-frontend
cp .env.example .env
# Ajuste VITE_PROXY_TARGET=http://localhost:3000 no .env
npm install
npm run dev
```

---

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_API_URL` | Base URL da API no frontend | `/api` |
| `VITE_PROXY_TARGET` | Target do proxy Vite (dev) | `http://backend:3000` |
| `FRONTEND_PORT` | Porta exposta do frontend | `5173` |
| `BACKEND_PORT` | Porta exposta do backend | `3000` |

Copie `.env.example` para `.env` antes de subir os containers.

---

## Docker e portas

| Serviço | Porta host | Porta container | Profile |
|---------|------------|-----------------|---------|
| frontend (Vite) | 5173 | 5173 | default |
| frontend-prod (Nginx) | 8080 | 80 | production |
| backend | 3000 | 3000 | default |
| postgres | — (interno) | 5432 | default |
| mongo | — (interno) | 27017 | default |

O frontend acessa a API via proxy (`/api` → `backend:3000`), evitando CORS em Docker.

Volumes nomeados: `postgres_data`, `mongo_data`.

---

## Scripts auxiliares

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor Vite com hot reload |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Preview do build |
| `scripts/download-moto-images.ps1` | Baixa 24 cards + 9 heroes do Unsplash para `public/images/` |

---

## Dados de demonstração

Na primeira subida, o backend executa seed automático com **5 exemplos** por área:

| Área | Quantidade |
|------|------------|
| Mecânicos (usuários) | 5 |
| Clientes | 5 |
| Motos (veículos) | 5 |
| Peças (estoque) | 5 |
| Orçamentos | 5 |
| Ordens de Serviço | 5 |
| Projetos Custom | 5 |

### Credenciais padrão

| Papel | E-mail | Senha |
|-------|--------|-------|
| Admin | `admin@example.com` | `Admin1234` |
| Mecânico | `carlos@example.com` | `Mecanico1` |
| Mecânico | `rafael@example.com` | `Mecanico1` |
| Mecânico | `bruno@example.com` | `Mecanico1` |
| Mecânico | `diego@example.com` | `Mecanico1` |
| Mecânico | `marina@example.com` | `Mecanico1` |

Para recriar os dados de exemplo, limpe o MongoDB e reinicie o backend.

---

## Histórico de commits

| Commit | Descrição |
|--------|-----------|
| `chore: setup React, Vite, Tailwind e Docker` | Estrutura inicial, containerização |
| `feat: modulos da oficina e integracao com API` | OS, CRM, estoque, projetos, financeiro, dashboard |
| `style: identidade visual e imagens locais` | Tema Iron Custom, imagens, ImageCard, PageHero, fix sidebar |

---

## Licença

Projeto educacional desenvolvido por **Luana de Pinho Zenha**.
