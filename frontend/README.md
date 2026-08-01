# TaskManagement Frontend

TaskManagementのフロントエンド。React + Vite + TypeScriptで構築したカンバンボードUI。バックエンド（Spring Boot, `http://localhost:8080`）のREST APIと連携する。全体像は[ルートREADME](../README.md)、技術選定の詳細は[docs/basic-design.md](../docs/basic-design.md)を参照。

## セットアップ・起動

バックエンド（ポート8080）が起動している状態で、以下を実行する。

```bash
npm install
npm run dev
```

`http://localhost:5173/` にアクセスするとカンバンボードが表示される。バックエンドの起動方法はルートREADMEを参照。

## npm scripts

| コマンド | 内容 |
|---------|------|
| `npm run dev` | 開発サーバーを起動（Vite, ポート5173） |
| `npm run build` | 型チェック（`tsc -b`）を行い本番ビルドを生成 |
| `npm run lint` | ESLintでコードを検査 |
| `npm run format` | Prettierでコードを整形 |
| `npm run preview` | 本番ビルドをローカルでプレビュー |

## 主な依存関係

| 種別 | 内容 |
|------|------|
| フレームワーク | React 19 |
| ビルドツール | Vite |
| 言語 | TypeScript（~6.0.3固定。typescript-eslintとの互換性のため7.0系は未使用） |
| サーバー状態管理 | TanStack Query v5 |
| HTTPクライアント | axios |
| スタイリング | Tailwind CSS v4 |
| Lint/Format | ESLint（typescript-eslint含む）+ Prettier |

## ディレクトリ構成

主要なソースは`src/`配下。コンポーネント・フック・API呼び出し・型定義の構成は[docs/basic-design.md 4.2節](../docs/basic-design.md#42-フロントエンドfrontend)を参照。
