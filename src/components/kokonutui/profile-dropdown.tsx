"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Settings, CreditCard, FileText, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Gemini from "./gemini";

interface Profile {
    name: string;
    email: string;
    avatar: string;
    subscription?: string;
    model?: string;
}

interface MenuItem {
    label: string;
    value?: string;
    href: string;
    icon: React.ReactNode;
    external?: boolean;
}

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
    data: Profile;
    onLogout?: () => void;
}

export default function ProfileDropdown({
    data,
    onLogout,
    className,
    ...props
}: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    // For this app, we'll customize the menu items based on what's relevant
    const menuItems: MenuItem[] = [
        {
            label: "Profile",
            href: "/profile",
            icon: <User className="w-4 h-4" />,
        },
        {
            label: "Settings",
            href: "/settings",
            icon: <Settings className="w-4 h-4" />,
        },
        {
            label: "Terms & Policies",
            href: "/terms",
            icon: <FileText className="w-4 h-4" />,
            external: true,
        },
    ];

    return (
        <div className={cn("relative", className)} {...props}>
            <DropdownMenu onOpenChange={setIsOpen}>
                <div className="group relative">
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex items-center gap-4 px-3 py-2 rounded-xl bg-white dark:bg-muted/50 border border-border hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 focus:outline-none"
                        >
                            <div className="text-left hidden sm:block">
                                <div className="text-sm font-semibold tracking-tight">
                                    {data.name}
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                    {data.email}
                                </div>
                            </div>
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-0.5">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-zinc-900 flex items-center justify-center">
                                        {data.avatar ? (
                                            <img
                                                src={data.avatar}
                                                alt={data.name}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <span className="text-xs font-bold">{data.name.charAt(0)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    </DropdownMenuTrigger>

                    {/* Bending line indicator on the right */}
                    <div
                        className={cn(
                            "absolute -right-3 top-1/2 -translate-y-1/2 transition-all duration-200",
                            isOpen
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                        )}
                    >
                        <svg
                            width="12"
                            height="24"
                            viewBox="0 0 12 24"
                            fill="none"
                            className={cn(
                                "transition-all duration-200",
                                isOpen
                                    ? "text-primary scale-110"
                                    : "text-muted-foreground"
                            )}
                            aria-hidden="true"
                        >
                            <path
                                d="M2 4C6 8 6 16 2 20"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                fill="none"
                            />
                        </svg>
                    </div>

                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-56 p-2 rounded-2xl shadow-xl"
                    >
                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <DropdownMenuItem key={item.label} asChild>
                                    <Link
                                        to={item.href}
                                        className="flex items-center gap-2 p-2 rounded-xl transition-all cursor-pointer group"
                                    >
                                        {item.icon}
                                        <span className="text-sm font-medium">
                                            {item.label}
                                        </span>
                                        {item.value && (
                                            <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded-md font-bold">
                                                {item.value}
                                            </span>
                                        )}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </div>

                        <DropdownMenuSeparator className="my-2" />

                        <DropdownMenuItem asChild>
                            <button
                                type="button"
                                onClick={onLogout}
                                className="w-full flex items-center gap-2 p-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-medium transition-all group"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </div>
            </DropdownMenu>
        </div>
    );
}
