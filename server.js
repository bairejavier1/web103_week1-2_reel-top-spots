const express = require("express");
const pool = require("./db/db_connection");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Homepage Route with Search =====
app.get("/", async (req, res) => {
  const searchQuery = req.query.q || "";

  try {
    let result;
    if (searchQuery) {
      result = await pool.query(
        `SELECT * FROM fishing_spots
         WHERE name ILIKE $1 OR type ILIKE $1 OR target_fish ILIKE $1`,
        [`%${searchQuery}%`]
      );
    } else {
      result = await pool.query("SELECT * FROM fishing_spots");
    }

    let html = `
    <html>
    <head>
      <title>Reel Top Fishing Spots</title>
      <link rel="stylesheet" href="https://unpkg.com/@picocss/pico@2/css/pico.min.css">
      <style>
        body { padding-top: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px,1fr)); gap: 20px; }
        img { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; }
        article { transition: transform .2s ease; }
        article:hover { transform: scale(1.03); }

        /* Search Form Styling */
        form { 
          margin-bottom: 20px; 
          display: flex; 
          gap: 10px; 
          align-items: center; 
          flex-wrap: wrap;
        }
        input[type="text"] { 
          flex: 1; 
          padding: 12px 15px; 
          font-size: 1rem; 
          border-radius: 8px; 
          border: 1px solid #ccc; 
          min-width: 200px;
        }
        button { 
          padding: 10px 20px; 
          font-size: 1rem; 
          border-radius: 8px; 
          cursor: pointer;
        }

        /* Back button (top-right corner) */
        .back-button {
          position: absolute;
          top: 20px;
          right: 20px;
          padding: 8px 16px;
          background: #00e0ff;
          color: #000;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
        }
        .back-button:hover { background: #00c4d9; }
        main.container { position: relative; } /* to allow absolute back button */
      </style>
    </head>
    <body>
      <main class="container">
        <a href="/" class="back-button">Home</a>

        <h1>🎣 Reel Top Fishing Spots</h1>
        <p>Explore some of the best fishing locations in South Florida.</p>

        <!-- Search Form -->
        <form method="GET" action="/">
          <input type="text" name="q" placeholder="Search by name, type, or target fish" value="${searchQuery}">
          <button type="submit">Search</button>
        </form>

        <div class="grid">
    `;

    if (result.rows.length === 0) {
      html += `<p>No spots found for "<strong>${searchQuery}</strong>".</p>`;
    } else {
      result.rows.forEach(spot => {
        html += `
          <article>
            <a href="/spots/${spot.slug}">
              <img src="${spot.image}" alt="${spot.name}">
            </a>
            <h3>${spot.name}</h3>
            <p><strong>Type:</strong> ${spot.type}</p>
            <p><strong>Best Season:</strong> ${spot.best_season}</p>
            <p><strong>Difficulty:</strong> ${spot.difficulty}</p>
            <a href="/spots/${spot.slug}">View Details</a>
          </article>
        `;
      });
    }

    html += `
        </div>
      </main>
    </body>
    </html>
    `;

    res.send(html);

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error loading fishing spots");
  }
});

// ===== Detail Route =====
app.get("/spots/:slug", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM fishing_spots WHERE slug = $1",
      [req.params.slug]
    );

    const spot = result.rows[0];

    if (!spot) {
      return res.status(404).send(`
        <html>
        <head>
          <title>404 - Spot Not Found</title>
          <link rel="stylesheet" href="https://unpkg.com/@picocss/pico@2/css/pico.min.css">
        </head>
        <body>
          <main class="container">
            <h1>404 - Fishing Spot Not Found</h1>
            <p>The fishing location you are looking for does not exist.</p>
            <a href="/" class="back-button">Home</a>
          </main>
        </body>
        </html>
      `);
    }

    let html = `
    <html>
    <head>
      <title>${spot.name}</title>
      <link rel="stylesheet" href="https://unpkg.com/@picocss/pico@2/css/pico.min.css">
      <style>
        img { width: 100%; max-width: 650px; border-radius: 10px; }
        .back-button {
          position: absolute;
          top: 20px;
          right: 20px;
          padding: 8px 16px;
          background: #00e0ff;
          color: #000;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
        }
        .back-button:hover { background: #00c4d9; }
        main.container { position: relative; }
      </style>
    </head>
    <body>
      <main class="container">
        <a href="/" class="back-button">Home</a>

        <h1>${spot.name}</h1>
        <img src="${spot.image}" alt="${spot.name}">
        <p>${spot.description}</p>

        <h3>Fishing Information</h3>
        <ul>
          <li><strong>Type:</strong> ${spot.type}</li>
          <li><strong>Best Season:</strong> ${spot.best_season}</li>
          <li><strong>Target Fish:</strong> ${spot.target_fish}</li>
          <li><strong>Bait:</strong> ${spot.bait}</li>
          <li><strong>Difficulty:</strong> ${spot.difficulty}</li>
        </ul>
      </main>
    </body>
    </html>
    `;

    res.send(html);

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// ===== Global 404 Route =====
app.use((req, res) => {
  res.status(404).send(`
  <html>
  <head>
    <title>404 - Page Not Found</title>
    <link rel="stylesheet" href="https://unpkg.com/@picocss/pico@2/css/pico.min.css">
  </head>
  <body>
    <main class="container">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/" class="back-button">Home</a>
    </main>
  </body>
  </html>
  `);
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});