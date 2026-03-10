require("dotenv").config();
const { Client } = require("pg");
const spots = require("../data");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function seed() {
  try {
    await client.connect();
    await client.query(`
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
    `);
    for (const spot of spots) {
      await client.query(
        `INSERT INTO fishing_spots 
        (slug, name, type, best_season, target_fish, bait, difficulty, description, image)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (slug) DO NOTHING`,
        [
          spot.slug,
          spot.name,
          spot.type,
          spot.bestSeason,
          spot.targetFish,
          spot.bait,
          spot.difficulty,
          spot.description,
          spot.image
        ]
      );
    }

    console.log("Database seeded successfully!");
    await client.end();

  } catch (err) {
    console.error(err);
  }
}

seed();