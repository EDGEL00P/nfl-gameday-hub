import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, real, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export chat models for AI integration
export * from "./models/chat";

// Users table for preferences and favorites
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  favoriteTeamId: text("favorite_team_id"),
  language: text("language").default("en"),
  timezone: text("timezone").default("America/New_York"),
  currency: text("currency").default("USD"),
  darkMode: boolean("dark_mode").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User tickets/wallet
export const userTickets = pgTable("user_tickets", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  gameId: text("game_id").notNull(),
  section: text("section").notNull(),
  row: text("row").notNull(),
  seat: text("seat").notNull(),
  price: real("price").notNull(),
  currency: text("currency").default("USD"),
  qrCode: text("qr_code"),
  purchasedAt: timestamp("purchased_at").default(sql`CURRENT_TIMESTAMP`),
  status: text("status").default("active"),
});

export const insertUserTicketSchema = createInsertSchema(userTickets).omit({
  id: true,
  purchasedAt: true,
});

export type InsertUserTicket = z.infer<typeof insertUserTicketSchema>;
export type UserTicket = typeof userTickets.$inferSelect;

// ============== TypeScript interfaces for NFL data (fetched from ESPN API) ==============

// NFL Team interface
export interface NFLTeam {
  id: string;
  apiId?: number;
  name: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  location: string;
  color: string;
  alternateColor: string;
  logo: string;
  conference: "AFC" | "NFC";
  division: "East" | "West" | "North" | "South";
  stadium: NFLStadium;
  record?: TeamRecord;
}

export interface TeamRecord {
  wins: number;
  losses: number;
  ties: number;
  winPercentage: number;
  conferenceRecord: string;
  divisionRecord: string;
  homeRecord: string;
  awayRecord: string;
  streak: string;
  pointsFor: number;
  pointsAgainst: number;
}

export interface NFLStadium {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  capacity: number;
  surface: string;
  roofType: "Open" | "Retractable" | "Dome";
  latitude: number;
  longitude: number;
  timezone: string;
  imageUrl?: string;
  sections: StadiumSection[];
  amenities: StadiumAmenity[];
}

export interface StadiumSection {
  id: string;
  name: string;
  level: "Field" | "Lower" | "Club" | "Upper" | "Suite";
  category: "Premium" | "Standard" | "Value";
  priceRange: { min: number; max: number };
  viewRating: number;
  description: string;
}

export interface StadiumAmenity {
  type: "food" | "restroom" | "parking" | "wifi" | "accessibility" | "merchandise";
  name: string;
  location: string;
  description: string;
}

// NFL Game interface
export interface NFLGame {
  id: string;
  date: string;
  time: string;
  status: GameStatus;
  homeTeam: NFLTeam;
  awayTeam: NFLTeam;
  homeScore: number;
  awayScore: number;
  quarter: number;
  timeRemaining: string;
  possession: string;
  down: number;
  distance: number;
  yardLine: number;
  redZone: boolean;
  broadcasts: Broadcast[];
  weather?: GameWeather;
  venue: string;
  attendance?: number;
  odds?: GameOdds;
}

export type GameStatus = "scheduled" | "pregame" | "in_progress" | "halftime" | "final" | "postponed" | "cancelled";

export interface Broadcast {
  network: string;
  type: "tv" | "radio" | "streaming";
  callLetters?: string;
  market?: string;
  language?: string;
}

export interface GameWeather {
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  icon: string;
}

export interface GameOdds {
  spread: number;
  overUnder: number;
  homeMoneyline: number;
  awayMoneyline: number;
  provider: string;
}

// Play-by-play interface
export interface Play {
  id: string;
  gameId: string;
  quarter: number;
  time: string;
  down: number;
  distance: number;
  yardLine: number;
  team: string;
  type: PlayType;
  description: string;
  yards: number;
  isScoring: boolean;
  isTurnover: boolean;
  isBigPlay: boolean;
  players: PlayPlayer[];
}

export type PlayType = "rush" | "pass" | "sack" | "punt" | "kickoff" | "field_goal" | "extra_point" | "two_point" | "penalty" | "timeout" | "touchdown" | "interception" | "fumble" | "safety";

export interface PlayPlayer {
  id: string;
  name: string;
  position: string;
  team: string;
  role: string;
  stats?: Record<string, number>;
}

// Drive interface
export interface Drive {
  id: string;
  gameId: string;
  team: string;
  startQuarter: number;
  startTime: string;
  startYardLine: number;
  endQuarter: number;
  endTime: string;
  endYardLine: number;
  plays: number;
  yards: number;
  timeOfPossession: string;
  result: "touchdown" | "field_goal" | "punt" | "turnover" | "downs" | "end_of_half" | "safety" | "in_progress";
  isScoring: boolean;
}

// Player interface
export interface NFLPlayer {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  position: string;
  positionGroup: string;
  jersey: string;
  team: string;
  teamId: string;
  height: string;
  weight: number;
  age: number;
  college: string;
  experience: number;
  status: "active" | "injured" | "questionable" | "doubtful" | "out" | "ir" | "pup";
  injury?: PlayerInjury;
  headshot?: string;
  stats?: PlayerStats;
  fantasyPoints?: number;
}

export interface PlayerInjury {
  type: string;
  status: string;
  date: string;
  returnDate?: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  passingYards?: number;
  passingTouchdowns?: number;
  interceptions?: number;
  rushingYards?: number;
  rushingTouchdowns?: number;
  receivingYards?: number;
  receivingTouchdowns?: number;
  receptions?: number;
  tackles?: number;
  sacks?: number;
  forcedFumbles?: number;
  qbRating?: number;
}

// Standings interface
export interface StandingsEntry {
  team: NFLTeam;
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  winPercentage: number;
  conferenceWins: number;
  conferenceLosses: number;
  divisionWins: number;
  divisionLosses: number;
  homeWins: number;
  homeLosses: number;
  awayWins: number;
  awayLosses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifferential: number;
  streak: string;
  last5: string;
  clinched?: "division" | "playoff" | "bye" | "eliminated";
  playoffSeed?: number;
}

// News interface
export interface NFLNews {
  id: string;
  headline: string;
  description: string;
  story?: string;
  published: string;
  author?: string;
  source: string;
  imageUrl?: string;
  videoUrl?: string;
  categories: string[];
  teams: string[];
  premium: boolean;
  sentiment?: "positive" | "negative" | "neutral";
}

// Ticket listing interface
export interface TicketListing {
  id: string;
  gameId: string;
  broker: "ticketmaster" | "stubhub" | "seatgeek";
  section: string;
  row: string;
  seats: number;
  price: number;
  currency: string;
  fees: number;
  totalPrice: number;
  seatView?: string;
  rating?: number;
  deliveryType: "mobile" | "electronic" | "physical";
  available: boolean;
  url: string;
}

// Radio station interface
export interface RadioStation {
  id: string;
  teamId: string;
  name: string;
  callSign: string;
  frequency: string;
  type: "AM" | "FM" | "Internet";
  streamUrl?: string;
  market: string;
  language: string;
  isPrimary: boolean;
}

// International timezone info
export interface TimezoneInfo {
  id: string;
  name: string;
  abbreviation: string;
  offset: number;
  country: string;
  flag: string;
}

// Currency info
export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  country: string;
  flag: string;
}

// Language info
export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}
