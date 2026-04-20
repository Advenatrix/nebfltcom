-- 003: convert "industries" into a richer "buildings" table,
-- and let colonies know which user owns them.

-- Colonies: add owner_user_id
ALTER TABLE colonies
  ADD COLUMN IF NOT EXISTS owner_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Rename industries -> buildings (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'industries')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'buildings') THEN
    EXECUTE 'ALTER TABLE industries RENAME TO buildings';
  END IF;
END$$;

-- Add descriptive columns
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS description TEXT;

-- Backfill names for pre-existing rows
UPDATE buildings
SET name = initcap(kind) || ' (L' || level || ')'
WHERE name IS NULL OR name = '';

-- Assign colony owners from the matching faction's user (first match).
UPDATE colonies c
SET owner_user_id = sub.uid
FROM (
  SELECT DISTINCT ON (faction_id) faction_id, id AS uid
  FROM users
  WHERE faction_id IS NOT NULL
  ORDER BY faction_id, id
) sub
WHERE c.faction_id = sub.faction_id AND c.owner_user_id IS NULL;

-- Add a few more buildings per colony so the UI has variety
INSERT INTO buildings (colony_id, kind, level, output_per_day, name, description)
SELECT c.id, 'farm', 2, 100, 'Hydroponics Bay',
       'Grows nutrient-dense crops under artificial sun.'
FROM colonies c
WHERE NOT EXISTS (SELECT 1 FROM buildings b WHERE b.colony_id = c.id AND b.kind = 'farm');

INSERT INTO buildings (colony_id, kind, level, output_per_day, name, description)
SELECT c.id, 'barracks', 1, 50, 'Garrison',
       'Houses planetary defense troops.'
FROM colonies c
WHERE c.population > 100000
  AND NOT EXISTS (SELECT 1 FROM buildings b WHERE b.colony_id = c.id AND b.kind = 'barracks');

INSERT INTO buildings (colony_id, kind, level, output_per_day, name, description)
SELECT c.id, 'power', 2, 0, 'Fusion Reactor',
       'Primary energy supply for the colony grid.'
FROM colonies c
WHERE NOT EXISTS (SELECT 1 FROM buildings b WHERE b.colony_id = c.id AND b.kind = 'power');

INSERT INTO buildings (colony_id, kind, level, output_per_day, name, description)
SELECT c.id, 'research', 1, 20, 'Science Lab',
       'Advances local tech and blueprints.'
FROM colonies c
WHERE c.population > 500000
  AND NOT EXISTS (SELECT 1 FROM buildings b WHERE b.colony_id = c.id AND b.kind = 'research');
