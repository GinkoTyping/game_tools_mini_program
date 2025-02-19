-- SQLite
CREATE TABLE
  IF NOT EXISTS access_count (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time TIMESTAMP CURRENT_TIME,
    visit_count INTEGER DEFAULT 0
  );

CREATE TABLE
  IF NOT EXISTS wow_tier_list (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tier_data TEXT
  );

CREATE TABLE
  IF NOT EXISTS wow_home_view (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time TEXT,
    carousels TEXT,
    tier_lists TEXT,
    hot_topics TEXT
  );