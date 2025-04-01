CREATE TABLE
  IF NOT EXISTS user (
    id INTEGER PRIMARY KEY NOT NULL,
    open_id TEXT UNIQUE NOT NULL,
    nick_name TEXT,
    avatar_url TEXT,
    gender INTEGER,
    country TEXT,
    province TEXT,
    city TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

-- 如果SQLite版本≥3.25.0，可以直接重命名字段
ALTER TABLE user
RENAME COLUMN name TO nick_name;

-- 添加新列
ALTER TABLE user
ADD COLUMN avatar_url TEXT;

ALTER TABLE user
ADD COLUMN gender INTEGER;

ALTER TABLE user
ADD COLUMN country TEXT;

ALTER TABLE user
ADD COLUMN province TEXT;

ALTER TABLE user
ADD COLUMN city TEXT;

ALTER TABLE user
ADD COLUMN updated_at TIMESTAMP;
