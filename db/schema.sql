DROP TABLE IF EXISTS persons CASCADE;
DROP TABLE IF EXISTS horses CASCADE;
DROP TABLE IF EXISTS rides CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS personsToBadges CASCADE;

CREATE TABLE persons (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  img VARCHAR(255),
  goals TEXT,
  usdf_num INT,
  is_social BOOLEAN
);

CREATE TABLE horses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  img VARCHAR(255),
  usdf_num INT,
  person_id INT NOT NULL,
  FOREIGN KEY (person_id) REFERENCES persons(id)
);

CREATE TABLE rides (
  id SERIAL PRIMARY KEY,
  horse_id INT,
  FOREIGN KEY (horse_id) REFERENCES horses(id),
  person_id INT,
  FOREIGN KEY (person_id) REFERENCES persons(id),
    name VARCHAR(255),
  info VARCHAR(255),
  type VARCHAR(255),
  date VARCHAR(255) NOT NULL,
  hours FLOAT
);

CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  rank INT
);

CREATE TABLE personsToBadges (
  id SERIAL PRIMARY KEY,
  date_earned VARCHAR(255) NOT NULL,
  person_id INT NOT NULL,
  FOREIGN KEY (person_id) REFERENCES persons(id),
  badge_id INT NOT NULL,
  FOREIGN KEY (badge_id) REFERENCES badges(id)
);

-- this needs to include YOUR PATH!! YOURS! NOT THE PATH LISTED BELOW!
COPY badges
  (rank, name, description)
FROM '/Users/benjamindejesus/desktop/ga/hart/db/badges.csv'
    DELIMITER ',' CSV;


