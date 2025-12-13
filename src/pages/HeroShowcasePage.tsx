import React, { useState } from 'react';
import { HeroModernSaaS } from "@/components/HeroVariants/HeroModernSaaS";
import { HeroDarkFuturistic } from "@/components/HeroVariants/HeroDarkFuturistic";
import { HeroMinimalType } from "@/components/HeroVariants/HeroMinimalType";
import { HeroInteractive3D } from "@/components/HeroVariants/HeroInteractive3D";
import { HeroCinematic } from "@/components/HeroVariants/HeroCinematic";
import { Button } from "@/components/ui/button";

const variants = [
    { id: 'modern', name: 'Modern SaaS', component: HeroModernSaaS },
    { id: 'dark', name: 'Dark Futuristic', component: HeroDarkFuturistic },
    { id: 'minimal', name: 'Minimal Type', component: HeroMinimalType },
    { id: '3d', name: 'Interactive 3D', component: HeroInteractive3D },
    { id: 'cinematic', name: 'Cinematic', component: HeroCinematic },
];

const HeroShowcasePage = () => {
    const [activeVariant, setActiveVariant] = useState(variants[0].id);

    const ActiveComponent = variants.find(v => v.id === activeVariant)?.component || HeroModernSaaS;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Control Panel */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4">
                <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-lg font-bold">Hero Design Showcase</h2>
                    <div className="flex flex-wrap gap-2">
                        {variants.map((variant) => (
                            <Button
                                key={variant.id}
                                variant={activeVariant === variant.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveVariant(variant.id)}
                                className="rounded-full"
                            >
                                {variant.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hero Display Area */}
            <div className="flex-1 pt-[72px]">
                <ActiveComponent />
            </div>
        </div>
    );
};

export default HeroShowcasePage;
