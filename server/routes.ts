import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateGames, generateNews, generateStandings, generateTicketListings, generatePlays, NFL_TEAMS_DATA } from "./nfl-data";
import OpenAI from "openai";
import { translationRequestSchema } from "@shared/schema";
import { WebSocketServer, WebSocket } from "ws";

// Lazy OpenAI initialization
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ============== NFL Games API ==============
  
  // Get all games (with optional week filter)
  app.get("/api/games", (req, res) => {
    const games = generateGames();
    res.json(games);
  });
  
  // Get specific game by ID
  app.get("/api/games/:id", (req, res) => {
    const games = generateGames();
    const game = games.find(g => g.id === req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    res.json(game);
  });
  
  // Get plays for a game
  app.get("/api/games/:id/plays", (req, res) => {
    const plays = generatePlays(req.params.id);
    res.json(plays);
  });
  
  // ============== NFL Teams API ==============
  
  // Get all teams
  app.get("/api/teams", (req, res) => {
    res.json(NFL_TEAMS_DATA);
  });
  
  // Get specific team by ID
  app.get("/api/teams/:id", (req, res) => {
    const team = NFL_TEAMS_DATA.find(t => 
      t.id === req.params.id || t.abbreviation.toLowerCase() === req.params.id.toLowerCase()
    );
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    res.json(team);
  });
  
  // Get team schedule
  app.get("/api/teams/:id/schedule", (req, res) => {
    const games = generateGames().filter(g => 
      g.homeTeam.id === req.params.id || g.awayTeam.id === req.params.id
    );
    res.json(games);
  });
  
  // Get team news
  app.get("/api/teams/:id/news", (req, res) => {
    const news = generateNews().filter(n => 
      n.teams.includes(req.params.id)
    );
    res.json(news);
  });
  
  // ============== NFL News API ==============
  
  app.get("/api/news", (req, res) => {
    const news = generateNews();
    res.json(news);
  });
  
  // ============== NFL Standings API ==============
  
  app.get("/api/standings", (req, res) => {
    const standings = generateStandings();
    res.json(standings);
  });
  
  // ============== NFL Schedule API ==============
  
  app.get("/api/schedule", (req, res) => {
    const games = generateGames();
    res.json(games);
  });
  
  app.get("/api/schedule/:week", (req, res) => {
    // For now, return all games (in production would filter by week)
    const games = generateGames();
    res.json(games);
  });
  
  // ============== Tickets API ==============
  
  app.get("/api/tickets", (req, res) => {
    const listings = generateTicketListings();
    res.json(listings);
  });
  
  app.get("/api/games/:id/tickets", (req, res) => {
    const listings = generateTicketListings(req.params.id);
    res.json(listings);
  });
  
  // ============== Translation API (AI-powered) ==============
  
  app.post("/api/translate", async (req, res) => {
    try {
      const parsed = translationRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
      }
      
      const { text, targetLanguage, sourceLanguage } = parsed.data;
      
      const client = getOpenAI();
      if (!client) {
        return res.status(503).json({ error: "Translation service not configured" });
      }
      
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional translator specializing in sports content. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Maintain the tone and context appropriate for NFL/American football content. Only respond with the translation, no explanations.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: 1024,
      });
      
      const translation = response.choices[0]?.message?.content || text;
      res.json({ translation, targetLanguage, sourceLanguage });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "Translation failed" });
    }
  });
  
  // ============== User Preferences API ==============
  
  app.get("/api/user/preferences", async (req, res) => {
    // Return default preferences for now
    res.json({
      favoriteTeamId: null,
      language: "en",
      timezone: "America/New_York",
      currency: "USD",
      darkMode: true,
    });
  });
  
  app.post("/api/user/preferences", async (req, res) => {
    // In production, would save to database
    res.json({ success: true, preferences: req.body });
  });

  // ============== WebSocket for Real-time Updates ==============
  
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = new Set<WebSocket>();
  
  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("[WebSocket] Client connected. Total clients:", clients.size);
    
    // Send initial game state
    const games = generateGames();
    ws.send(JSON.stringify({ type: "games_update", data: games }));
    
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle subscription requests
        if (data.type === "subscribe_game") {
          console.log("[WebSocket] Client subscribed to game:", data.gameId);
        }
        
        // Handle play-by-play requests
        if (data.type === "request_plays") {
          const plays = generatePlays(data.gameId);
          ws.send(JSON.stringify({ type: "plays_update", gameId: data.gameId, data: plays }));
        }
      } catch (error) {
        console.error("[WebSocket] Error parsing message:", error);
      }
    });
    
    ws.on("close", () => {
      clients.delete(ws);
      console.log("[WebSocket] Client disconnected. Total clients:", clients.size);
    });
    
    ws.on("error", (error) => {
      console.error("[WebSocket] Error:", error);
      clients.delete(ws);
    });
  });
  
  // Broadcast game updates every 10 seconds
  setInterval(() => {
    if (clients.size === 0) return;
    
    const games = generateGames();
    const message = JSON.stringify({ type: "games_update", data: games });
    
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }, 10000);
  
  // Broadcast play-by-play updates every 5 seconds for live games
  setInterval(() => {
    if (clients.size === 0) return;
    
    const games = generateGames().filter(g => g.status === "in_progress");
    games.forEach((game) => {
      const plays = generatePlays(game.id);
      const message = JSON.stringify({ type: "plays_update", gameId: game.id, data: plays.slice(-5) });
      
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
  }, 5000);

  return httpServer;
}
