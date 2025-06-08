-- SQLite
-- access_count
CREATE TABLE
    IF NOT EXISTS access_count
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    time        TIMESTAMP CURRENT_TIME,
    visit_count INTEGER DEFAULT 0
);

-- wow_tier_list
CREATE TABLE
    IF NOT EXISTS wow_tier_list
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id    TEXT,
    activity_type TEXT,
    role          TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tier_data     TEXT
);

-- wow_home_view
CREATE TABLE
    IF NOT EXISTS wow_home_view
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    time       TEXT,
    carousels  TEXT,
    tier_lists TEXT,
    hot_topics TEXT
);

-- wow_bis
CREATE TABLE
    IF NOT EXISTS wow_bis
(
    id                      INTEGER PRIMARY KEY,
    role_class              TEXT NOT NULL,
    class_spec              TEXT NOT NULL,
    collected_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version                 TEXT,
    stats_priority          TEXT NOT NULL,
    detailed_stats_priority TEXT,
    archon_stats_priority   TEXT,
    ratings                 TEXT NOT NULL,
    talents                 TEXT,
    bis_items               TEXT NOT NULL,
    bis_trinkets            TEXT NOT NULL,
    enhancement             TEXT,
    access_count            INTEGER   DEFAULT 0,
    sort                    INTEGER   DEFAULT 0,
    spec_sort               INTEGER   DEFAULT 0
);

-- wow_dungeon
CREATE TABLE
    IF NOT EXISTS wow_dungeon
(
    id         INTEGER PRIMARY KEY NOT NULL,
    journal_id INTEGER             NOT NULL,
    name_zh    TEXT                NOT NULL,
    name_en    TEXT                NOT NULL,
    bosses     TEXT
);

-- wow_mythic_dungeon
CREATE TABLE
    IF NOT EXISTS wow_mythic_dungeon
(
    id            INTEGER PRIMARY KEY NOT NULL,
    routes        TEXT                NOT NULL,
    ratings       TEXT                NOT NULL,
    utility_needs TEXT                NOT NULL,
    enemy_tips    TEXT                NOT NULL,
    loot_pool     TEXT                NOT NULL,
    FOREIGN KEY (id) REFERENCES wow_dungeon (id)
);

CREATE TABLE
    IF NOT EXISTS wow_mythic_dungeon_tier
(
    id   INTEGER PRIMARY KEY NOT NULL,
    tier TEXT                NOT NULL,
    FOREIGN KEY (id) REFERENCES wow_dungeon (id)
);

CREATE TABLE
    IF NOT EXISTS wow_playable_class
(
    id      INTEGER PRIMARY KEY NOT NULL,
    name_zh TEXT                NOT NULL,
    name_en TEXT                NOT NULL
);

CREATE TABLE
    IF NOT EXISTS wow_playable_spec
(
    id       INTEGER PRIMARY KEY NOT NULL,
    name_zh  TEXT                NOT NULL,
    name_en  TEXT                NOT NULL,
    class_id INTEGER             NOT NULL DEFAULT 1,
    FOREIGN KEY (class_id) REFERENCES wow_playable_class (id)
);

CREATE TABLE
    IF NOT EXISTS wow_npc
(
    id       INTEGER PRIMARY KEY NOT NULL,
    name_en  TEXT,
    name_zh  TEXT,
    location TEXT,
    type     TEXT
);

CREATE TABLE
    IF NOT EXISTS wow_raid_guide
(
    id         INTEGER PRIMARY KEY NOT NULL,
    name_en    TEXT,
    name_zh    TEXT,
    encounters TEXT,
    guide      TEXT
);

CREATE TABLE
    IF NOT EXISTS wow_question
(
    id            INTEGER PRIMARY KEY NOT NULL,
    guide_id      INTEGER             NOT NULL,
    guide_type    TEXT                NOT NULL,
    dungeon_id    INTEGER             NOT NULL,
    question_text TEXT                NOT NULL
);

