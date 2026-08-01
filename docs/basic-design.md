# タスク管理アプリケーション 基本設計書

## 改訂履歴

| 版数 | 日付       | 内容               | 作成者 |
|------|-----------|--------------------|--------|
| 0.1  | 2026-07-31 | 技術スタックを選定・記載 | ー     |
| 0.2  | 2026-07-31 | Java・Spring Bootのバージョンを最新（Java 25 LTS / Spring Boot 4.1.x）に更新 | ー     |
| 0.3  | 2026-07-31 | フロントエンド環境構築に伴い、技術スタックを確定版（Tailwind CSS採用、TypeScript 6.x固定、@dnd-kit旧世代採用）に更新 | ー     |
| 0.4  | 2026-07-31 | タスクAPI（一覧・検索）実装およびカンバンボード（読み取り専用）実装を踏まえ、API設計・DB物理設計・ディレクトリ構成を追記 | ー     |
| 0.5  | 2026-08-01 | タスク作成API（POST /tasks）およびカンバンボードへのタスク追加モーダルを実装したことを踏まえ、API設計を追記 | ー     |

---

## 目次

- [1. 技術スタック](#1-技術スタック)
  - [1.1 バックエンド](#11-バックエンド)
  - [1.2 フロントエンド](#12-フロントエンド)
  - [1.3 データベース・インフラ](#13-データベースインフラ)
- [2. API設計](#2-api設計)
- [3. DB物理設計](#3-db物理設計)
- [4. ディレクトリ構成](#4-ディレクトリ構成)
- [5. 今後追記する予定の項目](#5-今後追記する予定の項目)

---

## 1. 技術スタック

[要件定義書](requirements.md) の想定利用者（個人・単一ユーザー・単一カンバン）を踏まえ、
学習課題として扱いやすく、かつ実務でも通用する標準的な構成を選定する。

### 1.1 バックエンド

| 項目 | 選定 | 選定理由 |
|------|------|----------|
| 言語／ランタイム | Java 25（最新LTS、2025年9月リリース） | 選定時点(2026-07-31)で最新の長期サポート版。学習・保守の両面で安定している |
| フレームワーク | Spring Boot 4.1.x（2026年6月リリース時点の最新） | Java/Springでのデファクトスタンダード。DI・自動設定により最小構成で REST API を構築できる。Java 17以上が必須でJava 26まで対応しており、Java 25と組み合わせ可能 |
| ビルドツール | Gradle（Groovy DSL） | 指定 |
| Web | Spring Web（REST API, JSON） | フロントエンド（React）とはREST + JSONで疎結合に連携する |
| ORM／永続化 | Spring Data JPA + Hibernate | List/Taskのようなシンプルなリレーショナルモデルに対し、ボイラープレートの少ないリポジトリ実装が可能 |
| マイグレーション | Flyway | スキーマ変更をバージョン管理し、変更履歴を学習課題として残せる |
| バリデーション | spring-boot-starter-validation | タイトル必須・優先度enumなど入力チェックを宣言的に実装できる |
| API仕様書 | springdoc-openapi（Swagger UI） | フロントエンドと分離開発する際に、API仕様をブラウザから確認・試行できる |
| ボイラープレート削減 | Lombok（任意） | Getter/Setter等の定型コードを削減。素のJavaで書く学習を優先する場合は未使用でも良い |
| テスト | JUnit 5, Spring Boot Test, Testcontainers | Testcontainersにより本物のPostgreSQLに対する統合テストを行い、DB方言差異による不具合を防ぐ |

### 1.2 フロントエンド

| 項目 | 選定 | 選定理由 |
|------|------|----------|
| ビルドツール／言語 | Vite + TypeScript 6.x | Viteは指定。TypeScriptは2026年7月に安定版となった7.0系がtypescript-eslintと非互換（型認識ルールが動作しない）のため、6.x系最新（6.0.3）に固定 |
| パッケージマネージャ | npm | 追加ツール不要で最も標準的 |
| HTTPクライアント | axios（fetchでも可） | インターセプターやエラーハンドリングの記述がfetchより簡潔 |
| ドラッグ&ドロップ | @dnd-kit（core / sortable / utilities） | react-beautiful-dndはメンテナンス終了のため後継として採用。新世代パッケージ（@dnd-kit/react等）も存在するがv0.x段階かつ情報量が少ないため、実績のある旧世代構成を採用 |
| サーバー状態管理 | TanStack Query（React Query） v5系 | カード一覧の取得・キャッシュ・再取得（並び替え反映等）をシンプルに扱える |
| スタイリング | Tailwind CSS v4系 | 学習教材（動画）に合わせて採用。プロトタイプ（`prototype/`配下）のCSSはそのまま踏襲せず、Tailwindへ移行 |
| Lint/Format | ESLint（typescript-eslint含む） + Prettier | コード品質・フォーマットの統一。Vite最新テンプレートは既定でoxlintを採用しているが、本プロジェクトではカスタムルールの豊富さを優先しESLintに変更 |

### 1.3 データベース・インフラ

| 項目 | 選定 | 選定理由 |
|------|------|----------|
| データベース | PostgreSQL | 指定。学習課題としても実務でも広く使われるRDBMS |
| ローカル起動方法 | Docker Compose | ローカル環境を汚さずPostgreSQLを起動・破棄できる |
| 環境切り替え | Spring Profiles（dev/prod）+ application.yml | 開発・本番でDB接続情報等を切り替える標準的な方法 |

## 2. API設計

現時点では[要件定義書](requirements.md)の◎項目のうち、タスク一覧・検索（読み取り）およびタスク作成を実装済み。
更新・削除・並び替えのAPIは今後実装予定。

ベースURL: `http://localhost:8080/api`

### 2.1 エンドポイント一覧

| メソッド | パス | 概要 |
|---------|------|------|
| GET | `/tasks` | タスク一覧を取得する。`status`クエリパラメータで絞り込み可能 |
| GET | `/tasks/{id}` | タスクを1件取得する |
| POST | `/tasks` | タスクを1件作成する |

### 2.2 GET /tasks

| クエリパラメータ | 必須 | 内容 |
|-------------------|------|------|
| status | 任意 | `TODO` / `IN_PROGRESS` / `DONE` のいずれか。省略時は全件返却 |

レスポンス例（200 OK）:

```json
[
  {
    "id": 1,
    "status": "TODO",
    "title": "設計書を書く",
    "description": "API設計とDB物理設計をまとめる",
    "dueDate": "2026-08-05",
    "priority": "HIGH",
    "position": 0,
    "createdAt": "2026-07-31T10:00:00",
    "updatedAt": "2026-07-31T10:00:00"
  }
]
```

### 2.3 GET /tasks/{id}

レスポンス例（200 OK）は上記オブジェクトの単一版。存在しない`id`を指定した場合は`404 Not Found`（本文はエラーメッセージの文字列）を返す。

### 2.4 POST /tasks

リクエストボディ:

| フィールド | 必須 | 内容 |
|-----------|------|------|
| title | 必須 | タスク名（最大255文字） |
| description | 任意 | 詳細説明 |
| dueDate | 任意 | 期限日（`YYYY-MM-DD`） |
| priority | 必須 | `HIGH`／`MEDIUM`／`LOW` |
| status | 任意（省略時`TODO`） | `TODO`／`IN_PROGRESS`／`DONE` |

`position`はリクエストボディで指定不可。同一`status`内の既存タスクの最大`position`+1（存在しない場合は0）をサーバー側で算出する。`id`／`createdAt`／`updatedAt`もサーバー側で自動設定する。

リクエスト例:

```json
{
  "title": "設計書を書く",
  "description": "API設計とDB物理設計をまとめる",
  "dueDate": "2026-08-05",
  "priority": "HIGH",
  "status": "TODO"
}
```

レスポンス例（201 Created）は2.2節のオブジェクトと同形式（`position`はサーバー算出値）。

バリデーションエラー（`title`未入力、`priority`不正値など）の場合は`400 Bad Request`（本文はエラーメッセージの文字列）を返す。

### 2.5 API仕様書（Swagger UI）

springdoc-openapiにより、バックエンド起動後に以下で仕様を確認・試行できる。

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI定義: `http://localhost:8080/v3/api-docs`

## 3. DB物理設計

[要件定義書 6章](requirements.md#6-データ項目確定)のデータ項目を踏まえ、Flywayマイグレーション（`backend/src/main/resources/db/migration/V1__create_task_table.sql`）で以下のテーブルを作成する。

### 3.1 task テーブル

| カラム | 型 | 制約 | 備考 |
|--------|----|----|------|
| id | BIGINT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | 自動採番 |
| status | VARCHAR(20) | NOT NULL, CHECK (`TODO` / `IN_PROGRESS` / `DONE`) | 固定3列を表す |
| title | VARCHAR(255) | NOT NULL | タスク名 |
| description | TEXT | | 詳細説明 |
| due_date | DATE | | 期限日 |
| priority | VARCHAR(10) | NOT NULL, CHECK (`HIGH` / `MEDIUM` / `LOW`) | 優先度 |
| position | INTEGER | NOT NULL | リスト内の表示順 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() | 更新日時 |

インデックスは現時点では主キー（`id`）のみ。今後、`status`＋`position`での一覧取得が増える場合は複合インデックスの追加を検討する。

開発環境では、上記マイグレーションに続けて`db/dev-seed/V2__seed_dev_data.sql`（`dev`プロファイル限定で読み込まれる）によりサンプルデータを投入する。

## 4. ディレクトリ構成

### 4.1 バックエンド（`backend/`）

```
backend/src/main/java/com/example/taskmanagement/
├── TaskmanagementApplication.java   # エントリポイント
├── config/
│   └── WebConfig.java               # CORS等の共通設定
└── task/                            # タスク機能のパッケージ（Controller/Service/Repository/Entity）
    ├── Task.java                    # JPAエンティティ
    ├── TaskStatus.java / Priority.java  # enum
    ├── TaskController.java          # REST API
    ├── TaskService.java             # ユースケース
    ├── TaskRepository.java          # Spring Data JPAリポジトリ
    ├── TaskResponse.java            # レスポンスDTO
    ├── TaskNotFoundException.java
    └── GlobalExceptionHandler.java  # 例外→HTTPレスポンス変換
backend/src/main/resources/
├── application.yml                  # dev/prodプロファイル設定
└── db/
    ├── migration/                   # Flywayマイグレーション（本番にも適用）
    └── dev-seed/                    # 開発環境限定のサンプルデータ投入
```

現状は「タスク」という単一ドメインのみのため、レイヤー単位（controller/service/repository）ではなく`task`パッケージにまとめる機能単位（package-by-feature）構成としている。ドメインが増えた場合はこの単位で追加する。

### 4.2 フロントエンド（`frontend/`）

```
frontend/src/
├── main.tsx           # エントリポイント（TanStack Query の QueryClientProvider を設定）
├── App.tsx            # ルートコンポーネント
├── components/
│   ├── Board.tsx       # カンバンボード全体（3列を並べる）
│   ├── BoardColumn.tsx # 1列分（未着手／進行中／完了）
│   └── TaskCard.tsx    # タスク1件分のカード表示
├── hooks/
│   └── useTasks.ts     # TanStack Query によるタスク一覧取得フック
├── api/
│   ├── client.ts        # axiosインスタンス（baseURL設定）
│   └── tasks.ts          # タスクAPI呼び出し関数
└── types/
    └── task.ts           # Task型・TaskStatus型・Priority型
```

## 5. 今後追記する予定の項目

本書は基本設計フェーズの成果物を追記していく前提の器として作成した。今後、以下を追記予定。

- タスクの更新・削除・並び替えAPI（ドラッグ&ドロップ対応）の設計
- カード詳細のフロントエンド設計
