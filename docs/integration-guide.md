# 各サービスからの統合ガイド（フェーズ1: QuizNavi / めくる）

## 0. 前提

- Root AccountのSupabaseプロジェクトURL・anon keyを環境変数として各サービスに配布する
- 各サービスは**自分のSupabaseプロジェクトのAuthを使うのをやめ**、Root AccountのAuthを参照する
- 各サービス固有の業務データ（QuizNaviの大会情報など）は今まで通り自サービス側のDBに残してよい。変えるのは「認証の参照先」だけ

```bash
# 各サービスの .env に追加
NEXT_PUBLIC_ROOT_ACCOUNT_URL=https://xxxx.supabase.co
NEXT_PUBLIC_ROOT_ACCOUNT_ANON_KEY=xxxx
ROOT_ACCOUNT_COOKIE_DOMAIN=.astro-root.com
```

## 1. QuizNaviの`authId`参照先の切り替え

QuizNaviの`prisma/schema.prisma`には既に以下の設計がある（変更不要、そのまま活かす）:

```prisma
model User {
  id     String @id @default(uuid())
  authId String @unique   // ← ここがRoot AccountのauthユーザーIDを指すようになる
  email  String @unique
  ...
}
```

変更が必要なのは「`authId`がどのSupabaseプロジェクトのIDを指すか」だけ。

1. QuizNavi側のSupabaseクライアント初期化を、自プロジェクトのURL/anon keyから
   Root AccountのURL/anon keyに差し替える（`@rootlab/account-sdk`の`createBrowserRootAccountClient` /
   `createServerRootAccountClient`を使う）
2. 既存ユーザーの移行スクリプトを実行し、`User.authId`をRoot Account側の新しい`auth.users.id`に更新する
3. ログイン画面はQuizNavi独自のものをやめ、Root Accountの`apps/accounts`（`accounts.astro-root.com`）へリダイレクトする方式に切り替える

## 2. middlewareでの保護ルート設定例

```ts
// quiznavi/src/middleware.ts
import { withRootAccount } from '@rootlab/account-sdk/middleware'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return withRootAccount(request, {
    url: process.env.NEXT_PUBLIC_ROOT_ACCOUNT_URL!,
    anonKey: process.env.NEXT_PUBLIC_ROOT_ACCOUNT_ANON_KEY!,
    cookieDomain: process.env.ROOT_ACCOUNT_COOKIE_DOMAIN!,
    accountsLoginUrl: 'https://accounts.astro-root.com/login',
    // 大会作成のような博士限定機能を保護する場合:
    // requiredPlan: 'doctor',
    // upgradeUrl: 'https://accounts.astro-root.com/upgrade',
  })
}

export const config = {
  matcher: ['/tournaments/new', '/admin/:path*'],
}
```

## 3. プラン判定をコンポーネント内で使う例

```ts
import { decodeEntitlements, hasPlan } from '@rootlab/account-sdk'

const { data: { session } } = await supabase.auth.getSession()
const entitlements = session ? decodeEntitlements(session.access_token) : null

if (hasPlan(entitlements, 'doctor')) {
  // AI機能を表示
}
```

DBへの追加問い合わせは発生しない。JWTのカスタムクレームを見るだけ。

## 4. Stripe Checkoutセッション作成時の注意

`root_user_id`をStripeのsubscriptionメタデータに必ず含めること。これが無いとWebhookが
どのユーザーのプランを更新すればいいか分からず同期されない。

```ts
await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer_email: user.email,
  line_items: [{ price: priceId, quantity: 1 }],
  subscription_data: {
    metadata: { root_user_id: user.id },
  },
  success_url: 'https://accounts.astro-root.com/billing/success',
  cancel_url: 'https://accounts.astro-root.com/billing',
})
```

## 5. 移行ロールアウトの順序（再掲）

1. Root Accountプロジェクトを本番作成し、`supabase db push`でマイグレーション適用
2. Auth Hookをダッシュボードで有効化し、テストユーザーでJWTに`plan`クレームが載ることを確認
3. `apps/accounts`（ログイン/プロフィール/課金ポータル）を`accounts.astro-root.com`にデプロイ
4. QuizNaviを`feature/root-account-sso`ブランチで統合し、ステージング環境で検証
5. 既存QuizNaviユーザーへの移行メール送付 → 段階的切り替え
6. 問題なければめくるも同様に統合
