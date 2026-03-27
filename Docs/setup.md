# セットアップ手順

## 前提

- Node.js と npm が使えること
- このリポジトリをローカルに clone 済みであること

## 初回セットアップ

1. 依存関係をインストール

```bash
npm install
```

2. 環境変数ファイルを作成

```bash
cp .env.example .env.local
```

3. `.env.local` に必要値を設定

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- 必要に応じて認証系環境変数
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
  - `MEMBER_USERNAME`
  - `MEMBER_PASSWORD`
  - `SESSION_SECRET`

4. 開発サーバー起動

```bash
npm run dev
```

5. ブラウザで確認

- `http://localhost:3000`

## 日常の起動手順

```bash
npm run dev
```

## よく使うコマンド

```bash
npm run dev
npm run build
npm run start
```

## 作業メモテンプレート

- 日付:
- ブランチ:
- 実施内容:
- ハマった点:
- 次回やること:

