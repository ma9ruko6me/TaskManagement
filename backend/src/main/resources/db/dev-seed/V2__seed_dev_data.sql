INSERT INTO task (status, title, description, due_date, priority, position) VALUES
    ('TODO', '要件定義書のレビュー', '記載漏れがないか確認する', '2026-08-05', 'HIGH', 1),
    ('TODO', 'DB設計の見直し', 'インデックス設計を検討する', '2026-08-10', 'MEDIUM', 2),
    ('TODO', '買い物リストの作成', NULL, NULL, 'LOW', 3),
    ('IN_PROGRESS', 'タスク検索APIの実装', 'GET /api/tasks, GET /api/tasks/{id}', '2026-08-01', 'HIGH', 1),
    ('IN_PROGRESS', 'Flywayマイグレーションの整理', NULL, NULL, 'MEDIUM', 2),
    ('DONE', 'PostgreSQL接続設定', 'compose.yamlとapplication.ymlを追加', '2026-07-20', 'HIGH', 1),
    ('DONE', 'Taskエンティティの作成', NULL, '2026-07-22', 'MEDIUM', 2);
