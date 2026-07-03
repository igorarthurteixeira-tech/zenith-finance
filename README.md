# Zenith Finance

Sistema de controle financeiro pessoal, arquitetado para suportar uso empresarial (múltiplas contas por usuário) e futura extensão mobile.

## Estrutura

- `apps/api` — NestJS + Prisma (PostgreSQL/Neon), empacotado como função serverless para a Vercel
- `apps/web` — React + Vite
- `packages/shared` — enums e contratos de tipos compartilhados entre as apps

## Desenvolvimento

```bash
npm install
npm run dev:api   # apps/api em http://localhost:3000
npm run dev:web   # apps/web em http://localhost:5173
```

Requer um `DATABASE_URL` do Neon em `apps/api/.env` (ver `apps/api/.env.example`).
