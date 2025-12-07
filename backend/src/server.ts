import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
This is a superheroes API server that supports 3 GET endpoints
The data is stored in a JSON file in the project folder called superheroes.json
1. /superheroes/all - returns a list of all superheroes, as a JSON array
2. /superheroes/:id - returns a specific superhero by id, as a JSON object
3. /superheroes/:id/powerstats - returns a the powers statistics for superhero by id, as a JSON object
*/

// Get proper __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.TEST_PORT || process.env.PORT || 3000;

// Root route
/**
 * GET /
 * Root endpoint for health check or welcome message.
 *
 * Response: 200 OK - Returns a welcome string.
 */
app.get('/', (req, res) => {
  res.send('Save the World!');
});

// API route to fetch superheroes data
/**
 * Loads the list of superheroes from a JSON file asynchronously.
 *
 * @returns {Promise<any>} A promise that resolves with the parsed JSON data containing superheroes,
 * or rejects if there is an error reading or parsing the file.
 * @throws Will reject the promise if the file cannot be read or if the JSON is invalid.
 */
function loadSuperheroes(): Promise<any> {
  const dataPath = path.join(__dirname, '../data/superheroes.json');
  return new Promise((resolve, reject) => {
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

/**
 * GET /api/superheroes
 * Returns a list of all superheroes.
 *
 * Response: 200 OK - Array of superhero objects
 *           500 Internal Server Error - If data cannot be read
 */
app.get('/api/superheroes', async (req, res) => {
  try {
    const superheroes = await loadSuperheroes();
    res.json(superheroes);
  } catch (err) {
    console.error('Error loading superheroes data:', err);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /api/superheroes/compare
 * Compares two superheroes by their unique IDs and returns a breakdown of their powerstats.
 *
 * Query Parameters:
 *   id1 (string|number) - The unique identifier of the first superhero
 *   id2 (string|number) - The unique identifier of the second superhero
 *
 * Response:
 *   200 OK - JSON object with comparison results (id1, id2, categories, overall_winner)
 *   400 Bad Request - If either id1 or id2 is missing or invalid
 *   404 Not Found - If either superhero does not exist
 *   500 Internal Server Error - If data cannot be read
 */
app.get('/api/superheroes/compare', async (req, res) => {
  const id1Raw = req.query.id1;
  const id2Raw = req.query.id2;

  // Validate that both id1 and id2 are provided and are valid numbers
  if (!id1Raw || !id2Raw) {
    res.status(400).send('Both id1 and id2 query parameters are required');
    return;
  }
  const id1 = Number(id1Raw);
  const id2 = Number(id2Raw);
  if (isNaN(id1) || isNaN(id2)) {
    res.status(400).send('Both id1 and id2 must be valid numeric values');
    return;
  }
  if (id1 === id2) {
    res.status(400).send('Bad request. Comparing a hero with itself not allowed');
    return;
  }
  try {
    const superheroes = await loadSuperheroes();
    const hero1 = superheroes.find((h: any) => Number(h.id) === id1);
    const hero2 = superheroes.find((h: any) => Number(h.id) === id2);

    if (!hero1 || !hero2) {
      res.status(404).send('Superhero not found');
      return;
    }

    const STAT_ORDER = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];
    const categories: Array<Record<string, any>> = [];
    let hero1Wins = 0;
    let hero2Wins = 0;

    STAT_ORDER.forEach((stat) => {
      const v1 = Number(hero1.powerstats[stat]) || 0;
      const v2 = Number(hero2.powerstats[stat]) || 0;
      let winner: 1 | 2 | 'tie' = 'tie';
      if (v1 > v2) {
        winner = 1;
        hero1Wins++;
      } else if (v2 > v1) {
        winner = 2;
        hero2Wins++;
      }
      categories.push({
        name: stat,
        winner,
        id1_value: v1,
        id2_value: v2,
      });
    });

    let overall_winner: 1 | 2 | 'tie' = 'tie';
    if (hero1Wins > hero2Wins) overall_winner = 1;
    else if (hero2Wins > hero1Wins) overall_winner = 2;

    res.json({
      id1,
      id2,
      categories,
      overall_winner,
    });
  } catch (err) {
    console.error('Error loading superheroes data for compare:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/superheroes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const superheroes = await loadSuperheroes();
    const superhero = superheroes.find((hero: any) => String(hero.id) === String(id));
    if (superhero) {
      res.json(superhero);
    } else {
      res.status(404).send('Superhero not found');
    }
  } catch (err) {
    console.error('Error loading superheroes data:', err);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /api/superheroes/:id/powerstats
 * Returns the powerstats for a superhero by their unique ID.
 *
 * Params: id (string) - The unique identifier of the superhero
 * Response: 200 OK - Powerstats object
 *           404 Not Found - If the superhero does not exist
 *           500 Internal Server Error - If data cannot be read
 */
app.get('/api/superheroes/:id/powerstats', async (req, res) => {
  const { id } = req.params;
  try {
    const superheroes = await loadSuperheroes();
    const superhero = superheroes.find((hero: any) => String(hero.id) === String(id));
    if (superhero) {
      res.json(superhero.powerstats);
    } else {
      res.status(404).send('Superhero not found');
    }
  } catch (err) {
    console.error('Error loading superheroes data:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      console.error('Failed to start server:', err.message);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
      } else if (err.code === 'EACCES') {
        console.error(`Insufficient privileges to bind to port ${PORT}.`);
      }
      process.exit(1);
    });

    // Handle uncaught exceptions and unhandled promise rejections
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
      process.exit(1);
    });
  } catch (err) {
    console.error('Unexpected error during server startup:', err);
    process.exit(1);
  }
}

export default app;