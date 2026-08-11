-- プロフィール拡張: ユーザーID(username)・アバターアップロード・ID/パスワードログインの補助関数

-- ============================================================
-- 1. username列(ユーザーID)
-- ============================================================
alter table public.profiles add column username text;

-- 大文字小文字を区別せず一意にする(小文字化した値で一意制約)
create unique index profiles_username_lower_idx on public.profiles (lower(username));

alter table public.profiles
  add constraint profiles_username_format
  check (username is null or username ~ '^[a-z0-9_]{3,20}$');

comment on column public.profiles.username is
  'ログイン・プロフィールURL等に使うユーザーID。半角英数字とアンダースコアのみ、3〜20文字、大文字小文字区別なしで一意。';

-- 新規ユーザー作成時、サインアップフォームでusernameが渡されていれば設定する
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'ラボの研究員'),
    nullif(new.raw_user_meta_data->>'username', '')
  );
  return new;
end;
$$;

-- ============================================================
-- 2. ユーザーID(username) or メールアドレス + パスワードでのログインを
--    可能にするための補助関数。
--    Supabase Authはemailでしかsignin出来ないため、usernameが入力された場合は
--    まずこの関数でemailに変換してからsignInWithPasswordを呼ぶ。
-- ============================================================
create or replace function public.email_for_login(identifier text)
returns text
language plpgsql
security definer set search_path = public
stable
as $$
declare
  found_email text;
begin
  -- @が含まれていれば、それをそのままメールアドレスとして扱う
  if identifier like '%@%' then
    return identifier;
  end if;

  select u.email into found_email
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(p.username) = lower(identifier)
  limit 1;

  return found_email; -- 見つからなければ null
end;
$$;

-- anon(未ログイン状態のログインフォーム)から呼べるようにする。
-- 返すのはメールアドレス1件のみで、他の個人情報は一切返さない。
grant execute on function public.email_for_login to anon, authenticated;

-- ============================================================
-- 3. アバター画像用のStorageバケット
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- ファイルパスは "{user_id}/avatar.{ext}" の形を想定し、本人だけが自分のフォルダにupload/update/deleteできる。
create policy "avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
