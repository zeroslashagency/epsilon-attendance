/**
 * ProfileCard - Avatar with name/role and FIR badge
 */
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

interface ProfileCardProps {
    name: string;
    role: string;
    avatarUrl?: string;
    firPoints?: number;
}

export function ProfileCard({ name, role, avatarUrl, firPoints = 0 }: ProfileCardProps) {
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-3 py-1.5 rounded-full">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="font-bold text-amber-600 dark:text-amber-400">{firPoints}</span>
                <span className="text-xs text-muted-foreground">FIR</span>
            </div>

            <div className="text-right hidden sm:block">
                <p className="font-semibold text-sm">{name}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
            </div>

            <div className="relative">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage src={avatarUrl} alt={name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-bold">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-background" />
            </div>
        </div>
    );
}
