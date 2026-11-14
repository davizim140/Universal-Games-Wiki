-- Execute no SQL Editor do Supabase.
create extension if not exists pgcrypto;
create table if not exists public.profiles(id uuid primary key references auth.users(id) on delete cascade,email text,role text not null default 'member' check(role in('member','moderator','admin')),created_at timestamptz not null default now());
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,email) values(new.id,new.email) on conflict(id) do update set email=excluded.email;return new;end;$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create table if not exists public.games(id uuid primary key default gen_random_uuid(),title text not null,slug text not null unique,platform text not null,summary text,description text,cover_url text,release_date text,developer text,publisher text,genre text,status text not null default 'published' check(status in('draft','published','archived')),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.contributions(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,type text not null check(type in('game','article','edit')),title text not null,platform text,payload jsonb not null default '{}'::jsonb,status text not null default 'pending' check(status in('pending','approved','rejected')),moderator_id uuid references auth.users(id),moderator_note text,reviewed_at timestamptz,created_at timestamptz not null default now());
create table if not exists public.revision_log(id uuid primary key default gen_random_uuid(),contribution_id uuid references public.contributions(id) on delete set null,actor_id uuid references auth.users(id),action text not null,details jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
alter table public.profiles enable row level security;alter table public.games enable row level security;alter table public.contributions enable row level security;alter table public.revision_log enable row level security;
drop policy if exists "Profile self read" on public.profiles;create policy "Profile self read" on public.profiles for select to authenticated using(id=auth.uid());
drop policy if exists "Published games public" on public.games;create policy "Published games public" on public.games for select using(status='published');
drop policy if exists "Own contributions readable" on public.contributions;create policy "Own contributions readable" on public.contributions for select to authenticated using(user_id=auth.uid());
drop policy if exists "Submit own contributions" on public.contributions;create policy "Submit own contributions" on public.contributions for insert to authenticated with check(user_id=auth.uid() and status='pending');
drop policy if exists "Moderators read all contributions" on public.contributions;create policy "Moderators read all contributions" on public.contributions for select to authenticated using(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in('moderator','admin')));
drop policy if exists "Moderators read revision log" on public.revision_log;create policy "Moderators read revision log" on public.revision_log for select to authenticated using(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in('moderator','admin')));
create or replace function public.review_contribution(contribution_id uuid,decision text,moderator_note text default '') returns void language plpgsql security definer set search_path=public as $$
declare c public.contributions%rowtype; actor_role text; new_slug text;
begin
 select role into actor_role from public.profiles where id=auth.uid();
 if actor_role not in('moderator','admin') then raise exception 'Sem permissão para moderar.';end if;
 if decision not in('approve','reject') then raise exception 'Decisão inválida.';end if;
 select * into c from public.contributions where id=contribution_id for update;
 if not found or c.status<>'pending' then raise exception 'Contribuição não encontrada ou já analisada.';end if;
 if decision='approve' and c.type='game' then
  new_slug:=trim(both '-' from regexp_replace(lower(c.title),'[^a-z0-9]+','-','g'));if new_slug='' then new_slug:='jogo';end if;
  if exists(select 1 from public.games where slug=new_slug) then new_slug:=new_slug||'-'||substr(c.id::text,1,8);end if;
  insert into public.games(title,slug,platform,summary,description,status) values(c.title,new_slug,coalesce(c.platform,'Não informado'),c.payload->>'summary',c.payload->>'description','published');
 end if;
 update public.contributions set status=case when decision='approve' then 'approved' else 'rejected' end,moderator_id=auth.uid(),moderator_note=review_contribution.moderator_note,reviewed_at=now() where id=c.id;
 insert into public.revision_log(contribution_id,actor_id,action,details) values(c.id,auth.uid(),decision,jsonb_build_object('note',moderator_note,'type',c.type));
end;$$;
grant execute on function public.review_contribution(uuid,text,text) to authenticated;
-- Após criar sua conta no site, promova seu usuário:
-- update public.profiles set role='admin' where email='SEU_EMAIL';
