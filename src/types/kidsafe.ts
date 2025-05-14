
export type UserRole = "parent" | "child";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  deviceId: string;
  dailyTimeLimit: number; // in minutes
  usedTime: number; // in minutes
  isOnline: boolean;
  isLocked: boolean;
  blockedWebsites: string[];
}

export type AppCategory = 
  | "games"
  | "social"
  | "education"
  | "entertainment"
  | "productivity"
  | "other";

export interface UsageLog {
  id: string;
  childId: string;
  date: string;
  website?: string;
  app?: string;
  category: AppCategory;
  duration: number; // in minutes
  startTime: string; // ISO string
  endTime: string; // ISO string
}

export interface DailyUsage {
  date: string;
  totalTime: number; // in minutes
  breakdownByCategory: {
    [key in AppCategory]?: number;
  };
}

export interface Alert {
  id: string;
  childId: string;
  type: "time_limit" | "blocked_website" | "new_app";
  message: string;
  timestamp: string;
  read: boolean;
}
