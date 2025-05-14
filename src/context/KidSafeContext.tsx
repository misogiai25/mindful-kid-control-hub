
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Alert, ChildProfile, UsageLog, DailyUsage } from "@/types/kidsafe";
import { alerts as mockAlerts, children as mockChildren, usageLogs as mockUsageLogs, weeklyUsage as mockWeeklyUsage } from "@/data/mockData";
import { useToast } from "@/components/ui/use-toast";

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
}

const KidSafeContext = createContext<KidSafeContextType | undefined>(undefined);

export const KidSafeProvider = ({ children }: { children: ReactNode }) => {
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>(mockChildren);
  const [alertsList, setAlertsList] = useState<Alert[]>(mockAlerts);
  const [usageLogsList, setUsageLogsList] = useState<{ [childId: string]: UsageLog[] }>(mockUsageLogs);
  const [weeklyUsageData, setWeeklyUsageData] = useState<{ [childId: string]: DailyUsage[] }>(mockWeeklyUsage);
  const { toast } = useToast();

  // Set first child as selected by default
  useEffect(() => {
    if (childProfiles.length > 0 && !selectedChild) {
      setSelectedChild(childProfiles[0]);
    }
  }, [childProfiles, selectedChild]);

  const addChild = (child: Omit<ChildProfile, "id" | "usedTime" | "isOnline" | "isLocked">) => {
    const newChild: ChildProfile = {
      ...child,
      id: `c${childProfiles.length + 1}`,
      usedTime: 0,
      isOnline: false,
      isLocked: false
    };
    
    setChildProfiles([...childProfiles, newChild]);
    toast({
      title: "Child profile added",
      description: `Profile for ${newChild.name} has been created successfully.`,
    });
  };

  const updateChild = (childId: string, updates: Partial<ChildProfile>) => {
    setChildProfiles(childProfiles.map(child => 
      child.id === childId ? { ...child, ...updates } : child
    ));
    
    // Update selected child if it's the one being updated
    if (selectedChild?.id === childId) {
      setSelectedChild({ ...selectedChild, ...updates });
    }
    
    toast({
      title: "Profile updated",
      description: "Child profile has been updated successfully.",
    });
  };

  const lockDevice = (childId: string) => {
    setChildProfiles(childProfiles.map(child => 
      child.id === childId ? { ...child, isLocked: true } : child
    ));
    
    // Update selected child if it's the one being locked
    if (selectedChild?.id === childId) {
      setSelectedChild({ ...selectedChild, isLocked: true });
    }
    
    // Add a lock alert
    const childName = childProfiles.find(child => child.id === childId)?.name;
    const newAlert: Alert = {
      id: `alert-${Date.now()}`,
      childId,
      type: "time_limit",
      message: `${childName}'s device has been locked`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setAlertsList([newAlert, ...alertsList]);
    
    toast({
      title: "Device locked",
      description: `${childName}'s device has been locked successfully.`,
    });
  };

  const unlockDevice = (childId: string) => {
    setChildProfiles(childProfiles.map(child => 
      child.id === childId ? { ...child, isLocked: false } : child
    ));
    
    // Update selected child if it's the one being unlocked
    if (selectedChild?.id === childId) {
      setSelectedChild({ ...selectedChild, isLocked: false });
    }
    
    const childName = childProfiles.find(child => child.id === childId)?.name;
    toast({
      title: "Device unlocked",
      description: `${childName}'s device has been unlocked.`,
    });
  };

  const addBlockedWebsite = (childId: string, website: string) => {
    // Format website if needed (remove http://, https://, www.)
    let formattedWebsite = website.toLowerCase();
    formattedWebsite = formattedWebsite.replace(/^https?:\/\//, '');
    formattedWebsite = formattedWebsite.replace(/^www\./, '');
    
    const child = childProfiles.find(c => c.id === childId);
    
    if (child && !child.blockedWebsites.includes(formattedWebsite)) {
      const updatedBlocklist = [...child.blockedWebsites, formattedWebsite];
      
      setChildProfiles(childProfiles.map(c => 
        c.id === childId ? { ...c, blockedWebsites: updatedBlocklist } : c
      ));
      
      // Update selected child if it's the one being modified
      if (selectedChild?.id === childId) {
        setSelectedChild({ ...selectedChild, blockedWebsites: updatedBlocklist });
      }
      
      toast({
        title: "Website blocked",
        description: `${formattedWebsite} has been added to the blocklist.`,
      });
    } else if (child?.blockedWebsites.includes(formattedWebsite)) {
      toast({
        title: "Already blocked",
        description: `${formattedWebsite} is already in the blocklist.`,
        variant: "destructive",
      });
    }
  };

  const removeBlockedWebsite = (childId: string, website: string) => {
    const child = childProfiles.find(c => c.id === childId);
    
    if (child) {
      const updatedBlocklist = child.blockedWebsites.filter(site => site !== website);
      
      setChildProfiles(childProfiles.map(c => 
        c.id === childId ? { ...c, blockedWebsites: updatedBlocklist } : c
      ));
      
      // Update selected child if it's the one being modified
      if (selectedChild?.id === childId) {
        setSelectedChild({ ...selectedChild, blockedWebsites: updatedBlocklist });
      }
      
      toast({
        title: "Website unblocked",
        description: `${website} has been removed from the blocklist.`,
      });
    }
  };

  const markAlertAsRead = (alertId: string) => {
    setAlertsList(alertsList.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
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
