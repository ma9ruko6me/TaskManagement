# タスク管理アプリケーション 基本設計書

## 改訂履歴

[改訂履歴はこちら](basic-design-changelog.md)

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
| ORM／永続化 | Spring Data JPA + Hibernate | Taskのようなシンプルなリレーショナルモデルに対し、ボイラープレートの少ないリポジトリ実装が可能 |
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
| ドラッグ&ドロップ | HTML5 Drag and Drop API（ネイティブ） | カード・列単位の並び替えという要件に対し外部ライブラリは必須ではないため、`draggable`属性とネイティブのdrag系イベント（`dragstart`/`dragover`/`drop`等）で実装し依存を増やさない |
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

[要件定義書](requirements.md)の◎項目に対応するタスクの一覧・検索・作成・更新・並び替え・削除（ゴミ箱／復元／完全削除）・完了アーカイブ表示を実装済み。

ベースURL: `http://localhost:8080/api`

### 2.1 エンドポイント一覧

| メソッド | パス | 概要 |
|---------|------|------|
| GET | `/tasks` | タスク一覧を取得する。`status`クエリパラメータで絞り込み可能（削除済み・アーカイブ済みは含まない） |
| GET | `/tasks/{id}` | タスクを1件取得する |
| GET | `/tasks/trash` | ゴミ箱（削除済み）タスクの一覧を取得する |
| GET | `/tasks/completed` | 完了タスクのアーカイブ一覧を取得する |
| POST | `/tasks` | タスクを1件作成する |
| PUT | `/tasks/{id}` | タスクを1件更新する |
| PATCH | `/tasks/{id}/position` | タスクの`status`・`position`を更新する（列間ドラッグ&ドロップ） |
| PUT | `/tasks/order` | 同一列内のタスクを指定した順序に並び替える |
| DELETE | `/tasks/{id}` | タスクを削除する（論理削除、ゴミ箱に移動） |
| POST | `/tasks/{id}/restore` | ゴミ箱のタスクを復元する |
| DELETE | `/tasks/{id}/permanent` | タスクを完全削除する |

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
    "updatedAt": "2026-07-31T10:00:00",
    "deletedAt": null,
    "completedAt": null,
    "archivedAt": null
  }
]
```

`deletedAt`／`completedAt`／`archivedAt`は、それぞれ論理削除（ゴミ箱）・完了・アーカイブへの移動が行われるまでは`null`を返す。

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

### 2.5 PUT /tasks/{id}

リクエストボディ:

| フィールド | 必須 | 内容 |
|-----------|------|------|
| title | 必須 | タスク名（最大255文字） |
| description | 任意 | 詳細説明 |
| dueDate | 任意 | 期限日（`YYYY-MM-DD`） |
| priority | 必須 | `HIGH`／`MEDIUM`／`LOW` |
| status | 必須 | `TODO`／`IN_PROGRESS`／`DONE` |

`id`／`position`／`createdAt`／`updatedAt`はリクエストボディで指定不可。レスポンスは2.2節のオブジェクトと同形式。存在しない`id`を指定した場合は`404 Not Found`を返す。

### 2.6 PATCH /tasks/{id}/position

カンバン上での列間ドラッグ&ドロップにより、タスクの所属列（`status`）と列内の挿入位置（`position`）を更新する。

リクエストボディ:

| フィールド | 必須 | 内容 |
|-----------|------|------|
| status | 必須 | 移動先の`TODO`／`IN_PROGRESS`／`DONE` |
| position | 必須 | 移動先列内での挿入位置（0以上の整数） |

レスポンスは2.2節のオブジェクトと同形式。

### 2.7 PUT /tasks/order

同一列内でのドラッグ&ドロップによる並び替え。指定した`taskIds`の順序どおりに、対象タスク群の`position`を振り直す。

リクエストボディ:

| フィールド | 必須 | 内容 |
|-----------|------|------|
| taskIds | 必須（1件以上） | 並び替え後の順序で並べたタスクIDの配列 |

レスポンス（200 OK）は更新後のタスク一覧（2.2節のオブジェクトの配列）。

### 2.8 DELETE /tasks/{id} ／ POST /tasks/{id}/restore ／ DELETE /tasks/{id}/permanent

タスクの削除は論理削除で、削除時点で`deletedAt`が設定されゴミ箱（`GET /tasks/trash`）に表示される。

| メソッド | パス | 内容 |
|---------|------|------|
| DELETE | `/tasks/{id}` | タスクを論理削除する（`204 No Content`） |
| POST | `/tasks/{id}/restore` | ゴミ箱のタスクを復元し、`deletedAt`をクリアする（`200 OK`、更新後のタスクを返す） |
| DELETE | `/tasks/{id}/permanent` | タスクをデータベースから完全に削除する（`204 No Content`、復元不可） |

いずれも存在しない`id`を指定した場合は`404 Not Found`を返す。

### 2.9 GET /tasks/completed

タスクを`DONE`に更新すると`completedAt`が設定される。`archivedAt`が未設定かつ`status`が`DONE`のタスクは、毎日4:00（`TaskCompletedArchiveScheduler`、cron `0 0 4 * * *`）に無条件でアーカイブ対象となり`archivedAt`が設定される。アーカイブ後は通常のボード表示（`GET /tasks`）からは除外され、本エンドポイントの一覧にのみ表示される。

ゴミ箱・アーカイブそれぞれについて、以下のスケジュールで保持期間経過後のデータを自動的に完全削除する（`application.yml`の`task.trash.retention-days` / `task.archive.retention-days`、いずれも既定30日）。

| 対象 | 保持期間 | 実行スケジュール（cron） | 実行クラス |
|------|---------|--------------------------|-----------|
| ゴミ箱（論理削除） | 30日 | `0 0 3 * * *`（毎日3:00） | `TaskTrashPurgeScheduler` |
| 完了アーカイブ | 30日 | `0 10 4 * * *`（毎日4:10） | `TaskArchivePurgeScheduler` |

### 2.10 API仕様書（Swagger UI）

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
| deleted_at | TIMESTAMP | | 論理削除日時（ゴミ箱移動、`V3`で追加） |
| completed_at | TIMESTAMP | | 完了（`DONE`）日時（`V4`で追加） |
| archived_at | TIMESTAMP | | 完了アーカイブへの移動日時（`V4`で追加） |

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
├── main.tsx                       # エントリポイント（TanStack Query の QueryClientProvider を設定）
├── App.tsx                        # ルートコンポーネント
├── components/
│   ├── Board.tsx                   # カンバンボード全体（3列を並べる、ドラッグ&ドロップ制御）
│   ├── BoardColumn.tsx             # 1列分（未着手／進行中／完了）
│   ├── TaskCard.tsx                # タスク1件分のカード表示
│   ├── TaskFormModal.tsx           # タスクの作成・編集モーダル
│   ├── ConfirmDialog.tsx           # 削除等の確認ダイアログ
│   ├── TrashView.tsx               # ゴミ箱（削除済みタスク）一覧
│   ├── TrashTaskDetailModal.tsx    # ゴミ箱タスクの詳細（復元・完全削除）
│   ├── CompletedView.tsx           # 完了タスクのアーカイブ一覧
│   └── CompletedTaskDetailModal.tsx # 完了アーカイブタスクの詳細
├── hooks/                          # TanStack Query によるAPI呼び出しフック（一覧取得・作成・更新・削除・復元・並び替え等）
├── api/
│   ├── client.ts                   # axiosインスタンス（baseURL設定）
│   └── tasks.ts                    # タスクAPI呼び出し関数
├── constants/                      # status・priorityの表示ラベル等
├── utils/                          # 並び替え等のユーティリティ関数
└── types/
    └── task.ts                     # Task型・TaskStatus型・Priority型
```

## 5. 今後追記する予定の項目

本書は基本設計フェーズの成果物を追記していく前提の器として作成した。要件定義書の◎項目に対応する主要機能は実装済みのため、今後は運用・改善に応じて随時追記する。
