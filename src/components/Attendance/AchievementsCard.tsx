/**
 * AchievementsCard - Streaks and badges
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Flame, Star, Target, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
    id: string;
    icon: 'streak' | 'star' | 'target' | 'award';
    label: string;
    value: string;
    color: string;
    isNew?: boolean;
}

interface AchievementsCardProps {
    achievements: Achievement[];
}

export function AchievementsCard({ achievements }: AchievementsCardProps) {
    const getIcon = (type: Achievement['icon']) => {
        switch (type) {
            case 'streak': return Flame;
            case 'star': return Star;
            case 'target': return Target;
            case 'award': return Award;
            default: return Trophy;
        }
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    Achievements
                </CardTitle>
            </CardHeader>
            <CardContent>
                {achievements.length === 0 ? (
                    <div className="flex flex-col items-center py-4 text-muted-foreground">
                        <Award className="h-6 w-6 mb-2 opacity-50" />
                        <p className="text-sm">Keep up the attendance!</p>
                        <p className="text-xs">Achievements unlock with consistent attendance</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {achievements.map((achievement) => {
                            const Icon = getIcon(achievement.icon);
                            return (
                                <div
                                    key={achievement.id}
                                    className={cn(
                                        "flex items-center gap-2 p-2 rounded-lg bg-muted/50 transition-all",
                                        achievement.isNew && "ring-2 ring-amber-400/50 animate-pulse"
                                    )}
                                >
                                    <div
                                        className="p-1.5 rounded-md"
                                        style={{ backgroundColor: `${achievement.color}20` }}
                                    >
                                        <Icon
                                            className="h-4 w-4"
                                            style={{ color: achievement.color }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground truncate">
                                            {achievement.label}
                                        </p>
                                        <p className="font-bold text-sm">{achievement.value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
