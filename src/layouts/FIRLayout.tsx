import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Filter, List, Activity, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
            role: 'Super Admin'
        },
        {
            label: 'Analytics',
            path: '/history',
            icon: Activity,
            role: 'all'
        }
    ];

    return (
        <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* 65px is rough height of MainLayout header. Adjust if needed to fit perfectly without double scrollbars */}

            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 flex flex-col shrink-0 transition-all duration-300 border-r border-slate-200 dark:border-none">

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
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={cn(
                                            "p-1.5 rounded-lg transition-colors",
                                            isActive
                                                ? "bg-white/20"
                                                : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                                        )}>
                                            <item.icon size={18} />
                                        </div>
                                        <span>{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}

                    <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 px-2">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Analytics</div>
                        {/* Duplicate Analytics link here if strictly following image, or just keeping the main list */}
                        <NavLink
                            to="/history"
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "text-indigo-600 dark:text-white font-bold"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                            )}
                        >
                            <Activity size={16} />
                            <span>Analytics</span>
                        </NavLink>
                    </div>
                </nav>

                {/* User Profile (Bottom) */}
                <div className="p-4 bg-slate-50 dark:bg-[#1e293b]/50 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-slate-200 dark:border-slate-600">
                            <AvatarImage src="" /> {/* Add user avatar url if available */}
                            <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white font-medium">
                                {employeeName ? employeeName.substring(0, 2).toUpperCase() : 'UR'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{employeeName || user?.email || 'User'}</div>
                            <div className="text-xs text-slate-500 truncate">{role || 'Employee'}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 relative overflow-auto bg-slate-50/50 dark:bg-[#020617]">
                <Outlet />
            </main>
        </div>
    );
}
