-- RAP DJ SET: профили пользователей. Выполни целиком в Supabase → SQL Editor → New query → Run.
-- Профиль создаётся автоматически при первом входе через Google.
-- Поле plan ('free' / 'pro') пригодится для подписки: менять его будет только сервер (оплата), не сам пользователь.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free','pro')),
  pro_until timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- каждый видит только свой профиль; изменять plan с сайта нельзя (нет политики update)
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
          coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
