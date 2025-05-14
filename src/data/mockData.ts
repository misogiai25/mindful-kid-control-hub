
import { Alert, AppCategory, ChildProfile, DailyUsage, UsageLog, User } from "@/types/kidsafe";

export const currentUser: User = {
  id: "p1",
  email: "parent@example.com",
  name: "Alex Parent",
  role: "parent",
  avatar: "/avatar-parent.png"
};

export const children: ChildProfile[] = [
  {
    id: "c1",
    name: "Emma",
    age: 10,
    avatar: "https://images.unsplash.com/photo-1501286353178-1ec871814838?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    deviceId: "device-1",
    dailyTimeLimit: 120, // 2 hours
    usedTime: 85, // 1 hour 25 min
    isOnline: true,
    isLocked: false,
    blockedWebsites: [
      "facebook.com",
      "instagram.com",
      "tiktok.com"
    ]
  },
  {
    id: "c2",
    name: "Jack",
    age: 8,
    avatar: "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    deviceId: "device-2",
    dailyTimeLimit: 90, // 1 hour 30 min
    usedTime: 90, // maxed out
    isOnline: true,
    isLocked: true,
    blockedWebsites: [
      "youtube.com",
      "roblox.com",
      "discord.com"
    ]
  },
  {
    id: "c3",
    name: "Sophia",
    age: 12,
    avatar: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    deviceId: "device-3",
    dailyTimeLimit: 180, // 3 hours
    usedTime: 120, // 2 hours
    isOnline: false,
    isLocked: false,
    blockedWebsites: [
      "snapchat.com",
      "twitch.tv"
    ]
  }
];

const generateUsageLogs = (childId: string, date: string, count: number): UsageLog[] => {
  const categories: AppCategory[] = ["games", "social", "education", "entertainment", "productivity", "other"];
  const apps = {
    games: ["Minecraft", "Roblox", "Fortnite"],
    social: ["TikTok", "Instagram", "Discord"],
    education: ["Khan Academy", "Duolingo", "Quizlet"],
    entertainment: ["YouTube", "Netflix", "Disney+"],
    productivity: ["Google Docs", "Calculator", "Notes"],
    other: ["Chrome", "Safari", "Camera"]
  };
  const websites = {
    games: ["roblox.com", "minecraft.net", "epicgames.com"],
    social: ["tiktok.com", "instagram.com", "discord.com"],
    education: ["khanacademy.org", "duolingo.com", "quizlet.com"],
    entertainment: ["youtube.com", "netflix.com", "disneyplus.com"],
    productivity: ["docs.google.com", "office.com", "notion.so"],
    other: ["google.com", "apple.com", "wikipedia.org"]
  };
  
  const logs: UsageLog[] = [];
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const duration = Math.floor(Math.random() * 60) + 5; // 5 to 65 minutes
    const hour = Math.floor(Math.random() * 12) + 8; // Between 8 AM and 8 PM
    const minute = Math.floor(Math.random() * 60);
    
    const startTime = new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);
    
    const isApp = Math.random() > 0.5;
    
    logs.push({
      id: `log-${childId}-${i}`,
      childId,
      date,
      app: isApp ? apps[category][Math.floor(Math.random() * apps[category].length)] : undefined,
      website: !isApp ? websites[category][Math.floor(Math.random() * websites[category].length)] : undefined,
      category,
      duration,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });
  }
  
  return logs;
};

export const generateWeeklyUsageData = (childId: string): DailyUsage[] => {
  const today = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const weeklyData: DailyUsage[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today.getTime() - (i * oneDay));
    const dateString = date.toISOString().split('T')[0];
    
    const categories = ["games", "social", "education", "entertainment", "productivity", "other"] as AppCategory[];
    const breakdown: { [key in AppCategory]?: number } = {};
    let totalTime = 0;
    
    categories.forEach(category => {
      const time = Math.floor(Math.random() * (category === "education" ? 60 : 40));
      breakdown[category] = time;
      totalTime += time;
    });
    
    weeklyData.push({
      date: dateString,
      totalTime,
      breakdownByCategory: breakdown
    });
  }
  
  return weeklyData;
};

export const usageLogs: { [childId: string]: UsageLog[] } = {
  c1: generateUsageLogs("c1", new Date().toISOString().split('T')[0], 8),
  c2: generateUsageLogs("c2", new Date().toISOString().split('T')[0], 6),
  c3: generateUsageLogs("c3", new Date().toISOString().split('T')[0], 10)
};

export const weeklyUsage: { [childId: string]: DailyUsage[] } = {
  c1: generateWeeklyUsageData("c1"),
  c2: generateWeeklyUsageData("c2"),
  c3: generateWeeklyUsageData("c3")
};

export const alerts: Alert[] = [
  {
    id: "alert-1",
    childId: "c2",
    type: "time_limit",
    message: "Jack has reached their daily time limit",
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: "alert-2",
    childId: "c1",
    type: "blocked_website",
    message: "Emma attempted to access instagram.com (blocked)",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    read: true
  },
  {
    id: "alert-3",
    childId: "c3",
    type: "new_app",
    message: "Sophia installed a new app: TikTok",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false
  }
];
