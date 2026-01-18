/**
 * CelebrationsCard - Birthdays and work anniversaries
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PartyPopper, Cake, Sparkles, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Celebration {
    id: string;
    name: string;
    type: 'birthday' | 'anniversary';
    date: string;
    years?: number;
}

interface CelebrationsCardProps {
    celebrations: Celebration[];
}

export function CelebrationsCard({ celebrations }: CelebrationsCardProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <PartyPopper className="h-4 w-4 text-pink-500" />
                    Celebrations
                </CardTitle>
            </CardHeader>
            <CardContent>
                {celebrations.length === 0 ? (
                    <div className="flex flex-col items-center py-4 text-muted-foreground">
                        <Calendar className="h-6 w-6 mb-2 opacity-50" />
                        <p className="text-sm">No celebrations this week</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {celebrations.map((celebration) => (
                            <div
                                key={celebration.id}
                                className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white text-xs">
                                        {celebration.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{celebration.name}</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        {celebration.type === 'birthday' ? (
                                            <>
                                                <Cake className="h-3 w-3 text-pink-500" />
                                                <span>Birthday</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-3 w-3 text-amber-500" />
                                                <span>{celebration.years} year{celebration.years !== 1 ? 's' : ''} anniversary</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground">{celebration.date}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
