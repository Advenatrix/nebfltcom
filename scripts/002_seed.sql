-- Seed data for Nebulous Fleet Command
-- Password for all seeded accounts is: "password"
-- bcrypt hash (cost 10) of "password":
-- $2b$10$CwTycUXWue0Thq9StjUM0uJ8.HJvJpD6CUyiM9dFn1dZV7OSb8LXK

DELETE FROM magazines;
DELETE FROM weapon_slots;
DELETE FROM ships;
DELETE FROM fleets;
DELETE FROM industries;
DELETE FROM colonies;
DELETE FROM planets;
DELETE FROM gates;
DELETE FROM star_systems;
DELETE FROM sessions;
DELETE FROM users;
DELETE FROM factions;

-- Factions
INSERT INTO factions (id, name, color, description) VALUES
  (1, 'Terran Concord',   '#60a5fa', 'United cradle worlds of Sol.'),
  (2, 'Outer Frontier',   '#f59e0b', 'Independent rim settlements.'),
  (3, 'Kepler Syndicate', '#ef4444', 'Corporate holdings near Kepler.');
SELECT setval(pg_get_serial_sequence('factions','id'), (SELECT MAX(id) FROM factions));

-- Users (all password = "password")
INSERT INTO users (username, password_hash, role, faction_id, display_name) VALUES
  ('admin',   '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.HJvJpD6CUyiM9dFn1dZV7OSb8LXK', 'admin',  NULL, 'Fleet Admiral'),
  ('terran',  '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.HJvJpD6CUyiM9dFn1dZV7OSb8LXK', 'player', 1,    'Terran Commander'),
  ('frontier','$2b$10$CwTycUXWue0Thq9StjUM0uJ8.HJvJpD6CUyiM9dFn1dZV7OSb8LXK', 'player', 2,    'Frontier Captain'),
  ('kepler',  '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.HJvJpD6CUyiM9dFn1dZV7OSb8LXK', 'player', 3,    'Syndicate Director');

-- Star systems (id gets auto, but we need to reference them for gates. Use fixed IDs.)
INSERT INTO star_systems (id, name, x, y, star_type, star_color, description) VALUES
  (1, 'Sol',        0,    0,    'G', '#fde68a', 'Humanity''s origin.'),
  (2, 'Alpha Cen',  -180, -80,  'K', '#fca5a5', 'Nearest neighbor.'),
  (3, 'Barnard',    -60,  220,  'M', '#f87171', 'Cold red dwarf.'),
  (4, 'Wolf 359',   240,  140,  'M', '#f87171', 'Faint rim star.'),
  (5, 'Sirius',     160, -240,  'A', '#bfdbfe', 'Bright binary.'),
  (6, 'Kepler-22',  420, -40,   'G', '#fde68a', 'Syndicate core.'),
  (7, 'Gliese 581', -340, 260,  'M', '#f87171', 'Frontier outpost.');
SELECT setval(pg_get_serial_sequence('star_systems','id'), (SELECT MAX(id) FROM star_systems));

-- Gates (canonical ordering: a < b)
INSERT INTO gates (system_a_id, system_b_id) VALUES
  (1,2),(1,3),(1,5),
  (2,3),(2,7),
  (3,7),
  (4,5),(4,6),
  (5,6);

