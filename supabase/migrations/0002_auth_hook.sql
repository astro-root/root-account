-- Custom Access Token Hook
-- JWT発行のたびに呼ばれ、subscriptionsテーブルを参照してJWTのカスタムクレームに
-- plan / plan_status を埋め込む。各サービスはDBに問い合わせずJWTだけでプラン判定できる。
--
-- 有効化はSQLだけでは完結しない。Supabaseダッシュボード側で
-- Authentication > Hooks > Custom Access Token から
-- この関数 (public.custom_access_token_hook) を指定して有効化する必要がある。
-- (self-hosted / CLI管理の場合は supabase/config.toml の [auth.hook.custom_access_token] で指定)

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  sub record;
begin
  claims := event->'claims';

  select plan, status, current_period_end
    into sub
    from public.subscriptions
    where user_id = (event->>'user_id')::uuid;

  -- サブスクレコードが存在しない、または期限切れ・失効している場合はbachelor(無料)扱い
  if sub is null or sub.status not in ('active', 'trialing') then
    claims := jsonb_set(claims, '{plan}', to_jsonb('bachelor'::text));
    claims := jsonb_set(claims, '{plan_status}', to_jsonb(coalesce(sub.status::text, 'none')));
  else
    claims := jsonb_set(claims, '{plan}', to_jsonb(sub.plan::text));
    claims := jsonb_set(claims, '{plan_status}', to_jsonb(sub.status::text));
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- Supabase Authサービス(supabase_auth_admin)だけが実行できるように権限を絞る
grant execute
  on function public.custom_access_token_hook
  to supabase_auth_admin;

revoke execute
  on function public.custom_access_token_hook
  from authenticated, anon, public;

-- Hook関数がsubscriptionsテーブルを参照できるよう、supabase_auth_adminにread権限を付与
grant select on public.subscriptions to supabase_auth_admin;
