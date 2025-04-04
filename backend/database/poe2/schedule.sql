CREATE TABLE
  IF NOT EXISTS poe_dynamic_ladders (
    type TEXT NOT NULL CHECK (
      type IN (
        'DotH_standard',
        'DotH_hc',
        'DotH_ssf',
        'DotH_hc_ssf',
        'standard',
        'hc',
        'ssf',
        'hc_ssf'
      )
    ),
    rank INTEGER NOT NULL,
    account_name TEXT NOT NULL,
    character_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    class_name_en TEXT NOT NULL,
    level INTEGER NOT NULL,
    experience INTEGER NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (type, rank)
  );