-- Planets
INSERT INTO planets (system_id, name, orbit_radius, orbit_period_days, orbit_phase, radius_km, planet_type, color) VALUES
  (1, 'Mercury', 60,  40,  0.0, 2440, 'terrestrial', '#9ca3af'),
  (1, 'Venus',   95,  70,  1.2, 6051, 'terrestrial', '#fbbf24'),
  (1, 'Earth',   135, 110, 2.3, 6371, 'terrestrial', '#60a5fa'),
  (1, 'Mars',    175, 180, 3.9, 3389, 'terrestrial', '#f97316'),
  (1, 'Jupiter', 235, 320, 5.1, 69911,'gas giant',   '#fcd34d'),

  (2, 'Proxima b', 80,  60,  0.4, 6800, 'terrestrial', '#86efac'),
  (2, 'Cen A-II',  150, 160, 2.7, 5400, 'terrestrial', '#fbbf24'),

  (3, 'Barnard b', 70,  50,  1.1, 5000, 'terrestrial', '#fca5a5'),
  (3, 'Barnard c', 130, 140, 3.6, 8000, 'gas giant',   '#fbbf24'),

  (4, 'Wolf-II',   90,  80,  0.8, 4800, 'terrestrial', '#93c5fd'),

  (5, 'Sirius b-I',110, 95,  2.0, 7200, 'terrestrial', '#bfdbfe'),
  (5, 'Sirius b-II',180,200, 4.4, 9800, 'ice giant',   '#a5f3fc'),

  (6, 'Kepler-22b',120, 100, 1.9, 7100, 'terrestrial', '#34d399'),
  (6, 'Kepler-22c',200, 240, 5.7, 11000,'gas giant',   '#fcd34d'),

  (7, 'Gliese-I',  85,  70,  2.8, 5800, 'terrestrial', '#fbbf24');

-- Colonies
INSERT INTO colonies (planet_id, faction_id, name, population) VALUES
  ((SELECT id FROM planets WHERE name='Earth'),      1, 'Geneva Prime', 9000000),
  ((SELECT id FROM planets WHERE name='Earth'),      1, 'New Shanghai', 7500000),
  ((SELECT id FROM planets WHERE name='Mars'),       1, 'Olympus City', 400000),
  ((SELECT id FROM planets WHERE name='Proxima b'),  2, 'Freehold',     120000),
  ((SELECT id FROM planets WHERE name='Barnard b'),  2, 'Red Harbor',    60000),
  ((SELECT id FROM planets WHERE name='Gliese-I'),   2, 'Rimgate',       40000),
  ((SELECT id FROM planets WHERE name='Kepler-22b'), 3, 'Syndicate HQ', 3200000),
  ((SELECT id FROM planets WHERE name='Kepler-22c'), 3, 'Cloud Reach',  150000);

-- Industries
INSERT INTO industries (colony_id, kind, level, output_per_day) VALUES
  ((SELECT id FROM colonies WHERE name='Geneva Prime'), 'shipyard', 3, 120),
  ((SELECT id FROM colonies WHERE name='Geneva Prime'), 'fab',      4, 200),
  ((SELECT id FROM colonies WHERE name='New Shanghai'), 'farm',     5, 300),
  ((SELECT id FROM colonies WHERE name='Olympus City'), 'refinery', 2, 80),
  ((SELECT id FROM colonies WHERE name='Freehold'),     'shipyard', 1, 40),
  ((SELECT id FROM colonies WHERE name='Red Harbor'),   'refinery', 2, 90),
  ((SELECT id FROM colonies WHERE name='Syndicate HQ'), 'shipyard', 4, 180),
  ((SELECT id FROM colonies WHERE name='Syndicate HQ'), 'fab',      5, 260),
  ((SELECT id FROM colonies WHERE name='Cloud Reach'),  'refinery', 3, 110);

-- Fleets (now with optional planet_id)
INSERT INTO fleets (id, name, faction_id, current_system_id, current_planet_id, owner_user_id) VALUES
  (1, 'Home Guard',      1, 1, (SELECT id FROM planets WHERE name='Earth'), (SELECT id FROM users WHERE username='terran')),
  (2, 'Second Fleet',    1, 5, (SELECT id FROM planets WHERE name='Sirius b-I'), (SELECT id FROM users WHERE username='terran')),
  (3, 'Frontier Raiders',2, 2, NULL, (SELECT id FROM users WHERE username='frontier')),
  (4, 'Outer Patrol',    2, 7, NULL, (SELECT id FROM users WHERE username='frontier')),
  (5, 'Syndicate Vanguard',3,6, NULL, (SELECT id FROM users WHERE username='kepler')),
  (6, 'Ghost Squadron',  3, 4, NULL, (SELECT id FROM users WHERE username='kepler'));
