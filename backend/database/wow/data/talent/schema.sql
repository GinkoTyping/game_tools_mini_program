CREATE TABLE IF NOT EXISTS wow_talent
(
    id                 INTEGER PRIMARY KEY,
    role_class         TEXT NOT NULL,
    class_spec         TEXT NOT NULL,
    class_talent_nodes TEXT NOT NULL,
    hero_talent_trees  TEXT NOT NULL,
    spec_talent_nodes  TEXT NOT NULL,
    restriction_lines  TEXT NOT NULL
)