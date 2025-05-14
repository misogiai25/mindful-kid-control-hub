
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isParent } = useAuth();
  
  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out h-screen sticky top-0 left-0 flex flex-col",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!collapsed && (
          <span className="font-bold text-xl text-kidsafe-purple">
            KidSafe
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? ">" : "<"}
        </Button>
      </div>
      
      <div className="flex flex-col gap-1 p-2 flex-1">
        {isParent ? (
          <>
            <NavLink 
              to="/"
              className={({ isActive }) => cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-sidebar-accent text-kidsafe-purple" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <User className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && <span>Children</span>}
            </NavLink>
            <NavLink 
              to="/reports"
              className={({ isActive }) => cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-sidebar-accent text-kidsafe-purple" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Clock className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && <span>Reports</span>}
            </NavLink>
            <NavLink 
              to="/schedule"
              className={({ isActive }) => cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-sidebar-accent text-kidsafe-purple" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Calendar className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && <span>Schedule</span>}
            </NavLink>
          </>
        ) : (
          <NavLink 
            to="/child"
            className={({ isActive }) => cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive 
                ? "bg-sidebar-accent text-kidsafe-purple" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <Clock className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
            {!collapsed && <span>My Time</span>}
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
