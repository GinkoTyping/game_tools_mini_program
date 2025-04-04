CREATE TABLE
  IF NOT EXISTS poe_dynamic_ladders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('standard', 'hc', 'ssf', 'hc_ssf')),
    rank INTEGER NOT NULL,
    account_name TEXT NOT NULL,
    character_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    level INTEGER NOT NULL,
    experience INTEGER NOT NULL
  );

CREATE INDEX IF NOT EXISTS idx_type_rank ON poe_dynamic_ladders (type, rank);