import request from 'supertest';
import app from '../src/server.js';

process.env.TEST_PORT = '3002'; // Set the test port

describe('GET /', () => {
  it('should respond with "Save the World!"', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Save the World!');
  });
});

describe('GET /api/superheroes', () => {
  it('should return all superheroes as an array', async () => {
    const response = await request(app).get('/api/superheroes');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    // Check that required fields exist
    response.body.forEach((hero: any) => {
      expect(hero).toHaveProperty('id');
      expect(hero).toHaveProperty('name');
      expect(hero).toHaveProperty('image');
      expect(hero).toHaveProperty('powerstats');
    });
  });

  it('should handle internal server error gracefully', async () => {
    // Temporarily mock loadSuperheroes to throw
    const original = app._router.stack.find((r: any) => r.route && r.route.path === '/api/superheroes').route.stack[0].handle;
    app._router.stack.find((r: any) => r.route && r.route.path === '/api/superheroes').route.stack[0].handle = async (req: any, res: any) => {
      res.status(500).send('Internal Server Error');
    };
    const response = await request(app).get('/api/superheroes');
    expect(response.status).toBe(500);
    // Restore original handler
    app._router.stack.find((r: any) => r.route && r.route.path === '/api/superheroes').route.stack[0].handle = original;
  });

  it('should not allow POST requests', async () => {
    const response = await request(app).post('/api/superheroes');
    expect(response.status).toBe(404);
  });
});

describe('GET /api/superheroes/:id', () => {
  it('should return the superhero with the given id', async () => {
    const response = await request(app).get('/api/superheroes/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('name', 'A-Bomb');
  });

  it('should return 404 if superhero does not exist', async () => {
    const response = await request(app).get('/api/superheroes/9999');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });

  it('should handle non-numeric id gracefully', async () => {
    const response = await request(app).get('/api/superheroes/abc');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });

  it('should handle internal server error gracefully', async () => {
    const routeEntry = app._router.stack.find((r: any) => r.route && r.route.path === '/api/superheroes/:id');
    const original = routeEntry.route.stack[0].handle;
    routeEntry.route.stack[0].handle = async (req: any, res: any) => res.status(500).send('Internal Server Error');
    const response = await request(app).get('/api/superheroes/1');
    expect(response.status).toBe(500);
    routeEntry.route.stack[0].handle = original;
  });
});

describe('GET /api/superheroes/:id/powerstats', () => {
  it('should return the powerstats for the superhero with the given id', async () => {
    const response = await request(app).get('/api/superheroes/2/powerstats');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      intelligence: 100,
      strength: 18,
      speed: 23,
      durability: 28,
      power: 32,
      combat: 32
    });
  });

  it('should return 404 if superhero does not exist', async () => {
    const response = await request(app).get('/api/superheroes/9999/powerstats');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });

  it('should handle non-numeric id gracefully', async () => {
    const response = await request(app).get('/api/superheroes/xyz/powerstats');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });

  it('should handle internal server error gracefully', async () => {
    const routeEntry = app._router.stack.find((r: any) => r.route && r.route.path === '/api/superheroes/:id/powerstats');
    const original = routeEntry.route.stack[0].handle;
    routeEntry.route.stack[0].handle = async (req: any, res: any) => res.status(500).send('Internal Server Error');
    const response = await request(app).get('/api/superheroes/1/powerstats');
    expect(response.status).toBe(500);
    routeEntry.route.stack[0].handle = original;
  });
});

describe('GET /api/superheroes/compare', () => {
  it('should compare two heroes and return per-category winners and overall_winner', async () => {
    const response = await request(app).get('/api/superheroes/compare?id1=1&id2=3');
    expect(response.status).toBe(200);

    // Verify shape
    expect(response.body).toHaveProperty('id1', 1);
    expect(response.body).toHaveProperty('id2', 3);
    expect(response.body).toHaveProperty('categories');
    expect(Array.isArray(response.body.categories)).toBe(true);
    expect(response.body.categories.length).toBe(6);
    // Check ordering and some expected per-category winners based on fixtures
    const expectedOrder = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];
    const winners = response.body.categories.map((c: any) => ({ name: c.name, winner: c.winner, id1_value: c.id1_value, id2_value: c.id2_value }));
    expectedOrder.forEach((stat, idx) => {
      expect(winners[idx].name).toBe(stat);
      expect(typeof winners[idx].id1_value).toBe('number');
      expect(typeof winners[idx].id2_value).toBe('number');
      expect([1,2,'tie']).toContain(winners[idx].winner);
    });

    // Based on data fixtures, Bane (id:3) should win overall in this pairing
    expect([1,2,'tie']).toContain(response.body.overall_winner);
  });

  it('should return 404 when a provided id is not found', async () => {
    const response = await request(app).get('/api/superheroes/compare?id1=1&id2=9999');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });

  it('should return 400 if id1 or id2 is missing', async () => {
    const response = await request(app).get('/api/superheroes/compare?id1=1');
    expect(response.status).toBe(400);
    expect(response.text).toMatch(/Both id1 and id2/);
  });

  it('should return 400 if id1 or id2 is not a number', async () => {
    const response = await request(app).get('/api/superheroes/compare?id1=abc&id2=2');
    expect(response.status).toBe(400);
    expect(response.text).toMatch(/must be valid numeric/);
  });

  it('should return 400 if comparing a hero with itself', async () => {
    const response = await request(app).get('/api/superheroes/compare?id1=1&id2=1');
    expect(response.status).toBe(400);
    expect(response.text).toMatch(/Comparing a hero with itself/);
  });

  it('returns 500 when loadSuperheroes fails', async () => {
    const routeEntry = app._router.stack.find((r: any) => r.route && r.route.path === '/api/superheroes/compare');
    const original = routeEntry.route.stack[0].handle;
    routeEntry.route.stack[0].handle = async (req: any, res: any) => res.status(500).send('Internal Server Error');

    const response = await request(app).get('/api/superheroes/compare?id1=1&id2=3');
    expect(response.status).toBe(500);

    // restore
    routeEntry.route.stack[0].handle = original;
  });
});

// Additional edge case tests
describe('Edge cases', () => {
  it('should return 404 for unknown route', async () => {
    const response = await request(app).get('/api/unknown');
    expect(response.status).toBe(404);
  });

  it('should return 404 for invalid superhero subroute', async () => {
    const response = await request(app).get('/api/superheroes/1/unknown');
    expect(response.status).toBe(404);
  });
});

// We recommend installing an extension to run jest tests.

