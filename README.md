# root-account

るーとの研究室 ブランド全体の共通アカウント基盤（フェーズ0: PoC）。

Supabase Authを唯一の認証ソースとし、プロフィール・研究ポイント・バッジ・サブスクリプションを
一元管理する。各サービス(QuizNavi/めくる/Q-Room等)はこのプロジェクトが発行するJWTを検証するだけで、
DBへの追加問い合わせなしに「そのユーザーがどのプランか」を判定できる。

設計の背景・意思決定理由は `docs/architecture-review.md`（元レポート）を参照。

## ディレクトリ構成

```
supabase/
  migrations/
    0001_core_schema.sql   ← profiles / subscriptions / badges
    0002_auth_hook.sql     ← JWTにplanクレームを埋め込むCustom Access Token Hook
  functions/
    stripe-webhook/        ← StripeイベントをsubscriptionsテーブルにSync
  config.toml               ← Auth Hookの有効化設定含む

packages/
  sdk/                      ← 各サービスから使う @rootlab/account-sdk

docs/
  integration-guide.md      ← QuizNavi/めくるからの接続手順
```

## セットアップ（ローカル検証）

```bash
supabase start
supabase db push
# ダッシュボード(またはconfig.toml)でCustom Access Token Hookを有効化
```

## 現在のステータス: フェーズ0（基盤構築）

- [x] コアスキーマ（profiles / subscriptions / badges）
- [x] Custom Access Token Hook
- [x] Stripe Webhook Edge Function（スケルトン、価格ID要設定）
- [x] SDKパッケージ骨格（@rootlab/account-sdk）
- [ ] apps/accounts（ログイン/プロフィール/課金ポータルUI）
- [ ] QuizNavi統合（feature/root-account-sso ブランチ）
- [ ] めくる統合
- [ ] Q-Room主催者アカウント統合

## ブランチ運用

このリポジトリでは機能ごとに `feature/*` ブランチを切り、`main` へまとめてマージする運用とする。
現在の作業は `feature/phase0-foundation` ブランチ。
