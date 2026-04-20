# Lucro Oculto

SaaS para pequenos prestadores B2B descobrirem quais clientes, contratos e projetos estao queimando margem em silencio.

## Stack

- Next.js App Router
- Supabase Auth + Postgres + RLS
- Vercel
- CSV manual via PapaParse

## Setup local

1. Crie um projeto no Supabase.
2. Rode o SQL de `supabase/schema.sql` no SQL Editor.
3. Copie `.env.example` para `.env.local`.
4. Preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Instale dependencias e rode:

```bash
npm install
npm run dev
```

## Supabase Auth

No MVP, use email e senha pelo Supabase Auth. Para testes rapidos, no painel do Supabase em Authentication, voce pode desativar temporariamente a confirmacao de email. Em producao, configure SMTP e URLs permitidas.

URLs de redirect sugeridas:

```txt
https://seu-dominio.vercel.app/auth/callback
https://seu-dominio.vercel.app/**
https://*-sua-conta-vercel.vercel.app/**
http://localhost:3000/**
```

## CSV esperado

```csv
data,cliente,contrato,receita,horas,custo_hora,chamados,urgencias,retrabalhos,descontos,atraso_pagamento_dias,observacoes
2026-04-01,Condominio Alfa,Suporte mensal,2500,18,65,12,3,2,0,8,Muitas urgencias fora do combinado
```

## Deploy

A Vercel instala as dependencias pelo `package.json`. Configure as mesmas env vars no projeto da Vercel antes do primeiro deploy de producao.

Depois do deploy, abra:

```txt
https://seu-dominio.vercel.app/setup
```

Essa rota checa se as variaveis publicas existem e se o schema do Supabase foi aplicado.

## Segredos

Arquivos `.env*.local`, `.vercel` e `config/users.local.json` ficam fora do Git. Nunca commite senhas, service keys ou chaves secretas.
