# 開発ルール

このプロジェクトはGitHub上でIssue駆動・PRベースの開発を行う。ClaudeCodeは以下のルールを**例外なく**厳密に守ること。

## 1. Issue駆動

- 実装作業(機能追加・修正・設定変更など)を始める前に、必ず対応するGitHub Issueを作成する(`gh issue create`)。
- Issueには「何を」「なぜ」行うのかを簡潔に記載する。

## 2. ブランチ命名規則

`種別/issue番号-概要` の形式(kebab-case、英語)で作成する。

- `feature/12-add-card-api` — 新機能
- `fix/15-login-bug` — バグ修正
- `chore/20-update-deps` — 雑務・設定変更
- `docs/22-update-readme` — ドキュメント更新

## 3. mainへの直接push禁止

- 常にIssue用のブランチ上で作業する。`main` ブランチへの直接コミット・直接pushは行わない。
- リポジトリ側でも `main` ブランチ保護ルールにより、所有者を含め直接pushが技術的に禁止されている。

## 4. PRフロー

1. Issue用ブランチを作成
2. 実装
3. `gh pr create` でPRを作成し、本文にIssueをリンクする語句(例: `Closes #12`)を含める
4. PRをマージして完了

単独開発のためレビュー承認は必須ではないが、PRを経由するプロセス自体は必須。

## 関連ドキュメント

- 要件定義: [docs/requirements.md](docs/requirements.md)
- 基本設計: [docs/basic-design.md](docs/basic-design.md)
