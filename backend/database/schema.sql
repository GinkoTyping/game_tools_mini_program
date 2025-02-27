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
    activity_type TEXT,
    role TEXT,
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

CREATE TABLE
  IF NOT EXISTS wow_bis (
    id INTEGER PRIMARY KEY,
    role_class TEXT NOT NULL,
    class_spec TEXT NOT NULL,
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version TEXT,
    stats_priority TEXT NOT NULL,
    ratings TEXT NOT NULL,
    bis_items TEXT NOT NULL,
    bis_trinkets TEXT NOT NULL,
    access_count INTEGER DEFAULT 0,
    sort INTEGER DEFAULT 0,
    spec_sort INTEGER DEFAULT 0
  )