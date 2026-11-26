import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { getRandomPuzzle } from "./puzzleRepository.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const port = Number(process.env.PORT ?? 3000);
const staticFiles = new Map([
  ["/", ["public/index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["public/styles.css", "text/css; charset=utf-8"]],
  ["/app.js", ["public/app.js", "text/javascript; charset=utf-8"]],
  ["/sudoku.js", ["public/sudoku.js", "text/javascript; charset=utf-8"]],
]);
const difficulties = new Set(["Easy", "Medium", "Hard", "Expert"]);

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(data));
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);

  if (url.pathname === "/api/puzzle") {
    if (request.method !== "GET") {
      sendJson(response, 405, { error: "Method not allowed." });
      return;
    }

    const difficulty = url.searchParams.get("difficulty") ?? "Easy";
    if (!difficulties.has(difficulty)) {
      sendJson(response, 400, { error: "Invalid difficulty level." });
      return;
    }

    try {
      const puzzle = await getRandomPuzzle(difficulty, path.join(root, "data", "sudoku-3m.csv"));
      sendJson(response, 200, puzzle);
    } catch (error) {
      console.error("Unable to load a puzzle from data/sudoku-3m.csv:", error);
      sendJson(response, 500, { error: "Unable to load a puzzle from data/sudoku-3m.csv." });
    }

    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  const asset = staticFiles.get(url.pathname);
  if (!asset) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Page not found.");
    return;
  }

  try {
    const body = await readFile(path.join(root, asset[0]));
    response.writeHead(200, {
      "Content-Type": asset[1],
      "X-Content-Type-Options": "nosniff",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch (error) {
    console.error(`Unable to read ${asset[0]}:`, error);
    sendJson(response, 500, { error: "Unable to load the application." });
  }
});

server.listen(port, () => {
  console.log(`Sudoku disponible sur http://localhost:${port}`);
});
