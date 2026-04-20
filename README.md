# Lucro Oculto

Cliente ruim nao avisa que esta caro. Ele aparece como urgencia, retrabalho,
desconto, atraso de pagamento e hora que some da agenda.

**Lucro Oculto** e um SaaS para prestadores B2B descobrirem quais clientes
estao queimando margem em silencio. A entrada pode ser manual ou por CSV. O
resultado e um diagnostico simples: quem esta saudavel, quem precisa de
observacao, quem merece reajuste e quem talvez precise sair da carteira.

## Para Quem

- Consultorias pequenas.
- Agencias.
- Suporte tecnico recorrente.
- Contabilidades, BPOs e operacoes de servico.
- Qualquer prestador B2B que vende mensalidade, projeto ou hora avulsa.

## Promessa

Em poucos minutos, o usuario sobe uma planilha simples e responde:

- Qual cliente consome mais horas do que paga?
- Onde urgencia, retrabalho e atraso estao comendo margem?
- Qual valor deveria ser cobrado para bater a margem alvo?
- Qual conversa comercial precisa acontecer primeiro?

## Como Funciona

1. Configure custo/hora, margem alvo e fatores de caos.
2. Cadastre clientes manualmente ou importe um CSV.
3. Informe receita, horas, chamados, urgencias, retrabalhos e descontos.
4. Abra o diagnostico em ordem de dor.
5. Gere um relatorio de decisao para reajuste, limite de escopo ou corte.

## Planos Do MVP

| Plano | Para que serve | Limites |
| --- | --- | --- |
| Free | Validar a dor e testar com poucos clientes | 3 clientes, 1 importacao CSV por mes, relatorios limitados |
| Beta pago | Usar com carteira real pequena | 25 clientes, 20 importacoes por mes, suporte fundador |
| Pro | Proxima etapa comercial | Uso ampliado, multiusuario e operacao de time |

O beta pago e liberado manualmente nesta fase. Isso reduz dependencia de gateway
de pagamento e aumenta contato direto com usuarios reais.

## Produto No Ar

Rotas principais:

- `/` - apresentacao publica.
- `/login` - entrada e criacao de conta.
- `/forgot-password` - recuperacao de senha por email.
- `/dashboard` - diagnostico da carteira.
- `/dashboard/import` - importacao CSV.
- `/dashboard/clients` - cadastro manual e lancamentos.
- `/dashboard/clients/[id]/report` - relatorio que vende a decisao.
- `/launch` - planos e pedido de beta pago.
- `/admin` - cockpit de fundador, restrito por email.
- `/setup` - checagem de Vercel, Supabase e schema.

## Stack

- Next.js App Router.
- Supabase Auth, Postgres e RLS.
- Vercel.
- PapaParse para CSV no navegador.

## CSV Esperado

```csv
data,cliente,contrato,receita,horas,custo_hora,chamados,urgencias,retrabalhos,descontos,atraso_pagamento_dias,observacoes
2026-04-01,Condominio Alfa,Suporte mensal,2500,18,65,12,3,2,0,8,Muitas urgencias fora do combinado
```

## Setup Local

1. Crie um projeto no Supabase.
2. Rode o SQL de `supabase/schema.sql` no SQL Editor.
3. Copie `.env.example` para `.env.local`.
4. Preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
FOUNDER_EMAILS=schenkel.mario@hotmail.com
```

5. Instale dependencias e rode:

```bash
npm install
npm run dev
```

## Supabase Auth

Use email e senha pelo Supabase Auth. Em producao, mantenha confirmacao de email
ativa e configure SMTP.

URLs de redirect sugeridas:

```txt
https://seu-dominio.vercel.app/auth/callback
https://seu-dominio.vercel.app/**
https://*-sua-conta-vercel.vercel.app/**
http://localhost:3000/**
```

O fluxo de recuperacao de senha envia o usuario para `/auth/callback` e depois
para `/reset-password`.

## Deploy

A Vercel instala dependencias pelo `package.json`. Configure as mesmas env vars
no projeto da Vercel antes do deploy de producao.

Depois do deploy, abra:

```txt
https://seu-dominio.vercel.app/setup
```

Essa rota confirma se variaveis publicas, Supabase e schema estao conversando.

## Seguranca

- `.env*.local`, `.vercel` e `config/users.local.json` ficam fora do Git.
- Nunca commite senhas, service keys ou chaves secretas.
- Headers HTTP e CSP ficam em `next.config.ts`.
- Probes comuns e `x-middleware-subrequest` sao bloqueados em `src/proxy.ts`.
- Dados de produto ficam protegidos por RLS no Supabase.
- Usuarios normais respeitam limites do plano.
- Emails em `FOUNDER_EMAILS` recebem acesso de fundador no app.
- `/admin` nao aparece para usuarios normais e redireciona para `/launch`.

## Lancamento Beta

Antes de chamar clientes reais:

1. Deixe `/setup` verde.
2. Carregue pelo menos 3 clientes reais ou dados demo.
3. Gere um relatorio de decisao com um cliente ruim.
4. Abra `/launch` e valide a oferta do beta pago.
5. Use `/admin` somente como fundador para liberar acesso apos pagamento.

## Posicionamento

Lucro Oculto nao tenta ser ERP, CRM ou BI. Ele resolve uma pergunta pequena e
dolorida: **qual cliente esta custando caro demais para continuar igual?**

Essa clareza e o produto.
