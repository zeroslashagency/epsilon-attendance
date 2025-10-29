import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getNavigationTabs } from "@/config/features";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User, Bell, BellOff } from "lucide-react";
import { DeviceStatus } from "@/components/DeviceStatus";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const { employeeName, employeeCode, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    // Determine active tab based on current route
    const path = location.pathname;
    if (path === '/') return 'attendance';
    if (path.includes('/overview')) return 'overview';
    if (path.includes('/calendar')) return 'calendar';
    if (path.includes('/reports')) return 'reports';
    return 'attendance';
  });
  
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const tabs = getNavigationTabs();
  
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const handleNotificationToggle = async () => {
    // Notification button clicked
    
    if (!('Notification' in window)) {
      // Browser does not support notifications
      toast.error('Browser notifications not supported');
      return;
    }
    
    if (notificationPermission === 'granted') {
      // Notifications already granted
      toast.info('Notifications are enabled. Disable them in browser settings.');
      // Show test notification to confirm it works
      try {
        new Notification('Test Notification', {
          body: 'Notifications are working! You will receive updates when new attendance data arrives.',
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.error('Error showing notification:', err);
      }
      return;
    }
    
    try {
      // Requesting notification permission
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // Permission granted
        toast.success('🔔 Notifications enabled! You\'ll be notified of new attendance data.');
        // Show test notification
        new Notification('Notifications Enabled', {
          body: 'You will now receive updates when new attendance data arrives',
          icon: '/favicon.ico',
        });
      } else if (permission === 'denied') {
        // Permission denied
        toast.error('Notification permission denied. Enable in browser settings.');
      } else {
        // Permission dismissed
        toast.warning('Notification permission dismissed');
      }
    } catch (err) {
      console.error('Error requesting permission:', err);
      toast.error('Error requesting notification permission');
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Navigation Header */}
      <div className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-full mx-auto px-2 sm:px-4">
          {/* Top Row: Device Status + User Info */}
          <div className="flex justify-between items-center py-2 border-b border-border">
            {/* Device Status */}
            <div className="flex items-center">
              <DeviceStatus />
            </div>
            
            {/* User Info, Notifications, Theme Toggle and Logout */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {employeeName || 'Employee'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNotificationToggle}
                className="flex items-center gap-2"
                title={notificationPermission === 'granted' ? 'Notifications enabled' : 'Enable notifications'}
              >
                {notificationPermission === 'granted' ? (
                  <Bell className="h-4 w-4 text-green-600" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </Button>
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
          
          {/* Bottom Row: Navigation Tabs */}
          <div className="flex gap-2 sm:gap-6 overflow-x-auto scrollbar-hide py-2">
            {tabs.map((tab) => (
            tab.enabled ? (
              <Link
                key={tab.id}
                to={tab.path}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-2 px-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </Link>
            ) : (
              <div
                key={tab.id}
                className={cn(
                  "pb-2 px-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-not-allowed relative group",
                  "border-transparent text-muted-foreground/50"
                )}
                title="Coming Soon"
              >
                {tab.label}
                <span className="ml-1 sm:ml-2 text-xs bg-gradient-to-r from-orange-500 to-red-500 px-1.5 sm:px-2 py-0.5 rounded-full text-white font-medium">
                  Soon
                </span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Coming Soon
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                </div>
              </div>
            )
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-2 sm:px-4 py-4">
        {children}
      </div>
    </div>
  );
}
