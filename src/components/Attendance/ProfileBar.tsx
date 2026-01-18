/**
 * ProfileBar - Top bar with FIR points, email, role, avatar
 */
import { Trophy, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ProfileBarProps {
    firPoints: number;
    email: string;
    role: string;
    avatarUrl?: string;
}

export function ProfileBar({ firPoints, email, role, avatarUrl }: ProfileBarProps) {
    const initials = email.split('@')[0].slice(0, 2).toUpperCase();

    return (
        <div className="flex items-center justify-between p-4 rounded-lg border-2 border-yellow-500/50 bg-card">
            {/* FIR Points */}
            <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-lg border border-yellow-500/30">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-bold text-xl">{firPoints}</span>
                <span className="text-sm text-muted-foreground">FIR POINTS</span>
            </div>

            {/* Email & Role */}
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-medium">{email}</p>
                    <Badge variant="outline" className="mt-1">{role}</Badge>
                </div>

                {/* Avatar */}
                <Avatar className="h-12 w-12 ring-2 ring-yellow-500/50">
                    <AvatarImage src={avatarUrl} alt={email} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <span className="h-3 w-3 bg-emerald-500 rounded-full border-2 border-background -ml-4 mt-8" />
            </div>
        </div>
    );
}
