# Sinara Achadinhos

Vitrine full stack para curadoria de ofertas, cupons e produtos afiliados. O projeto combina uma experiência de compra responsiva com um painel administrativo, métricas de cliques e persistência local ou PostgreSQL.

![Capa do projeto Sinara Achadinhos](docs/preview.svg)

## Destaques

- Catálogo responsivo com busca, filtros, ordenação e favoritos.
- Cofre de cupons, roleta de descoberta e compartilhamento social.
- Painel administrativo para produtos, categorias, plataformas e destaques.
- Analytics de cliques com anonimização de IP.
- Autenticação administrativa, limitação de requisições e proteção contra SSRF.
- Persistência em JSON para desenvolvimento e PostgreSQL/Prisma em produção.

## Tecnologias

React 19, TypeScript, Vite, Tailwind CSS 4, Express, Prisma e PostgreSQL.

## Executar localmente

Requisitos: Node.js 22 ou mais recente.

```bash
npm install
copy .env.example .env
npm run dev
```

No macOS ou Linux, substitua o segundo comando por `cp .env.example .env`. A aplicação abre em `http://localhost:3000`. Sem PostgreSQL, o ambiente de desenvolvimento usa `data/database.json`.

O painel administrativo fica em `/admin`. Se `ADMIN_PASSWORD` estiver vazio em desenvolvimento, uma credencial temporária é exibida no terminal ao iniciar o servidor.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia front-end e API em modo de desenvolvimento |
| `npm run lint` | Valida os tipos TypeScript |
| `npm test` | Executa as suítes de segurança e homologação |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm start` | Executa o servidor gerado |

## Variáveis de ambiente

Copie `.env.example` para `.env` e configure:

- `PORT`: porta HTTP, padrão `3000`.
- `DATABASE_URL`: conexão PostgreSQL usada em produção.
- `ADMIN_USERNAME` e `ADMIN_PASSWORD`: acesso ao painel.
- `JWT_SECRET`: segredo aleatório com pelo menos 24 caracteres em produção.
- `CORS_ORIGIN`: origens autorizadas, separadas por vírgula.
- `APP_URL`: endereço público da aplicação.

Em produção, `DATABASE_URL`, `ADMIN_PASSWORD` e um `JWT_SECRET` forte são obrigatórios. Nunca publique o arquivo `.env`.

## Arquitetura

```text
src/                 interface React e serviços do cliente
src/components/      vitrine, modais e painel administrativo
server/              autenticação, segurança, dados e análise de links
prisma/              esquema e migrações PostgreSQL
tests/               auditoria de segurança e homologação
data/                base local de demonstração
```

## Qualidade e segurança

O repositório inclui uma automação de integração contínua que valida tipos, testes e build em cada alteração. A API aplica cabeçalhos de segurança, autenticação HMAC, PBKDF2 para senhas, rate limiting e validação de URLs externas.

## Aviso sobre links afiliados

Os links e produtos incluídos são dados de demonstração. Antes de publicar, substitua URLs de exemplo, canais sociais e informações comerciais pelos dados oficiais do projeto.

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](LICENSE).
