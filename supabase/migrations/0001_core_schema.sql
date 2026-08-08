-- Root Account 基盤 コアスキーマ
-- auth.users (Supabase管理) を唯一の認証ソースとし、
-- ここで定義するテーブル群がプロフィール / 研究ポイント / バッジ / サブスクを保持する。

-- ============================================================
-- 1. プラン定義
-- ============================================================
create type public.plan_tier as enum ('bachelor', 'master', 'doctor');
-- bachelor = 学士(無料) / master = 修士 / doctor = 博士

create type public.subscription_status as enum (
  'active', 'trialing', 'past_due', 'canceled', 'incomplete'
);

-- ============================================================
-- 2. プロフィール（1ユーザー1レコード、auth.usersと1:1）
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'ラボの研究員',
  avatar_url text,
  research_points integer not null default 0,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'サービス横断で共有されるユーザープロフィール。research_pointsはるーとの研究室ブランド全体のゲーミフィケーション用ポイント。';

-- auth.users作成時にprofilesを自動生成するトリガー
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'ラボの研究員'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at自動更新
create function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- 3. サブスクリプション（Stripeと同期）
-- ============================================================
create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan public.plan_tier not null default 'bachelor',
  status public.subscription_status not null default 'active',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.subscriptions is 'Stripe Webhookから同期される、唯一のプラン情報の真実の情報源。各サービスはこのテーブルを直接読まず、JWTのカスタムクレーム経由でplanを参照すること。';

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

-- auth.users作成時にfreeプランのsubscriptionsレコードも自動生成
create function public.handle_new_user_subscription()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'bachelor', 'active');
  return new;
end;
$$;

create trigger on_auth_user_created_subscription
  after insert on auth.users
  for each row execute procedure public.handle_new_user_subscription();

-- ============================================================
-- 4. バッジ
-- ============================================================
create table public.badges (
  code text primary key,
  name text not null,
  description text,
  icon text,
  created_at timestamptz not null default now()
);

create table public.user_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_code text not null references public.badges(code) on delete cascade,
  awarded_by text, -- 発行元サービス名 (例: 'quiznavi', 'mekuru')
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_code)
);

-- ============================================================
-- 5. RLS（Row Level Security）
-- ============================================================
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- profiles: 本人は自分のプロフィールをread/update可能。他人のプロフィールもread可能（バッジ表示等のため公開）
create policy "profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- subscriptions: 本人のみread可能。write はservice_role(Stripe webhook用サーバー)のみ
create policy "users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- badges: 誰でもread可能（マスタデータ）
create policy "badges are viewable by everyone"
  on public.badges for select
  using (true);

-- user_badges: 誰でもread可能（プロフィールに表示するため）。writeはservice_roleのみ
create policy "user badges are viewable by everyone"
  on public.user_badges for select
  using (true);
