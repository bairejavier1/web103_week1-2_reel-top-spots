// server.js
const express = require("express");
const app = express();
const PORT = 3000;

// Import your data
const spots = require("./data");

// ===== Homepage Route =====
app.get("/", (req, res) => {
  let html = `
    <html>
    <head>
      <title>Reel-Top-Spots</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@latest/css/pico.min.css">
      <style>
        main { padding: 2rem; }
        section.grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }
        article img {
          width: 100%;
          height: auto;
          border-radius: 8px;
          cursor: pointer; /* indicates clickable */
          transition: transform 0.2s;
        }
        article img:hover {
          transform: scale(1.03); /* subtle zoom effect on hover */
        }
      </style>
    </head>
    <body>
      <main class="container">
        <h1>🎣 Reel-Top-Spots: Florida Fishing Guide</h1>
        <section class="grid">
  `;

  spots.forEach(spot => {
    html += `
      <article>
        <a href="/spots/${spot.slug}">
          <img src="${spot.image}" alt="${spot.name}">
        </a>
        <h3>${spot.name}</h3>
        <p><strong>Type:</strong> ${spot.type}</p>
        <p><strong>Best Season:</strong> ${spot.bestSeason}</p>
        <a href="/spots/${spot.slug}">View Details →</a>
      </article>
    `;
  });

  html += `
        </section>
      </main>
    </body>
    </html>
  `;

  res.send(html);
});

// ===== Detail Route =====
app.get("/spots/:slug", (req, res) => {
  const spot = spots.find(s => s.slug === req.params.slug);

  if (!spot) {
    return res.status(404).send(`
      <h1>404 - Spot Not Found</h1>
      <a href="/">Return Home</a>
    `);
  }

  res.send(`
    <html>
    <head>
      <title>${spot.name}</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@latest/css/pico.min.css">
      <style>
        main { padding: 2rem; max-width: 800px; margin: auto; }
        img { width: 100%; height: auto; border-radius: 8px; margin-bottom: 1rem; }
      </style>
    </head>
    <body>
      <main class="container">
        <h1>${spot.name}</h1>
        <img src="${spot.image}" alt="${spot.name}">
        <p><strong>Type:</strong> ${spot.type}</p>
        <p><strong>Best Season:</strong> ${spot.bestSeason}</p>
        <p><strong>Target Fish:</strong> ${spot.targetFish}</p>
        <p><strong>Recommended Bait:</strong> ${spot.bait}</p>
        <p><strong>Difficulty:</strong> ${spot.difficulty}</p>
        <p>${spot.description}</p>
        <a href="/">← Back to list</a>
      </main>
    </body>
    </html>
  `);
});

// ===== 404 Route =====
app.use((req, res) => {
  res.status(404).send(`
    <h1>404 - Page Not Found</h1>
    <a href="/">Return Home</a>
  `);
});

// ===== Start the Server =====
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});