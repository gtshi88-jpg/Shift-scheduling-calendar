# Supabase 運用メモ

## 初期構築

1. Supabase プロジェクト作成
2. `supabase/schema.sql` の SQL を SQL Editor で実行
3. `.env.local` に接続情報を設定

必要な環境変数:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 接続確認手順（開発環境）

1. `npm run dev` を実行
2. カレンダー画面でシフト表示を確認
3. データの作成・更新を実施
4. 再読み込み後もデータが残ることを確認

## 運用時の注意

- `SUPABASE_SERVICE_ROLE_KEY` は機密情報として扱う
- キーを変更した場合は `.env.local` を更新し再起動する
- スキーマ変更時は、変更 SQL と実行日を必ず記録する

## スキーマ変更ログ（テンプレート）

- YYYY-MM-DD
  - 目的:
  - 変更内容:
  - 実行 SQL ファイル:
  - 影響範囲:
  - ロールバック方針:

## 障害時メモ（テンプレート）

- 発生日:
- 事象:
- 原因:
- 応急対応:
- 恒久対応:

