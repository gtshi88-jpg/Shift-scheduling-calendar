# 認証仕様メモ

## 権限の考え方

- Admin: シフト編集・スタッフ管理が可能
- Member: 閲覧のみ（読み取り専用）

## ローカル開発時の初期認証情報

- Admin: `admin` / `admin1234`
- Member: `member` / `member1234`

## 環境変数での上書き

以下の環境変数でログイン情報を差し替え可能:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `MEMBER_USERNAME`
- `MEMBER_PASSWORD`
- `SESSION_SECRET`

## 運用メモ

- 本番相当環境では初期値を使わない
- `SESSION_SECRET` は十分に長いランダム文字列を使用する
- 認証情報はコードやドキュメントに平文で残さない

## 変更時チェックリスト

- [ ] Admin / Member の両方でログイン確認
- [ ] 権限差分（編集可否）が期待通りか確認
- [ ] 既存セッションへの影響を確認
- [ ] `.env.local` の更新漏れがないか確認

## 作業ログ

- YYYY-MM-DD:
  - 変更内容:
  - 確認結果:
  - 補足:

