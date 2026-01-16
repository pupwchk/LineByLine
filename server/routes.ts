import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertWaitingSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);

    ws.on("close", () => {
      clients.delete(ws);
    });

    ws.on("error", () => {
      clients.delete(ws);
    });
  });

  const broadcastUpdate = async () => {
    const facilities = await storage.getFacilities();
    const message = JSON.stringify({
      type: "UPDATE",
      data: { facilities, timestamp: new Date().toISOString() },
    });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  setInterval(broadcastUpdate, 30000);

  app.get("/api/facilities", async (_req, res) => {
    try {
      const facilities = await storage.getFacilities();
      res.json({
        facilities,
        lastUpdate: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch facilities" });
    }
  });

  app.get("/api/facilities/:id", async (req, res) => {
    try {
      const facility = await storage.getFacility(req.params.id);
      if (!facility) {
        return res.status(404).json({ error: "Facility not found" });
      }
      res.json(facility);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch facility" });
    }
  });

  app.get("/api/waiting", async (req, res) => {
    try {
      const sessionId = req.sessionID || "guest";
      const waiting = await storage.getActiveWaiting(sessionId);
      res.json({ waiting });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch waiting status" });
    }
  });

  app.post("/api/waiting", async (req, res) => {
    try {
      const sessionId = req.sessionID || "guest";

      const existingWaiting = await storage.getActiveWaiting(sessionId);
      if (existingWaiting) {
        return res.status(400).json({ error: "Already have an active waiting" });
      }

      const result = insertWaitingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request data", details: result.error.issues });
      }

      const facility = await storage.getFacility(result.data.facilityId);
      if (!facility) {
        return res.status(404).json({ error: "Facility not found" });
      }

      const corner = facility.corners.find((c) => c.id === result.data.cornerId);
      if (!corner) {
        return res.status(404).json({ error: "Corner not found" });
      }

      if (corner.congestion >= 5) {
        return res.status(400).json({ error: "This corner is currently full" });
      }

      const waiting = await storage.createWaiting(sessionId, result.data, corner);
      res.status(201).json({ waiting });
    } catch (error) {
      res.status(500).json({ error: "Failed to create waiting" });
    }
  });

  app.delete("/api/waiting", async (req, res) => {
    try {
      const sessionId = req.sessionID || "guest";
      const success = await storage.cancelWaiting(sessionId);
      if (!success) {
        return res.status(404).json({ error: "No active waiting found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to cancel waiting" });
    }
  });

  app.get("/api/history", async (req, res) => {
    try {
      const sessionId = req.sessionID || "guest";
      const history = await storage.getWaitingHistory(sessionId);
      res.json({ history });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  return httpServer;
}
