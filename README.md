# TaskManagement

Trello風のカンバン方式によるタスク管理Webアプリケーション。個人（単一ユーザー・単一カンバン）での利用を前提に、学習課題として開発している。

「未着手／進行中／完了」の固定3列でタスク（カード）を管理し、ドラッグ&ドロップでの並び替えを行えることを目指す。詳細な背景・機能要件は [docs/requirements.md](docs/requirements.md) を参照。

## ドキュメント

| ドキュメント | 内容 |
|--------------|------|
| [docs/requirements.md](docs/requirements.md) | 要件定義書。想定利用者、機能要件、データ項目・ER図など |
| [docs/basic-design.md](docs/basic-design.md) | 基本設計書。技術スタック、API設計、DB物理設計、ディレクトリ構成 |

## 技術スタック

| 領域 | 技術 |
|------|------|
| バックエンド | Java 25 (LTS) / Spring Boot 4.1.x / Gradle / Spring Data JPA / Flyway |
| フロントエンド | React 19 / Vite / TypeScript 6.x / Tailwind CSS v4 / TanStack Query / @dnd-kit |
| データベース | PostgreSQL 17（Docker Compose で起動） |

選定理由の詳細は [docs/basic-design.md](docs/basic-design.md) を参照。

## ディレクトリ構成

```
.
├── backend/    # Spring Boot（REST API）
├── frontend/   # React + Vite（画面）
├── docs/       # 要件定義書・基本設計書
└── prototype/  # 画面確認用のHTML/CSS/JSプロトタイプ
```

バックエンド・フロントエンドそれぞれの内部構成は [docs/basic-design.md 4章](docs/basic-design.md#4-ディレクトリ構成) を参照。

## セットアップ

### 前提

- Java 25
- Node.js（npm）
- Docker（PostgreSQLをコンテナで起動するため）

### 1. データベースの起動

```bash
cd backend
docker compose up -d
```

`backend/compose.yaml` により、PostgreSQL 17 がポート `5432` で起動する（DB名・ユーザー名・パスワードは `taskmanagement` / `taskmanagement` / `secret`）。

### 2. バックエンドの起動（ポート8080）

```bash
cd backend
./gradlew bootRun
```

起動後、以下で疎通確認・API仕様確認ができる。

- ヘルスチェック: `http://localhost:8080/actuator/health`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. フロントエンドの起動（ポート5173）

```bash
cd frontend
npm install
npm run dev
```

`http://localhost:5173/` にアクセスするとカンバンボードが表示される。

> [!IMPORTANT]
> フロントエンドは `http://localhost:8080` （既定ポート）のバックエンドにAPIリクエストする構成のため、両方とも既定ポート（バックエンド`8080`／フロントエンド`5173`）で起動すること。ポート競合時に別ポートへフォールバックしたまま起動すると、通信が成立せず正しく動作しない。詳細は `.claude/skills/run-servers/SKILL.md` を参照。

## API

現時点ではタスク一覧・検索（読み取り）のみ実装済み。

| メソッド | パス | 概要 |
|---------|------|------|
| GET | `/api/tasks` | タスク一覧を取得（`status`クエリパラメータで絞り込み可能） |
| GET | `/api/tasks/{id}` | タスクを1件取得 |

詳細（レスポンス例など）は [docs/basic-design.md 2章](docs/basic-design.md#2-api設計) を参照。

## 開発ルール

Issue駆動・PRベースの開発フローに従う。詳細は [CLAUDE.md](CLAUDE.md) を参照。
