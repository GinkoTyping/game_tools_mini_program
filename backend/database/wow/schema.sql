-- SQLite
-- access_count
CREATE TABLE
  IF NOT EXISTS access_count (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time TIMESTAMP CURRENT_TIME,
    visit_count INTEGER DEFAULT 0
  );

-- wow_tier_list
CREATE TABLE
  IF NOT EXISTS wow_tier_list (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id TEXT,
    activity_type TEXT,
    role TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tier_data TEXT
  );

-- wow_home_view
CREATE TABLE
  IF NOT EXISTS wow_home_view (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time TEXT,
    carousels TEXT,
    tier_lists TEXT,
    hot_topics TEXT
  );

-- wow_bis
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
    talents TEXT,
    bis_items TEXT NOT NULL,
    bis_trinkets TEXT NOT NULL,
    access_count INTEGER DEFAULT 0,
    sort INTEGER DEFAULT 0,
    spec_sort INTEGER DEFAULT 0
  );

-- wow_dungeon
CREATE TABLE
  IF NOT EXISTS wow_dungeon (
    id INTEGER PRIMARY KEY NOT NULL,
    journal_id INTEGER NOT NULL,
    name_zh TEXT NOT NULL,
    name_en TEXT NOT NULL,
    bosses TEXT
  );

-- wow_mythic_dungeon
CREATE TABLE
  IF NOT EXISTS wow_mythic_dungeon (
    id INTEGER PRIMARY KEY NOT NULL,
    routes TEXT NOT NULL,
    ratings TEXT NOT NULL,
    utility_needs TEXT NOT NULL,
    enemy_tips TEXT NOT NULL,
    loot_pool TEXT NOT NULL,
    FOREIGN KEY (id) REFERENCES wow_dungeon (id)
  );