import type { Express } from "express";
import { createServer, type Server } from "http";
import { getRadarData } from "./radarService";
import { nationSchema } from "@shared/schema";
import { z } from "zod";

const querySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
  nation: nationSchema
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/radar", async (req, res) => {
    try {
      const parsed = querySchema.safeParse({
        month: req.query.month,
        nation: req.query.nation
      });

      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid parameters",
          details: parsed.error.errors 
        });
      }

      const { month, nation } = parsed.data;
      const data = await getRadarData(month, nation);
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching radar data:", error);
      res.status(500).json({ error: "Failed to fetch radar data" });
    }
  });

  return httpServer;
}
