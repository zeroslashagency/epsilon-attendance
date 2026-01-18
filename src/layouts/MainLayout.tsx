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

      // Listen for permission changes
      const checkPermission = () => {
        if ('Notification' in window) {
          setNotificationPermission(Notification.permission);
        }
      };

      // Check permission periodically (some browsers don't fire events)
      const interval = setInterval(checkPermission, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  const handleLogout = async () => {
    try {

      // Show loading toast
      const toastId = toast.loading('Logging out...');

      await logout();

      // Dismiss loading toast
      toast.dismiss(toastId);

      // Use navigate instead of window.location for proper routing
      window.location.replace('/auth');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  const handleNotificationToggle = async () => {
    // Notification button clicked

    if (!('Notification' in window)) {
      // Browser does not support notifications
      toast.error('Browser notifications not supported', {
        description: 'Your browser does not support desktop notifications.'
      });
      return;
    }

    if (notificationPermission === 'granted') {
      // Notifications already granted - show test notification
      toast.info('Notifications are enabled', {
        description: 'Sending a test notification...'
      });

      try {
        // Use setTimeout to ensure notification works on all browsers
        setTimeout(() => {
          new Notification('Epsilon Attendance', {
            body: 'Notifications are working! You will receive updates when new attendance data arrives.',
            icon: '/Epsilologo.svg',
            badge: '/Epsilologo.svg',
            tag: 'test-notification',
            requireInteraction: false,
            silent: false
          });
        }, 100);
      } catch (err) {
        toast.error('Failed to show notification', {
          description: 'Please check browser settings.'
        });
      }
      return;
    }

    if (notificationPermission === 'denied') {
      // Permission previously denied
      toast.error('Notifications blocked', {
        description: 'Please enable notifications in your browser settings.',
        duration: 7000
      });
      return;
    }

    try {
      // Request notification permission
      toast.loading('Requesting notification permission...');

      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        // Permission granted
        toast.success('🔔 Notifications enabled!', {
          description: 'You will be notified of new attendance data.'
        });

        // Show test notification with delay for better compatibility
        setTimeout(() => {
          try {
            new Notification('Epsilon Attendance', {
              body: 'Notifications enabled successfully! You will now receive updates.',
              icon: '/Epsilologo.svg',
              badge: '/Epsilologo.svg',
              tag: 'welcome-notification',
              requireInteraction: false
            });
          } catch (err) {
          }
        }, 500);

      } else if (permission === 'denied') {
        // Permission denied
        toast.error('Notifications blocked', {
          description: 'You denied notification permission. Enable it in browser settings to receive updates.',
          duration: 7000
        });
      } else {
        // Permission dismissed (default)
        toast.warning('Notification permission dismissed', {
          description: 'Click the bell icon again to enable notifications.'
        });
      }
    } catch (err) {
      toast.error('Failed to request notification permission', {
        description: 'Please try again or check browser settings.'
      });
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
            {tabs.filter(tab => tab.enabled).map((tab) => (
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
