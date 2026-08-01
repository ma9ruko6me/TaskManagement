# 基本設計書 改訂履歴

[基本設計書](basic-design.md)の改訂履歴。

| 版数 | 日付       | 内容               | 作成者 |
|------|-----------|--------------------|--------|
| 0.1  | 2026-07-31 | 技術スタックを選定・記載 | ー     |
| 0.2  | 2026-07-31 | Java・Spring Bootのバージョンを最新（Java 25 LTS / Spring Boot 4.1.x）に更新 | ー     |
| 0.3  | 2026-07-31 | フロントエンド環境構築に伴い、技術スタックを確定版（Tailwind CSS採用、TypeScript 6.x固定、@dnd-kit旧世代採用）に更新 | ー     |
| 0.4  | 2026-07-31 | タスクAPI（一覧・検索）実装およびカンバンボード（読み取り専用）実装を踏まえ、API設計・DB物理設計・ディレクトリ構成を追記 | ー     |
| 0.5  | 2026-08-01 | タスク作成API（POST /tasks）およびカンバンボードへのタスク追加モーダルを実装したことを踏まえ、API設計を追記 | ー     |
| 0.6  | 2026-08-01 | タスクの更新・並び替え（PUT /tasks/{id}, PATCH /tasks/{id}/position, PUT /tasks/order）、削除・ゴミ箱・復元・完全削除（DELETE /tasks/{id}, GET /tasks/trash, POST /tasks/{id}/restore, DELETE /tasks/{id}/permanent）、完了タスクアーカイブ（GET /tasks/completed）の実装を踏まえ、API設計・ディレクトリ構成を更新。ドラッグ&ドロップの実装方式を@dnd-kitからHTML5ネイティブDrag and Drop APIに訂正 | ー     |
