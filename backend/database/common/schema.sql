-- common_advice
CREATE TABLE
  IF NOT EXISTS common_advice (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    completion_text TEXT,
    completion_images TEXT,
    status INTEGER NOT NULL DEFAULT 0
  );

-- common_patch
CREATE TABLE
  IF NOT EXISTS common_patch (
    id INTEGER PRIMARY KEY,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    text TEXT,
    images TEXT
  );

CREATE TABLE
  IF NOT EXISTS common_ad (
    id INTEGER PRIMARY KEY,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    count
  );

-- dynamic table
CREATE TABLE
  IF NOT EXISTS common_dynamic_user_ad (id INTEGER PRIMARY KEY, ad_list TEXT);

CREATE TABLE
  IF NOT EXISTS common_dynamic_ad (
    id INTEGER PRIMARY KEY,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    count
  );

CREATE TABLE
  IF NOT EXISTS common_dynamic_tarot (
    id INTEGER PRIMARY KEY,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tarots_count TEXT
  );

CREATE TABLE
  IF NOT EXISTS common_dynamic_user_tarot (id INTEGER PRIMARY KEY, tarot_list TEXT);