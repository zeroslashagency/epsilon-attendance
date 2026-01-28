import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, FileText, Activity, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { USER_ROLES } from '@/config/roles';

/**
 * OperationsLayout - Sidebar navigation for FIR, Reports, History, Categories
 * Renders inside MainLayout (which provides the top bar)
 */
export function OperationsLayout() {
    const { employeeName, role, user } = useAuth();

    const navItems = [
        {
            label: 'Dashboard',
            path: '/operations/fir',
            icon: LayoutDashboard,
            role: 'all'
        },
        {
            label: 'Reports',
            path: '/operations/reports',
            icon: FileText,
            role: 'all'
        },
        {
            label: 'History',
            path: '/operations/history',
            icon: Activity,
            role: 'all'
        },
        {
            label: 'Categories',
            path: '/operations/categories',
            icon: List,
            role: USER_ROLES.SUPER_ADMIN
        }
    ];

    return (
        <div className="flex h-[calc(100vh-120px)] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-56 bg-card border-r flex flex-col shrink-0">
                <div className="p-4 border-b">
                    <h2 className="font-semibold text-lg">Operations</h2>
                    <p className="text-xs text-muted-foreground">Manage reports & analytics</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1">
                    {navItems.map((item) => {
                        if (item.role !== 'all' && role !== item.role) return null;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User Profile (Bottom) */}
                <div className="p-4 border-t bg-muted/30">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                                {employeeName ? employeeName.substring(0, 2).toUpperCase() : 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{employeeName || user?.email || 'User'}</div>
                            <div className="text-xs text-muted-foreground truncate">{role || 'Employee'}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 overflow-auto bg-muted/20">
                <Outlet />
            </main>
        </div>
    );
}
