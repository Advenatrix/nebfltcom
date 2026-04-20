-- Nebulous Fleet Command: core schema
-- Safe to re-run: drops then recreates

DROP TABLE IF EXISTS magazines CASCADE;
DROP TABLE IF EXISTS weapon_slots CASCADE;
DROP TABLE IF EXISTS ships CASCADE;
DROP TABLE IF EXISTS fleets CASCADE;
DROP TABLE IF EXISTS industries CASCADE;
DROP TABLE IF EXISTS colonies CASCADE;
DROP TABLE IF EXISTS planets CASCADE;
DROP TABLE IF EXISTS gates CASCADE;
DROP TABLE IF EXISTS star_systems CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS factions CASCADE;

-- Factions (sides)
CREATE TABLE factions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6ee7b7',
  description TEXT
);

-- Users (admins create these; no public signup)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','player')) DEFAULT 'player',
  faction_id INTEGER REFERENCES factions(id) ON DELETE SET NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Session cookies
CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_idx ON sessions(user_id);

-- Star systems placed on a 2D galaxy map (arbitrary units, roughly -1000..1000)
CREATE TABLE star_systems (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  x REAL NOT NULL,
  y REAL NOT NULL,
  star_type TEXT NOT NULL DEFAULT 'G',          -- O B A F G K M
  star_color TEXT NOT NULL DEFAULT '#fde68a',
  description TEXT
);

-- FTL gates between systems (undirected; store canonical pair)
CREATE TABLE gates (
  id SERIAL PRIMARY KEY,
  system_a_id INTEGER NOT NULL REFERENCES star_systems(id) ON DELETE CASCADE,
  system_b_id INTEGER NOT NULL REFERENCES star_systems(id) ON DELETE CASCADE,
  CHECK (system_a_id < system_b_id),
  UNIQUE (system_a_id, system_b_id)
);

-- Planets orbiting a star
CREATE TABLE planets (
  id SERIAL PRIMARY KEY,
  system_id INTEGER NOT NULL REFERENCES star_systems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  orbit_radius REAL NOT NULL,        -- AU-ish
  orbit_period_days REAL NOT NULL,   -- seconds of wall-time per full orbit for animation
  orbit_phase REAL NOT NULL DEFAULT 0, -- radians at t=0
  radius_km REAL NOT NULL DEFAULT 6000,
  planet_type TEXT NOT NULL DEFAULT 'terrestrial',
  color TEXT NOT NULL DEFAULT '#93c5fd',
  UNIQUE (system_id, name)
);

-- Colonies (cities). A planet can have many.
CREATE TABLE colonies (
  id SERIAL PRIMARY KEY,
  planet_id INTEGER NOT NULL REFERENCES planets(id) ON DELETE CASCADE,
  faction_id INTEGER NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  population INTEGER NOT NULL DEFAULT 1000,
  founded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX colonies_planet_idx ON colonies(planet_id);
CREATE INDEX colonies_faction_idx ON colonies(faction_id);

-- Industries belong to a colony
CREATE TABLE industries (
  id SERIAL PRIMARY KEY,
  colony_id INTEGER NOT NULL REFERENCES colonies(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,              -- shipyard, refinery, farm, fab, barracks, etc.
  level INTEGER NOT NULL DEFAULT 1,
  output_per_day INTEGER NOT NULL DEFAULT 10
);

-- Fleets live in a system (or are in transit, we'll keep simple: current_system_id)
CREATE TABLE fleets (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  faction_id INTEGER NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
  current_system_id INTEGER NOT NULL REFERENCES star_systems(id) ON DELETE RESTRICT,
  owner_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX fleets_system_idx ON fleets(current_system_id);
CREATE INDEX fleets_faction_idx ON fleets(faction_id);

-- Ships belong to a fleet. ammo and crew are scalar columns as requested.
CREATE TABLE ships (
  id SERIAL PRIMARY KEY,
  fleet_id INTEGER NOT NULL REFERENCES fleets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hull_class TEXT NOT NULL DEFAULT 'frigate', -- corvette, frigate, destroyer, cruiser, battleship
  hull_hp INTEGER NOT NULL DEFAULT 100,
  crew INTEGER NOT NULL DEFAULT 40,
  crew_max INTEGER NOT NULL DEFAULT 40,
  ammo INTEGER NOT NULL DEFAULT 100,
  ammo_max INTEGER NOT NULL DEFAULT 100
);
CREATE INDEX ships_fleet_idx ON ships(fleet_id);

-- Weapon slots (one-to-many off ship)
CREATE TABLE weapon_slots (
  id SERIAL PRIMARY KEY,
  ship_id INTEGER NOT NULL REFERENCES ships(id) ON DELETE CASCADE,
  mount_kind TEXT NOT NULL DEFAULT 'turret',  -- turret, fixed, bay
  weapon_name TEXT,                           -- null = empty slot
  weapon_caliber TEXT,
  weapon_damage INTEGER DEFAULT 0
);
CREATE INDEX weapon_slots_ship_idx ON weapon_slots(ship_id);

-- Magazines (one-to-many off ship)
CREATE TABLE magazines (
  id SERIAL PRIMARY KEY,
  ship_id INTEGER NOT NULL REFERENCES ships(id) ON DELETE CASCADE,
  ammo_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 100
);
CREATE INDEX magazines_ship_idx ON magazines(ship_id);