CREATE TABLE IF NOT EXISTS wow_basic_stats
(
    id        INTEGER PRIMARY KEY,
    roleClass TEXT NOT NULL,
    classSpec TEXT NOT NULL,
    crit      TEXT NOT NULL,
    haste     TEXT NOT NULL,
    mastery   TEXT NOT NULL,
    vers      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wow_wotlk_talent
(
    id            INTEGER PRIMARY KEY,
    role_class    TEXT NOT NULL,
    talent_groups TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wow_wotlk_spell
(
    id          INTEGER PRIMARY KEY,
    id_wow_db   INTEGER,
    name_en     TEXT,
    name_zh     TEXT,
    range       TEXT,
    cost        TEXT,
    cast_time   TEXT,
    cooldown    TEXT,
    description TEXT,
    image       TEXT
);

CREATE TABLE IF NOT EXISTS wow_wotlk_bis
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    role_class TEXT NOT NULL,
    class_spec TEXT NOT NULL,
    type       TEXT NOT NULL,
    talent     TEXT
);

-- dynamic tables
CREATE TABLE
    IF NOT EXISTS wow_dynamic_mythic_dungeon_count
(
    id    INTEGER PRIMARY KEY NOT NULL,
    name  TEXT                NOT NULL,
    count INTEGER             NOT NULL DEFAULT 0,
    FOREIGN KEY (id) REFERENCES wow_dungeon (id)
);

CREATE TABLE
    IF NOT EXISTS wow_dynamic_spec_bis_count
(
    id         INTEGER PRIMARY KEY NOT NULL,
    role_class TEXT,
    class_spec TEXT,
    count      INTEGER DEFAULT 0
);

CREATE TABLE
    IF NOT EXISTS wow_dynamic_npc_mark_count
(
    id         INTEGER PRIMARY KEY NOT NULL,
    name       TEXT,
    content    TEXT,
    count      INTEGER DEFAULT 0,
    mark_list  TEXT,
    dungeon_id INTEGER
);

CREATE TABLE
    IF NOT EXISTS wow_dynamic_spell_mark_count
(
    id         INTEGER PRIMARY KEY NOT NULL,
    name       TEXT,
    content    TEXT,
    count      INTEGER DEFAULT 0,
    mark_list  TEXT,
    dungeon_id INTEGER
);

CREATE TABLE
    IF NOT EXISTS wow_dynamic_user_mark
(
    id              TEXT PRIMARY KEY NOT NULL,
    npc_mark_list   TEXT,
    spell_mark_list TEXT
);

CREATE TABLE
    IF NOT EXISTS wow_dynamic_user_question
(
    id         INTEGER PRIMARY KEY NOT NULL,
    wrong_list TEXT,
    mark_list  TEXT,
    done_list  TEXT
);

CREATE TABLE
    IF NOT EXISTS wow_dynamic_mythic_dungeon_question_count
(
    id    INTEGER PRIMARY KEY NOT NULL,
    name  TEXT                NOT NULL,
    count INTEGER DEFAULT 0
);

INSERT INTO wow_dynamic_mythic_dungeon_question_count (id, name)
VALUES (247, '暴富矿区！！'),
       (370, '麦卡贡行动 - 车间'),
       (382, '伤逝剧场'),
       (499, '圣焰隐修院'),
       (500, '驭雷栖巢'),
       (504, '暗焰裂口'),
       (506, '燧酿酒庄'),
       (525, '水闸行动');

-- user tag
CREATE TABLE
    IF NOT EXISTS wow_dynamic_user_tag
(
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id                  INTEGER,
    created_at               TIMESTAMP CURRENT_TIME,
    updated_at               TIMESTAMP,
    battlenet_id             TEXT,
    -- 用于前端的回填
    wow_tag                  TEXT,
    common_tag               TEXT,
    -- 独立的属性用于过滤
    wow_server               TEXT,
    wow_jobs                 TEXT,
    wow_spec                 TEXT,
    wow_classes              TEXT,
    wow_game_style           TEXT,
    wow_communication        TEXT,
    wow_active_time          TEXT,
    wow_privacy_need_confirm TEXT,
    wow_privacy_wx_profile   TEXT,
    common_status            TEXT,
    common_game              TEXT,
    common_age               TEXT,
    common_personality       TEXT,
    common_role              TEXT,
    last_view_relation       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_updated ON wow_dynamic_user_tag (wow_jobs, updated_at DESC);

CREATE INDEX idx_spec_updated ON wow_dynamic_user_tag (wow_spec, updated_at DESC);

CREATE INDEX idx_game_style_updated ON wow_dynamic_user_tag (wow_game_style, updated_at DESC);

CREATE INDEX idx_active_time_updated ON wow_dynamic_user_tag (wow_active_time, updated_at DESC);

-- user user tag
CREATE TABLE
    IF NOT EXISTS wow_dynamic_user_tag_relations
(
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    -- 申请人（主动发起动作的用户）
    applicant_user_id INTEGER NOT NULL,
    -- 被申请人（名片所有者）
    target_user_id    INTEGER NOT NULL,
    -- 关联的标签 ID（名片）
    tag_id            INTEGER NOT NULL,
    -- 申请状态: pending（待处理）、accepted（自动或手动通过）、rejected（拒绝）
    status            TEXT    NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    -- 拒绝理由（仅在 status = 'rejected' 时填）
    reject_reason     TEXT,
    -- 是否因隐私公开自动通过（可选字段，便于统计）
    is_auto_approved  BOOLEAN   DEFAULT 0,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- 唯一约束：避免重复申请
    UNIQUE (applicant_user_id, target_user_id, tag_id),
    -- 外键约束
    FOREIGN KEY (tag_id) REFERENCES wow_dynamic_user_tag (id)
);

-- 索引优化
CREATE INDEX idx_applicant_tagert_status ON wow_dynamic_user_tag_relations (applicant_user_id, target_user_id, status);

-- daily tables
CREATE TABLE
    IF NOT EXISTS wow_daily_spec_popularity
(
    id          INTEGER PRIMARY KEY NOT NULL,
    date        TEXT                NOT NULL,
    level_range TEXT                NOT NULL,
    data        TEXT                NOT NULL
);

CREATE TABLE
    IF NOT EXISTS wow_daily_spec_dps_rank
(
    id      INTEGER PRIMARY KEY NOT NULL,
    week_id TEXT                NOT NULL,
    data    TEXT                NOT NULL
);