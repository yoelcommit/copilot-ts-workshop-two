import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// TypeScript Interfaces
interface Powerstats {
  intelligence: number;
  strength: number;
  speed: number;
  durability: number;
  power: number;
  combat: number;
}

interface Superhero {
  id: string | number;
  name: string;
  image: string;
  powerstats: Powerstats;
}

// Data Loading Function
async function loadSuperheroes(): Promise<Superhero[]> {
  try {
    const data = await fs.promises.readFile(
      path.join(__dirname, "../data", "superheroes.json"),
      "utf-8"
    );
    return JSON.parse(data) as Superhero[];
  } catch (err) {
    throw new Error(
      `Failed to load superheroes data: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

// Markdown Formatting Function
function formatSuperheroMarkdown(hero: Superhero): string {
  return `Here is the data for ${hero.name} retrieved using the superheroes MCP:

• Name: ${hero.name}
• Image: <img src="${hero.image}" alt="${hero.name}"/>
• Powerstats:
  • Intelligence: ${hero.powerstats.intelligence}
  • Strength: ${hero.powerstats.strength}
  • Speed: ${hero.powerstats.speed}
  • Durability: ${hero.powerstats.durability}
  • Power: ${hero.powerstats.power}
  • Combat: ${hero.powerstats.combat}`;
}

// MCP Server Configuration
const server = new McpServer({
  name: "superheroes-mcp",
  version: "1.0.0",
  // capabilities are managed internally; keeping empty placeholders per prompt
});

// Tool Definition using registerTool (per SDK)
server.registerTool(
  "get_superhero",
  {
    description: "Get superhero details by name or id",
    inputSchema: {
      name: z.string().optional().describe("Name of the superhero (optional)"),
      id: z.string().optional().describe("ID of the superhero (optional)"),
    },
  },
  async ({ name, id }: { name?: string; id?: string }) => {
    const superheroes = await loadSuperheroes();

    const nameLc = (name ?? "").toLowerCase();
    const idStr = id ?? "";

    const hero = superheroes.find((h) => {
      const heroNameLc = h.name?.toLowerCase() ?? "";
      const heroIdStr = h.id?.toString() ?? "";
      return (nameLc && heroNameLc === nameLc) || (idStr && heroIdStr === idStr);
    });

    if (!hero) {
      throw new Error("Superhero not found");
    }

    const markdown = formatSuperheroMarkdown(hero);

    return {
      content: [
        {
          type: "text",
          text: markdown,
        },
      ],
    };
  }
);

// Main Function
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Superhero MCP Server running on stdio");
}

// Error Handling
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
