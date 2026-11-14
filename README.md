# Universal Games Wiki

Enciclopédia colaborativa de jogos de todas as plataformas e gerações. Aplicação Next.js + TypeScript + Tailwind + Supabase, preparada para Vercel.

## Funcionalidades implementadas
- Página inicial e catálogo com pesquisa por título/plataforma.
- Página individual dos jogos.
- Cadastro e login por e-mail e senha.
- Envio de jogos, artigos e correções como contribuições pendentes.
- Área de moderação com aprovação/rejeição.
- Aprovar um envio do tipo jogo cria o registro no catálogo público.
- Políticas RLS e registro de decisões no Supabase.

## Configuração necessária
1. Crie um projeto gratuito no [Supabase](https://supabase.com/).
2. Abra **SQL Editor** e execute todo o arquivo `supabase/schema.sql`.
3. Em **Project Settings → API**, copie a Project URL e a chave anon/publishable.
4. Na Vercel, importe este repositório e adicione as variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Faça o deploy.
6. Crie sua conta no site. No SQL Editor do Supabase, promova sua conta a administradora:
   `update public.profiles set role='admin' where email='SEU_EMAIL';`

## Executar localmente
Requer Node.js 20+:
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Limitações atuais
- O catálogo começa vazio; não são inseridos jogos de demonstração.
- O fluxo de publicação está implementado para contribuições do tipo **Adicionar um jogo**. Artigos e correções podem ser enviados e moderados, mas ainda não têm editor/publicador próprio.
- O deploy e a conexão do Supabase ainda precisam ser configurados; não estão concluídos automaticamente.
