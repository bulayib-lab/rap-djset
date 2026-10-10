-- RAP DJ SET: подписка PRO. Выполни целиком в Supabase → SQL Editor → New query → Run
-- (после schema.sql). Повторный запуск безопасен.

-- PRO активен, если plan = 'pro' и срок ещё не вышел
create or replace function public.is_pro(p_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = p_user and plan = 'pro' and pro_until > now());
$$;

-- платежи ЮMoney (пишет только сервер с ключом service_role)
create table if not exists public.payments (
  operation_id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric not null,
  months int not null default 1,
  raw jsonb,
  created_at timestamptz not null default now()
);
alter table public.payments enable row level security;
drop policy if exists "payments: read own" on public.payments;
create policy "payments: read own" on public.payments for select using (auth.uid() = user_id);

-- продление: дни добавляются к текущему сроку
create or replace function public.extend_pro(p_user uuid, p_months int)
returns void language sql security definer set search_path = public as $$
  update public.profiles
     set plan = 'pro',
         pro_until = greatest(coalesce(pro_until, now()), now()) + make_interval(days => 30 * greatest(p_months, 1))
   where id = p_user;
$$;
revoke all on function public.extend_pro(uuid, int) from public, anon, authenticated;
grant execute on function public.extend_pro(uuid, int) to service_role;

-- сеты в облаке: только для PRO и только свои
create table if not exists public.sets (
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  id bigint not null,
  name text not null,
  tracks jsonb not null default '[]'::jsonb,
  date text,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
alter table public.sets enable row level security;
drop policy if exists "sets: own, pro only" on public.sets;
create policy "sets: own, pro only" on public.sets for all
  using (auth.uid() = user_id and public.is_pro())
  with check (auth.uid() = user_id and public.is_pro());
