# Backend API Documentation

This document provides detailed information about the Superheroes API endpoints.

## Base URL

When running locally:
- Development: `http://localhost:3000`
- Test: `http://localhost:3002` (when `TEST_PORT=3002` is set)

## GET /api/superheroes/:id

Retrieves a single superhero by their unique identifier.

### Endpoint

```
GET /api/superheroes/:id
```

### Description

This endpoint returns complete information about a specific superhero including their ID, name, image URL, and powerstats. The superhero is identified by a numeric ID passed as a URL parameter.

### URL Parameters

| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| `id`      | string | Yes      | The unique identifier of the superhero         |

**Note:** The `id` parameter is matched as a string but corresponds to numeric superhero IDs in the data. Both numeric and string representations are accepted (e.g., `1` or `"1"`).

### Request Examples

#### Using curl

```bash
# Get superhero with ID 1 (A-Bomb)
curl http://localhost:3000/api/superheroes/1

# Get superhero with ID 2 (Ant-Man)
curl http://localhost:3000/api/superheroes/2
```

#### Using JavaScript fetch

```javascript
// Example: Fetch superhero by ID
async function getSuperhero(id) {
  const response = await fetch(`http://localhost:3000/api/superheroes/${id}`);
  
  if (response.ok) {
    const superhero = await response.json();
    console.log(superhero);
  } else if (response.status === 404) {
    console.error('Superhero not found');
  } else {
    console.error('Server error');
  }
}

getSuperhero(1);
```

#### From Frontend (with CRA proxy)

When using Create React App with the proxy configured to `http://localhost:3000`:

```javascript
// Relative URL - proxied to backend
const response = await fetch('/api/superheroes/1');
const superhero = await response.json();
```

### Response Format

#### Success Response (200 OK)

Returns a JSON object containing the superhero's complete data:

**Response Body:**

```json
{
  "id": 1,
  "name": "A-Bomb",
  "image": "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg/1-a-bomb.jpg",
  "powerstats": {
    "intelligence": 38,
    "strength": 100,
    "speed": 17,
    "durability": 80,
    "power": 24,
    "combat": 64
  }
}
```

**Response Fields:**

| Field                | Type   | Description                                          |
|----------------------|--------|------------------------------------------------------|
| `id`                 | number | Unique identifier for the superhero                  |
| `name`               | string | The superhero's name                                 |
| `image`              | string | URL to the superhero's image                         |
| `powerstats`         | object | Object containing six power statistics               |
| `powerstats.intelligence` | number | Intelligence rating (0-100)                    |
| `powerstats.strength`     | number | Strength rating (0-100)                        |
| `powerstats.speed`        | number | Speed rating (0-100)                           |
| `powerstats.durability`   | number | Durability rating (0-100)                      |
| `powerstats.power`        | number | Power rating (0-100)                           |
| `powerstats.combat`       | number | Combat skill rating (0-100)                    |

### Status Codes

| Status Code | Description                                                      |
|-------------|------------------------------------------------------------------|
| `200`       | Success - Returns the superhero object                           |
| `404`       | Not Found - No superhero exists with the provided ID             |
| `500`       | Internal Server Error - Failed to read or parse data file        |

### Error Responses

#### 404 Not Found

Returned when no superhero with the specified ID exists in the database.

**Response Body:** (plain text)

```
Superhero not found
```

**Example scenarios:**
- Requesting an ID that doesn't exist: `/api/superheroes/9999`
- Requesting a non-numeric ID: `/api/superheroes/abc`

#### 500 Internal Server Error

Returned when the server encounters an error reading or parsing the data file.

**Response Body:** (plain text)

```
Internal Server Error
```

**Example scenarios:**
- The `backend/data/superheroes.json` file is missing or corrupted
- File system permission issues prevent reading the data file
- Invalid JSON syntax in the data file

### Implementation Details

The endpoint is implemented in `backend/src/server.ts`:

```typescript
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
```

**Key behaviors:**
- IDs are compared as strings to handle both numeric and string inputs
- Data is loaded fresh on each request from `backend/data/superheroes.json`
- Errors are logged to the console for debugging
- No caching is implemented (data is read from disk on every request)

### Testing

The endpoint is covered by tests in `backend/tests/server.test.ts`:

```bash
cd backend
npm test
```

Test coverage includes:
- ✓ Successful retrieval of a superhero by valid ID
- ✓ 404 response when superhero doesn't exist
- ✓ Handling of non-numeric IDs gracefully
- ✓ Response contains all required fields

### Related Endpoints

- **[GET /api/superheroes](API_DOCUMENTATION.md#get-apisuperheroes)** - Get all superheroes
- **[GET /api/superheroes/:id/powerstats](API_DOCUMENTATION.md#get-apisuperheroesidpowerstats)** - Get only powerstats for a superhero
- **[GET /api/superheroes/compare](API_DOCUMENTATION.md#get-apisuperheroescompare)** - Compare two superheroes

### Data Source

The superhero data is stored in:
```
backend/data/superheroes.json
```

The data includes multiple superheroes with IDs ranging from 1 upward. Sample heroes include:
- ID 1: A-Bomb
- ID 2: Ant-Man
- ID 3: Bane

### Usage in Frontend

The frontend application (`frontend/src/`) uses this endpoint to fetch individual superhero details. When a user selects superheroes for comparison, the frontend makes requests to this endpoint to retrieve complete hero information.

### Notes

- **No Authentication:** This endpoint does not require authentication or authorization
- **CORS:** Cross-origin requests are not explicitly configured; adjust if needed for production
- **Rate Limiting:** No rate limiting is implemented
- **Caching:** No response caching headers are set
- **Data Validation:** The endpoint trusts the data in `superheroes.json` to be well-formed
