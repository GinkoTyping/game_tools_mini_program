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
    detailed_stats_priority TEXT,
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

CREATE TABLE
  IF NOT EXISTS wow_mythic_dungeon_tier (
    id INTEGER PRIMARY KEY NOT NULL,
    tier TEXT NOT NULL,
    FOREIGN KEY (id) REFERENCES wow_dungeon (id)
  );

CREATE TABLE
  IF NOT EXISTS wow_playable_class (
    id INTEGER PRIMARY KEY NOT NULL,
    name_zh TEXT NOT NULL,
    name_en TEXT NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS wow_playable_spec (
    id INTEGER PRIMARY KEY NOT NULL,
    name_zh TEXT NOT NULL,
    name_en TEXT NOT NULL,
    class_id INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (class_id) REFERENCES wow_playable_class (id)
  );

CREATE TABLE
  IF NOT EXISTS wow_npc (
    id INTEGER PRIMARY KEY NOT NULL,
    name_en TEXT,
    name_zh TEXT,
    location TEXT,
    type TEXT
  );

CREATE TABLE
  IF NOT EXISTS wow_raid_guide (
    id INTEGER PRIMARY KEY NOT NULL,
    name_en TEXT,
    name_zh TEXT,
    encounters TEXT,
    guide TEXT
  );

CREATE TABLE
  IF NOT EXISTS wow_question (
    id INTEGER PRIMARY KEY NOT NULL,
    guide_id INTEGER NOT NULL,
    guide_type TEXT NOT NULL,
    dungeon_id INTEGER NOT NULL,
    question_text TEXT NOT NULL
  );

-- dynamic tables
CREATE TABLE
  IF NOT EXISTS wow_dynamic_mythic_dungeon_count (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (id) REFERENCES wow_dungeon (id)
  );

CREATE TABLE
  IF NOT EXISTS wow_dynamic_spec_bis_count (
    id INTEGER PRIMARY KEY NOT NULL,
    role_class TEXT,
    class_spec TEXT,
    count INTEGER DEFAULT 0
  );

CREATE TABLE
  IF NOT EXISTS wow_dynamic_npc_mark_count (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT,
    content TEXT,
    count INTEGER DEFAULT 0,
    mark_list TEXT,
    dungeon_id INTEGER
  );

CREATE TABLE
  IF NOT EXISTS wow_dynamic_spell_mark_count (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT,
    content TEXT,
    count INTEGER DEFAULT 0,
    mark_list TEXT,
    dungeon_id INTEGER
  );

CREATE TABLE
  IF NOT EXISTS wow_dynamic_user_mark (
    id TEXT PRIMARY KEY NOT NULL,
    npc_mark_list TEXT,
    spell_mark_list TEXT
  );

CREATE TABLE
  IF NOT EXISTS wow_dynamic_user_question (
    id INTEGER PRIMARY KEY NOT NULL,
    wrong_list TEXT,
    mark_list TEXT,
    done_list TEXT
  );

CREATE TABLE
  IF NOT EXISTS wow_dynamic_mythic_dungeon_question_count (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    count INTEGER DEFAULT 0
  );

INSERT INTO
  wow_dynamic_mythic_dungeon_question_count (id, name)
VALUES
  (247, '暴富矿区！！'),
  (370, '麦卡贡行动 - 车间'),
  (382, '伤逝剧场'),
  (499, '圣焰隐修院'),
  (500, '驭雷栖巢'),
  (504, '暗焰裂口'),
  (506, '燧酿酒庄'),
  (525, '水闸行动');

-- daily tables
CREATE TABLE
  IF NOT EXISTS wow_daily_spec_popularity (
    id INTEGER PRIMARY KEY NOT NULL,
    date TEXT NOT NULL,
    level_range TEXT NOT NULL,
    data TEXT NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS wow_daily_spec_dps_rank (
    id INTEGER PRIMARY KEY NOT NULL,
    week_id TEXT NOT NULL,
    data TEXT NOT NULL
  );