SELECT setval(pg_get_serial_sequence('fleets','id'), (SELECT MAX(id) FROM fleets));

-- Ships
INSERT INTO ships (id, fleet_id, name, hull_class, hull_hp, crew, crew_max, ammo, ammo_max) VALUES
  (1, 1, 'TCS Vanguard',  'battleship', 800, 420, 450, 240, 300),
  (2, 1, 'TCS Aegis',     'cruiser',    500, 220, 240, 180, 220),
  (3, 1, 'TCS Swift',     'frigate',    200, 80,  90,  120, 140),
  (4, 2, 'TCS Horizon',   'destroyer',  350, 140, 160, 160, 180),
  (5, 2, 'TCS Tempest',   'frigate',    200, 80,  90,  110, 140),
  (6, 3, 'FRV Crowbar',   'corvette',   120, 40,  45,  80,  100),
  (7, 3, 'FRV Scrapjack', 'frigate',    190, 70,  90,  90,  140),
  (8, 4, 'FRV Longshot',  'destroyer',  320, 130, 160, 140, 180),
  (9, 5, 'KSS Diamond',   'cruiser',    520, 230, 240, 200, 220),
  (10,5, 'KSS Platinum',  'battleship', 820, 430, 450, 260, 300),
  (11,6, 'KSS Wraith',    'frigate',    210, 85,  90,  130, 140),
  (12,6, 'KSS Phantom',   'destroyer',  340, 145, 160, 170, 180);
SELECT setval(pg_get_serial_sequence('ships','id'), (SELECT MAX(id) FROM ships));

-- Weapon slots (a few per ship)
INSERT INTO weapon_slots (ship_id, mount_kind, weapon_name, weapon_caliber, weapon_damage) VALUES
  (1,'turret','Heavy Railgun','250mm',120),
  (1,'turret','Heavy Railgun','250mm',120),
  (1,'fixed','Spinal Lance','400mm',380),
  (1,'bay','Missile Bay','VLS',90),
  (2,'turret','Medium Railgun','150mm',70),
  (2,'turret','Medium Railgun','150mm',70),
  (2,'bay','Missile Bay','VLS',60),
  (3,'turret','Light Coil','75mm',30),
  (3,'turret','Light Coil','75mm',30),
  (4,'turret','Medium Railgun','150mm',70),
  (4,'bay','Missile Bay','VLS',60),
  (5,'turret','Light Coil','75mm',30),
  (6,'turret','Light Coil','75mm',30),
  (7,'turret','Medium Railgun','150mm',70),
  (8,'turret','Medium Railgun','150mm',70),
  (8,'bay','Missile Bay','VLS',60),
  (9,'turret','Heavy Railgun','250mm',120),
  (9,'bay','Missile Bay','VLS',90),
  (10,'turret','Heavy Railgun','250mm',120),
  (10,'turret','Heavy Railgun','250mm',120),
  (10,'fixed','Spinal Lance','400mm',380),
  (11,'turret','Light Coil','75mm',30),
  (12,'turret','Medium Railgun','150mm',70),
  (12,'bay','Missile Bay','VLS',60);

-- Magazines
INSERT INTO magazines (ship_id, ammo_type, quantity, capacity) VALUES
  (1,'250mm Slug',  180,200),(1,'VLS Missile',60,80),
  (2,'150mm Slug',  140,180),(2,'VLS Missile',40,60),
  (3,'75mm Slug',    90,120),
  (4,'150mm Slug',  120,160),(4,'VLS Missile',40,60),
  (5,'75mm Slug',    95,120),
  (6,'75mm Slug',    60,100),
  (7,'150mm Slug',   80,140),
  (8,'150mm Slug',  110,160),(8,'VLS Missile',30,60),
  (9,'250mm Slug',  160,200),(9,'VLS Missile',40,80),
  (10,'250mm Slug', 200,200),(10,'VLS Missile',60,80),
  (11,'75mm Slug',  100,120),
  (12,'150mm Slug', 130,160),(12,'VLS Missile',40,60);
