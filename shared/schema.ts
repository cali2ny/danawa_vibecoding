import { z } from "zod";

export const nationSchema = z.enum(["domestic", "export"]);
export type Nation = z.infer<typeof nationSchema>;

export const radarModelSchema = z.object({
  rank: z.number(),
  prevRank: z.number().nullable(),
  modelName: z.string(),
  brand: z.string(),
  sales: z.number(),
  prevSales: z.number(),
  momAbs: z.number(),
  momPct: z.number(),
  rankChange: z.number(),
  score: z.number(),
  originalUrl: z.string(),
});

export type RadarModel = z.infer<typeof radarModelSchema>;

export const radarDataSchema = z.object({
  month: z.string(),
  nation: nationSchema,
  models: z.array(radarModelSchema),
  fetchedAt: z.string(),
});

export type RadarData = z.infer<typeof radarDataSchema>;

export const radarFiltersSchema = z.object({
  minSales: z.number().default(300),
  excludeNewEntries: z.boolean().default(false),
});

export type RadarFilters = z.infer<typeof radarFiltersSchema>;

export const users = undefined;
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string };
