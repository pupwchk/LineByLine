import { z } from "zod";

export const FacilityType = z.enum(["CAFETERIA", "LIBRARY", "GYM", "ETC"]);
export type FacilityType = z.infer<typeof FacilityType>;

export const CongestionLevel = z.number().min(1).max(5);
export type CongestionLevel = z.infer<typeof CongestionLevel>;

export const WaitingStatus = z.enum(["WAITING", "CALLED", "COMPLETED", "CANCELLED", "NO_SHOW"]);
export type WaitingStatus = z.infer<typeof WaitingStatus>;

export const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  radius: z.number(),
  address: z.string(),
  building: z.string().optional(),
});
export type Location = z.infer<typeof locationSchema>;

export const operatingHoursSchema = z.object({
  open: z.string(),
  close: z.string(),
});
export type OperatingHours = z.infer<typeof operatingHoursSchema>;

export const cornerSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  menu: z.string().optional(),
  price: z.number().optional(),
  congestion: CongestionLevel,
  waitTime: z.number(),
  currentQueue: z.number(),
  available: z.number().optional(),
  capacity: z.number().optional(),
  operatingHours: z.string().optional(),
});
export type Corner = z.infer<typeof cornerSchema>;

export const facilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: FacilityType,
  location: locationSchema,
  capacity: z.number(),
  avgServiceTime: z.number(),
  corners: z.array(cornerSchema),
  avgCongestion: CongestionLevel,
});
export type Facility = z.infer<typeof facilitySchema>;

export const hourlyDataSchema = z.object({
  hour: z.string(),
  congestion: z.number(),
});
export type HourlyData = z.infer<typeof hourlyDataSchema>;

export const waitingSchema = z.object({
  id: z.string(),
  facilityId: z.string(),
  facilityName: z.string(),
  cornerId: z.string(),
  cornerName: z.string(),
  cornerType: z.string(),
  menu: z.string().optional(),
  waitingNumber: z.number(),
  status: WaitingStatus,
  registeredAt: z.string(),
  estimatedTime: z.number(),
  waitingAhead: z.number(),
  currentCalling: z.number(),
});
export type Waiting = z.infer<typeof waitingSchema>;

export const insertWaitingSchema = z.object({
  facilityId: z.string(),
  facilityName: z.string(),
  cornerId: z.string(),
  cornerName: z.string(),
  cornerType: z.string(),
  menu: z.string().optional(),
});
export type InsertWaiting = z.infer<typeof insertWaitingSchema>;

export const historyItemSchema = z.object({
  id: z.string(),
  facility: z.string(),
  date: z.string(),
  status: WaitingStatus,
  statusText: z.string(),
});
export type HistoryItem = z.infer<typeof historyItemSchema>;

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  noShowCount: z.number(),
  penaltyUntil: z.string().nullable(),
});
export type User = z.infer<typeof userSchema>;

export type InsertUser = Omit<User, "id">;
