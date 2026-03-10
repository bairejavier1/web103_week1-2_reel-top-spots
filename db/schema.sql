-- Run this SQL code to create the "fishing_spots" table in your PostgreSQL database. You can execute this code using a database client like psql, pgAdmin, or any other PostgreSQL interface.

CREATE TABLE IF NOT EXISTS fishing_spots (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  best_season TEXT NOT NULL,
  target_fish TEXT NOT NULL,
  bait TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL
);