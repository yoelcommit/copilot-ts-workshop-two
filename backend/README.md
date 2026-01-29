# Superhero API Backend

Express TypeScript API server for superhero data and comparisons.

## Installation

```bash
npm install
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server runs on port 3000 by default (configurable via `PORT` environment variable).

## Testing

```bash
npm test
```

## API Endpoints

### Health Check

#### GET `/`
Returns a welcome message to verify the server is running.

**Response:**
```
Save the World!
```

---

### Get All Superheroes

#### GET `/api/superheroes`
Returns a list of all superheroes in the database.

**Example Request:**
```bash
curl http://localhost:3000/api/superheroes
```

**Example Response:**
```json
[
  {
    "id": 1,
    "name": "A-Bomb",
    "powerstats": {
      "intelligence": 38,
      "strength": 100,
      "speed": 17,
      "durability": 80,
      "power": 24,
      "combat": 64
    },
    "image": "https://..."
  },
  {
    "id": 2,
    "name": "Ant-Man",
    "powerstats": {
      "intelligence": 50,
      "strength": 28,
      "speed": 35,
      "durability": 40,
      "power": 38,
      "combat": 32
    },
    "image": "https://..."
  }
]
```

---

### Get Superhero by ID

#### GET `/api/superheroes/:id`
Returns detailed information about a specific superhero.

**Parameters:**
- `id` (path parameter) - The unique identifier of the superhero

**Example Request:**
```bash
curl http://localhost:3000/api/superheroes/1
```

**Example Response:**
```json
{
  "id": 1,
  "name": "A-Bomb",
  "powerstats": {
    "intelligence": 38,
    "strength": 100,
    "speed": 17,
    "durability": 80,
    "power": 24,
    "combat": 64
  },
  "image": "https://..."
}
```

**Error Responses:**
- `404 Not Found` - Superhero with the specified ID does not exist

---

### Get Superhero Powerstats

#### GET `/api/superheroes/:id/powerstats`
Returns only the powerstats for a specific superhero.

**Parameters:**
- `id` (path parameter) - The unique identifier of the superhero

**Example Request:**
```bash
curl http://localhost:3000/api/superheroes/1/powerstats
```

**Example Response:**
```json
{
  "intelligence": 38,
  "strength": 100,
  "speed": 17,
  "durability": 80,
  "power": 24,
  "combat": 64
}
```

**Error Responses:**
- `404 Not Found` - Superhero with the specified ID does not exist

---

### Compare Two Superheroes

#### GET `/api/superheroes/compare`
Compares two superheroes across all powerstat categories and determines a winner.

**Query Parameters:**
- `id1` (required) - The ID of the first superhero
- `id2` (required) - The ID of the second superhero

**Comparison Logic:**
- Compares six powerstat categories: intelligence, strength, speed, durability, power, and combat
- Each category awards one point to the hero with the higher stat value
- Ties in a category award no points to either hero
- The overall winner is the hero who wins the most categories
- If both heroes win the same number of categories, `overall_winner` is `null` (tie)

**Example Request:**
```bash
curl "http://localhost:3000/api/superheroes/compare?id1=1&id2=2"
```

**Example Response:**
```json
{
  "hero1": {
    "id": 1,
    "name": "A-Bomb"
  },
  "hero2": {
    "id": 2,
    "name": "Ant-Man"
  },
  "categories": [
    {
      "category": "intelligence",
      "hero1_value": 38,
      "hero2_value": 50,
      "winner": 2
    },
    {
      "category": "strength",
      "hero1_value": 100,
      "hero2_value": 28,
      "winner": 1
    },
    {
      "category": "speed",
      "hero1_value": 17,
      "hero2_value": 35,
      "winner": 2
    },
    {
      "category": "durability",
      "hero1_value": 80,
      "hero2_value": 40,
      "winner": 1
    },
    {
      "category": "power",
      "hero1_value": 24,
      "hero2_value": 38,
      "winner": 2
    },
    {
      "category": "combat",
      "hero1_value": 64,
      "hero2_value": 32,
      "winner": 1
    }
  ],
  "overall_winner": 1
}
```

**Error Responses:**
- `400 Bad Request` - Missing or invalid query parameters
  ```json
  { "error": "Both id1 and id2 query parameters are required" }
  ```
  ```json
  { "error": "Both id1 and id2 must be numeric values" }
  ```
- `404 Not Found` - One or both superheroes not found
  ```json
  { "error": "Superhero with id 999 not found" }
  ```

---

## Data Source

Superhero data is stored in `data/superheroes.json` and loaded on each request.

## Architecture

- **Framework:** Express.js
- **Language:** TypeScript
- **Module System:** ES Modules (ESM)
- **Test Framework:** Jest with Supertest
- **Test Port:** 3002 (to avoid conflicts with development server)

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200 OK` - Successful request
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side error
