# Iron Custom — Frontend Oficina de Motos

Frontend React + Tailwind CSS para o sistema de gerenciamento da oficina mecânica de motos custom. Consome a API do projeto `api-dual-persistence`.

## Stack

- React 18 + Vite
- Tailwind CSS
- React Router DOM
- Axios (JWT interceptors)
- Docker + Docker Compose

## Estrutura

```
src/
├── components/   # UI reutilizável (Button, Modal, Layout...)
├── pages/        # Login, Dashboard, Usuários, Itens
├── services/     # Integração com API (axios isolado)
├── contexts/     # AuthContext, ToastContext
└── routes/       # Rotas públicas e privadas
```

## Módulos da Oficina

| Módulo | Rota Frontend | API |
|--------|---------------|-----|
| Ordens de Serviço | `/ordens-servico` | `/api/service-orders` |
| Clientes & Motos (CRM) | `/clientes` | `/api/clients`, `/api/vehicles` |
| Estoque de Peças | `/estoque` | `/api/parts` |
| Projetos Custom | `/projetos` | `/api/projects` |
| Financeiro | `/financeiro` | `/api/service-orders/commissions` |
| Dashboard | `/dashboard` | `/api/dashboard/summary` |
| Usuários | `/usuarios` | `/api/users` |

### Funcionalidades

- **OS / Orçamentos:** Kanban com 6 status, conversão orçamento → OS, checklist de entrada, fotos, PDF e WhatsApp
- **CRM:** Cliente com múltiplas motos, histórico por placa
- **Estoque:** Preço custo/venda, margem, alerta estoque mínimo, baixa automática ao concluir OS
- **Projetos Custom:** Etapas passo a passo + moodboard de referências
- **Financeiro:** Pagamentos (Pix, cartão, dinheiro), comissão de mecânicos

## Integração com Backend

| Módulo Frontend | Endpoint API        | Autenticação      |
|-----------------|---------------------|-------------------|
| Login           | POST /api/auth/login | Público           |
| Usuários        | CRUD /api/users      | JWT + role admin  |
| Itens (Motos)   | CRUD /api/motos      | JWT               |

## Execução via Docker

### Pré-requisitos

- Docker e Docker Compose instalados
- Backend em `../api-dual-persistence` com arquivo `.env` configurado

### Desenvolvimento (recomendado)

```bash
cd oficina-motos-frontend
cp .env.example .env
docker compose up --build
```

Acesse:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Swagger:** http://localhost:3000/api-docs

### Produção (Nginx)

```bash
docker compose --profile production up --build frontend-prod backend postgres mongo
```

Acesse: http://localhost:8080

### Credenciais padrão

- **Admin:** admin@example.com / Admin1234
- **Mecânicos (exemplo):** carlos@example.com / Mecanico1 (e rafael, bruno, diego, marina @example.com)

### Dados de demonstração

Na primeira subida, o backend cria automaticamente **5 exemplos** em cada área:

| Área | Quantidade |
|------|------------|
| Usuários (mecânicos) | 5 |
| Clientes | 5 |
| Motos (veículos) | 5 |
| Peças (estoque) | 5 |
| Orçamentos | 5 |
| Ordens de Serviço | 5 |
| Projetos Custom | 5 |

Para recriar os dados de exemplo, limpe o MongoDB e reinicie o backend.

## Variáveis de Ambiente

| Variável            | Descrição                              | Padrão              |
|---------------------|----------------------------------------|---------------------|
| VITE_API_URL        | Base URL da API                        | /api                |
| VITE_PROXY_TARGET   | Target do proxy Vite (dev Docker)      | http://backend:3000 |
| FRONTEND_PORT       | Porta exposta do frontend              | 5173                |
| BACKEND_PORT        | Porta exposta do backend               | 3000                |

## Portas

| Serviço    | Porta Host | Porta Container |
|------------|------------|-----------------|
| Frontend   | 5173       | 5173            |
| Backend    | 3000       | 3000            |
| Frontend Prod | 8080    | 80              |

O frontend acessa a API via proxy (`/api` → backend:3000), evitando problemas de CORS em Docker.

## GitHub

```bash
git remote add origin https://github.com/SEU_USUARIO/oficina-motos-frontend.git
git add .
git commit -m "feat: frontend React da oficina de motos custom"
git push -u origin main
```
