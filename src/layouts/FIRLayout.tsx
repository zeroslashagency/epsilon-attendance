import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Filter, List, Activity, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { USER_ROLES } from '@/config/roles';

export function FIRLayout() {
    const { employeeName, role, user } = useAuth();
    const location = useLocation();

    const navItems = [
        {
            label: 'Dashboard',
            path: '/fir',
            icon: LayoutDashboard,
            role: 'all'
        },
        {
            label: 'All Reports',
            path: '/reports',
            icon: Filter,
            role: 'all'
        },
        {
            label: 'Categories',
            path: '/categories',
            icon: List,
            role: USER_ROLES.SUPER_ADMIN
        },
        {
            label: 'Analytics',
            path: '/history',
            icon: Activity,
            role: 'all'
        }
    ];

    return (
        <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-muted/30">
            {/* 65px is rough height of MainLayout header. Adjust if needed to fit perfectly without double scrollbars */}

            {/* Sidebar */}
            <aside className="w-64 bg-card text-muted-foreground flex flex-col shrink-0 transition-all duration-300 border-r border-border">

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-2">
                    {navItems.map((item) => {
                        if (item.role !== 'all' && role !== item.role) return null;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={cn(
                                            "p-1.5 rounded-lg transition-colors",
                                            isActive
                                                ? "bg-primary/20"
                                                : "bg-muted group-hover:bg-muted/70 text-muted-foreground"
                                        )}>
                                            <item.icon size={18} />
                                        </div>
                                        <span>{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}

                    <div className="mt-8 pt-4 border-t border-border px-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2">Analytics</div>
                        {/* Duplicate Analytics link here if strictly following image, or just keeping the main list */}
                        <NavLink
                            to="/history"
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "text-primary font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Activity size={16} />
                            <span>Analytics</span>
                        </NavLink>
                    </div>
                </nav>

                {/* User Profile (Bottom) */}
                <div className="p-4 bg-muted/30 border-t border-border">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-border">
                            <AvatarImage src="" /> {/* Add user avatar url if available */}
                            <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                                {employeeName ? employeeName.substring(0, 2).toUpperCase() : 'UR'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="text-sm font-bold text-foreground truncate">{employeeName || user?.email || 'User'}</div>
                            <div className="text-xs text-muted-foreground truncate">{role || 'Employee'}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 relative overflow-auto bg-muted/20">
                <Outlet />
            </main>
        </div>
    );
}
