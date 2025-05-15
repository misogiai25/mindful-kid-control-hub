
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Alert, ChildProfile, UsageLog, DailyUsage, AppCategory } from "@/types/kidsafe";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface KidSafeContextType {
  children: ChildProfile[];
  alerts: Alert[];
  usageLogs: { [childId: string]: UsageLog[] };
  weeklyUsage: { [childId: string]: DailyUsage[] };
  selectedChild: ChildProfile | null;
  setSelectedChild: (child: ChildProfile | null) => void;
  addChild: (child: Omit<ChildProfile, "id" | "usedTime" | "isOnline" | "isLocked">) => void;
  updateChild: (childId: string, updates: Partial<ChildProfile>) => void;
  lockDevice: (childId: string) => void;
  unlockDevice: (childId: string) => void;
  addBlockedWebsite: (childId: string, website: string) => void;
  removeBlockedWebsite: (childId: string, website: string) => void;
  markAlertAsRead: (alertId: string) => void;
  getChildById: (id: string) => ChildProfile | undefined;
  getUnreadAlertCount: () => number;
  fetchAllChildProfiles: () => Promise<void>;
}

const KidSafeContext = createContext<KidSafeContextType | undefined>(undefined);

export const KidSafeProvider = ({ children }: { children: ReactNode }) => {
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [alertsList, setAlertsList] = useState<Alert[]>([]);
  const [usageLogsList, setUsageLogsList] = useState<{ [childId: string]: UsageLog[] }>({});
  const [weeklyUsageData, setWeeklyUsageData] = useState<{ [childId: string]: DailyUsage[] }>({});
  const { toast } = useToast();
  const { user } = useAuth();

  console.log("AuthContext user in KidSafeProvider:", user);

  // Fetch child profiles when user is authenticated
  useEffect(() => {
    console.log("KidSafeProvider useEffect triggered, user:", user);
    
    // Fetch all children when the app loads for login purposes
    fetchAllChildProfiles();
    
    // Fetch user-specific children if logged in
    if (user) {
      console.log("Fetching children for user:", user.id, user.role);
      
      // Set up realtime subscription for child profile updates
      const childrenChannel = supabase
        .channel('children-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'children' },
            (payload) => {
              console.log("Children table change detected:", payload);
              if (user.role === 'parent') {
                fetchChildren();
              } else {
                fetchAllChildProfiles(); // Update all profiles for child login
              }
            })
        .subscribe();
        
      return () => {
        supabase.removeChannel(childrenChannel);
      };
    }
  }, [user]);

  // Fetch alerts when user is authenticated
  useEffect(() => {
    if (user?.role === 'parent') {
      fetchAlerts();
      
      // Set up realtime subscription for alerts
      const alertsChannel = supabase
        .channel('alerts-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'alerts' },
            (payload) => {
              fetchAlerts(); // Refetch on any changes
            })
        .subscribe();
        
      return () => {
        supabase.removeChannel(alertsChannel);
      };
    }
  }, [user]);

  // Function to fetch all child profiles regardless of login status
  // This is used for the child login dropdown
  const fetchAllChildProfiles = async () => {
    try {
      console.log("Fetching all children for login dropdown");
      const { data, error } = await supabase
        .from('children')
        .select(`
          *,
          blocked_websites(website)
        `)
        .order('name');
        
      if (error) {
        console.error('Error fetching all children:', error);
        return;
      }
      
      if (data) {
        console.log("All children data received for login:", data);
        const formattedChildren: ChildProfile[] = data.map(child => ({
          id: child.id,
          name: child.name,
          age: child.age || 0,
          avatar: child.avatar || `/placeholder.svg`,
          deviceId: child.device_id,
          dailyTimeLimit: child.daily_time_limit,
          usedTime: child.used_time,
          isOnline: child.is_online,
          isLocked: child.is_locked,
          blockedWebsites: child.blocked_websites ? child.blocked_websites.map((bw: any) => bw.website) : []
        }));
        
        console.log("Formatted all children profiles for login:", formattedChildren);
        setChildProfiles(formattedChildren);
      }
    } catch (error) {
      console.error('Error in fetchAllChildProfiles:', error);
    }
  };

  const fetchChildren = async () => {
    console.log("fetchChildren called, user:", user);
    if (!user) {
      console.log("No user, can't fetch children");
      return;
    }
    
    try {
      if (user.role === 'parent') {
        // Fetch children for parent users
        console.log("Fetching children for parent:", user.id);
        const { data, error } = await supabase
          .from('children')
          .select(`
            *,
            blocked_websites(website)
          `)
          .eq('parent_id', user.id)
          .order('name');
          
        if (error) {
          console.error('Error fetching children:', error);
          return;
        }
        
        if (data) {
          console.log("Children data received:", data);
          const formattedChildren: ChildProfile[] = data.map(child => ({
            id: child.id,
            name: child.name,
            age: child.age || 0,
            avatar: child.avatar || `/placeholder.svg`,
            deviceId: child.device_id,
            dailyTimeLimit: child.daily_time_limit,
            usedTime: child.used_time,
            isOnline: child.is_online,
            isLocked: child.is_locked,
            blockedWebsites: child.blocked_websites ? child.blocked_websites.map((bw: any) => bw.website) : []
          }));
          
          console.log("Formatted children profiles:", formattedChildren);
          setChildProfiles(formattedChildren);
          
          // If we have children but no selected child, select the first one
          if (formattedChildren.length > 0 && !selectedChild) {
            setSelectedChild(formattedChildren[0]);
          }
          
          // Load usage data for each child
          formattedChildren.forEach(child => {
            fetchUsageLogs(child.id);
            generateMockWeeklyData(child.id); // TODO: Replace with real data
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchChildren:', error);
    }
  };

  const fetchAlerts = async () => {
    if (!user) return;
    
    try {
      // We need to first get all children ids for this parent
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', user.id);
        
      if (childrenError || !childrenData) {
        console.error('Error fetching children for alerts:', childrenError);
        return;
      }
      
      const childIds = childrenData.map(child => child.id);
      
      if (childIds.length === 0) return;
      
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .in('child_id', childIds)
        .order('timestamp', { ascending: false });
        
      if (error) {
        console.error('Error fetching alerts:', error);
        return;
      }
      
      if (data) {
        const alerts: Alert[] = data.map(alert => ({
          id: alert.id,
          childId: alert.child_id,
          type: alert.type as "time_limit" | "blocked_website" | "new_app", // Cast to the specific union type
          message: alert.message,
          timestamp: alert.timestamp,
          read: alert.read
        }));
        
        setAlertsList(alerts);
      }
    } catch (error) {
      console.error('Error in fetchAlerts:', error);
    }
  };

  const fetchUsageLogs = async (childId: string) => {
    try {
      // Get current date in ISO format
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('child_id', childId)
        .eq('date', today)
        .order('start_time', { ascending: false });
        
      if (error) {
        console.error(`Error fetching usage logs for child ${childId}:`, error);
        return;
      }
      
      if (data) {
        const logs: UsageLog[] = data.map(log => ({
          id: log.id,
          childId: log.child_id,
          date: log.date,
          website: log.website,
          app: log.app,
          category: log.category as AppCategory, // Cast to the AppCategory type
          duration: log.duration,
          startTime: log.start_time,
          endTime: log.end_time
        }));
        
        setUsageLogsList(prev => ({
          ...prev,
          [childId]: logs
        }));
      }
    } catch (error) {
      console.error(`Error in fetchUsageLogs for child ${childId}:`, error);
    }
  };

  // TODO: Replace with real data from Supabase
  const generateMockWeeklyData = (childId: string) => {
    const days = 7;
    const today = new Date();
    const weeklyData: DailyUsage[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Generate random data for demonstration
      const totalTime = Math.floor(Math.random() * 180) + 20;
      const games = Math.floor(Math.random() * 60);
      const social = Math.floor(Math.random() * 50);
      const education = Math.floor(Math.random() * 40);
      const entertainment = Math.floor(Math.random() * 30);
      
      weeklyData.push({
        date: date.toISOString(),
        totalTime,
        breakdownByCategory: {
          games,
          social,
          education,
          entertainment,
          productivity: Math.max(0, totalTime - games - social - education - entertainment)
        }
      });
    }
    
    setWeeklyUsageData(prev => ({
      ...prev,
      [childId]: weeklyData
    }));
  };

  const addChild = async (child: Omit<ChildProfile, "id" | "usedTime" | "isOnline" | "isLocked">) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('children')
        .insert([{
          parent_id: user.id,
          name: child.name,
          age: child.age,
          avatar: child.avatar,
          device_id: child.deviceId,
          daily_time_limit: child.dailyTimeLimit
        }])
        .select();
        
      if (error) {
        toast({
          title: "Error adding child",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        toast({
          title: "Child profile added",
          description: `Profile for ${child.name} has been created successfully.`,
        });
        
        // Fetch updated data for both logged-in users and login screen
        fetchAllChildProfiles();
        if (user.role === 'parent') {
          fetchChildren();
        }
      }
    } catch (error) {
      console.error("Error in addChild:", error);
      toast({
        title: "Error adding child",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const updateChild = async (childId: string, updates: Partial<ChildProfile>) => {
    try {
      const payload: any = {};
      
      // Map the ChildProfile properties to database column names
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.age !== undefined) payload.age = updates.age;
      if (updates.avatar !== undefined) payload.avatar = updates.avatar;
      if (updates.deviceId !== undefined) payload.device_id = updates.deviceId;
      if (updates.dailyTimeLimit !== undefined) payload.daily_time_limit = updates.dailyTimeLimit;
      if (updates.usedTime !== undefined) payload.used_time = updates.usedTime;
      if (updates.isOnline !== undefined) payload.is_online = updates.isOnline;
      if (updates.isLocked !== undefined) payload.is_locked = updates.isLocked;
      
      const { error } = await supabase
        .from('children')
        .update(payload)
        .eq('id', childId);
        
      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Profile updated",
        description: "Child profile has been updated successfully.",
      });
      
      // No need to update state manually - the realtime subscription will handle it
    } catch (error) {
      console.error(`Error updating child ${childId}:`, error);
      toast({
        title: "Update failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const lockDevice = async (childId: string) => {
    try {
      // Update the child's lock status
      await updateChild(childId, { isLocked: true });
      
      // Get the child's name for the alert
      const child = childProfiles.find(child => child.id === childId);
      
      if (!child) return;
      
      // Create a lock alert
      const { error } = await supabase
        .from('alerts')
        .insert([{
          child_id: childId,
          type: "time_limit", // Using the specific string literal type
          message: `${child.name}'s device has been locked`,
          read: false
        }]);
        
      if (error) {
        console.error("Error creating lock alert:", error);
      }
    } catch (error) {
      console.error(`Error locking device for child ${childId}:`, error);
      toast({
        title: "Action failed",
        description: "Could not lock the device",
        variant: "destructive",
      });
    }
  };

  const unlockDevice = async (childId: string) => {
    try {
      await updateChild(childId, { isLocked: false });
    } catch (error) {
      console.error(`Error unlocking device for child ${childId}:`, error);
      toast({
        title: "Action failed",
        description: "Could not unlock the device",
        variant: "destructive",
      });
    }
  };

  const addBlockedWebsite = async (childId: string, website: string) => {
    try {
      // Format website if needed (remove http://, https://, www.)
      let formattedWebsite = website.toLowerCase();
      formattedWebsite = formattedWebsite.replace(/^https?:\/\//, '');
      formattedWebsite = formattedWebsite.replace(/^www\./, '');
      
      const child = childProfiles.find(c => c.id === childId);
      
      if (child && !child.blockedWebsites.includes(formattedWebsite)) {
        const { error } = await supabase
          .from('blocked_websites')
          .insert([{
            child_id: childId,
            website: formattedWebsite
          }]);
          
        if (error) {
          toast({
            title: "Error blocking website",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Website blocked",
          description: `${formattedWebsite} has been added to the blocklist.`,
        });
        
        // Fetch updated child data with the new blocklist
        fetchChildren();
      } else if (child?.blockedWebsites.includes(formattedWebsite)) {
        toast({
          title: "Already blocked",
          description: `${formattedWebsite} is already in the blocklist.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error adding blocked website for child ${childId}:`, error);
      toast({
        title: "Error blocking website",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const removeBlockedWebsite = async (childId: string, website: string) => {
    try {
      const { error } = await supabase
        .from('blocked_websites')
        .delete()
        .eq('child_id', childId)
        .eq('website', website);
        
      if (error) {
        toast({
          title: "Error removing website",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Website unblocked",
        description: `${website} has been removed from the blocklist.`,
      });
      
      // Fetch updated child data with the updated blocklist
      fetchChildren();
    } catch (error) {
      console.error(`Error removing blocked website for child ${childId}:`, error);
      toast({
        title: "Error unblocking website",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ read: true })
        .eq('id', alertId);
        
      if (error) {
        console.error("Error marking alert as read:", error);
        return;
      }
      
      setAlertsList(alertsList.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      ));
    } catch (error) {
      console.error(`Error marking alert ${alertId} as read:`, error);
    }
  };

  const getChildById = (id: string) => {
    return childProfiles.find(child => child.id === id);
  };

  const getUnreadAlertCount = () => {
    return alertsList.filter(alert => !alert.read).length;
  };

  return (
    <KidSafeContext.Provider
      value={{
        children: childProfiles,
        alerts: alertsList,
        usageLogs: usageLogsList,
        weeklyUsage: weeklyUsageData,
        selectedChild,
        setSelectedChild,
        addChild,
        updateChild,
        lockDevice,
        unlockDevice,
        addBlockedWebsite,
        removeBlockedWebsite,
        markAlertAsRead,
        getChildById,
        getUnreadAlertCount,
        fetchAllChildProfiles
      }}
    >
      {children}
    </KidSafeContext.Provider>
  );
};

export const useKidSafe = () => {
  const context = useContext(KidSafeContext);
  if (context === undefined) {
    throw new Error("useKidSafe must be used within a KidSafeProvider");
  }
  return context;
};
