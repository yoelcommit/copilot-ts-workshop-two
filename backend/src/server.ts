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
 * Compares two superheroes by their powerstats and determines the winner.
 *
 * The comparison logic evaluates six powerstat categories (intelligence, strength, 
 * speed, durability, power, combat) between two heroes. Each category awards one point 
 * to the hero with the higher stat value. Ties in a category award no points to either hero.
 * The overall winner is determined by who wins the most categories.
 *
 * @route GET /api/superheroes/compare
 * @param {string} req.query.id1 - The ID of the first superhero to compare
 * @param {string} req.query.id2 - The ID of the second superhero to compare
 * @returns {Object} 200 - Comparison result with category winners and overall winner
 * @returns {Object} 400 - Bad Request if id1 or id2 are missing or not numeric
 * @returns {Object} 404 - Not Found if either superhero is not found
 * @returns {Object} 500 - Internal Server Error if data cannot be read
 * 
 * @example
 * // Request
 * GET /api/superheroes/compare?id1=1&id2=2
 * 
 * // Response
 * {
 *   "hero1": { "id": 1, "name": "A-Bomb" },
 *   "hero2": { "id": 2, "name": "Ant-Man" },
 *   "categories": [
 *     { "category": "intelligence", "hero1_value": 38, "hero2_value": 50, "winner": 2 },
 *     { "category": "strength", "hero1_value": 100, "hero2_value": 28, "winner": 1 },
 *     ...
 *   ],
 *   "overall_winner": 1
 * }
 */
app.get('/api/superheroes/compare', async (req, res) => {
  const { id1, id2 } = req.query;

  // Validate that both query parameters are provided
  if (!id1 || !id2) {
    return res.status(400).json({ error: 'Both id1 and id2 query parameters are required' });
  }

  // Convert query parameters to numbers for comparison
  const numId1 = Number(id1);
  const numId2 = Number(id2);

  // Ensure both IDs are valid numeric values
  if (isNaN(numId1) || isNaN(numId2)) {
    return res.status(400).json({ error: 'Both id1 and id2 must be numeric values' });
  }

  try {
    const superheroes = await loadSuperheroes();
    
    // Find both heroes in the dataset
    const hero1 = superheroes.find((hero: any) => hero.id === numId1);
    const hero2 = superheroes.find((hero: any) => hero.id === numId2);

    // Verify both heroes exist
    if (!hero1) {
      return res.status(404).json({ error: `Superhero with id ${id1} not found` });
    }

    if (!hero2) {
      return res.status(404).json({ error: `Superhero with id ${id2} not found` });
    }

    // Define the six powerstat categories to compare
    const categories = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];
    
    // Initialize the comparison result structure
    const comparison: any = {
      hero1: {
        id: hero1.id,
        name: hero1.name
      },
      hero2: {
        id: hero2.id,
        name: hero2.name
      },
      categories: [],
      overall_winner: null
    };

    // Track wins for each hero across all categories
    let hero1Wins = 0;
    let hero2Wins = 0;

    // Compare each powerstat category
    categories.forEach(category => {
      const stat1 = hero1.powerstats[category];
      const stat2 = hero2.powerstats[category];
      let winner = null;

      // Award a point to the hero with the higher stat value
      // If stats are equal, no points are awarded (tie)
      if (stat1 > stat2) {
        winner = hero1.id;
        hero1Wins++;
      } else if (stat2 > stat1) {
        winner = hero2.id;
        hero2Wins++;
      }

      // Record the comparison result for this category
      comparison.categories.push({
        category,
        hero1_value: stat1,
        hero2_value: stat2,
        winner
      });
    });

    // Determine overall winner based on total category wins
    // If wins are equal, overall_winner remains null (tie)
    if (hero1Wins > hero2Wins) {
      comparison.overall_winner = hero1.id;
    } else if (hero2Wins > hero1Wins) {
      comparison.overall_winner = hero2.id;
    }

    res.json(comparison);
  } catch (err) {
    console.error('Error comparing superheroes:', err);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /api/superheroes/:id
 * Returns a single superhero by their unique ID.
 *
 * Params: id (string) - The unique identifier of the superhero
 * Response: 200 OK - Superhero object
 *           404 Not Found - If the superhero does not exist
 *           500 Internal Server Error - If data cannot be read
 */
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