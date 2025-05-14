
import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Bell } from "lucide-react";
import { useKidSafe } from "@/context/KidSafeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AppLayout = () => {
  const { user, isParent, logout } = useAuth();
  const { alerts, markAlertAsRead, getUnreadAlertCount } = useKidSafe();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const unreadAlertCount = getUnreadAlertCount();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <header className="border-b h-16 px-4 flex items-center justify-between bg-white">
          <h1 className="text-2xl font-bold text-kidsafe-purple">KidSafe</h1>
          <div className="flex items-center gap-4">
            {isParent && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadAlertCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-kidsafe-red text-white">
                        {unreadAlertCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="font-medium px-2 py-1.5 text-sm">Notifications</div>
                  {alerts.length > 0 ? (
                    <div>
                      {alerts.map((alert) => (
                        <DropdownMenuItem 
                          key={alert.id} 
                          className="py-2 px-4 cursor-pointer"
                          onClick={() => markAlertAsRead(alert.id)}
                        >
                          <div className="flex gap-2 items-start">
                            <AlertCircle className={`h-5 w-5 ${alert.read ? "text-muted-foreground" : "text-kidsafe-red"}`} />
                            <div className="flex flex-col">
                              <span className={`text-sm ${alert.read ? "text-muted-foreground" : "font-medium"}`}>
                                {alert.message}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ) : (
                    <div className="py-2 px-4 text-sm text-center text-muted-foreground">
                      No new notifications
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <ScrollArea className="flex-1">
          <main className="p-6">
            <Outlet />
          </main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AppLayout;
