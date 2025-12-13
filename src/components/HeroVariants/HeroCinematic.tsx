import React from 'react';
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { motion } from "framer-motion";

export const HeroCinematic = () => {
    return (
        <div className="relative min-h-[800px] w-full overflow-hidden flex items-center justify-center">
            {/* Background Image/Video Placeholder */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop"
                    alt="Office Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60" />
            </div>

            <div className="container mx-auto px-4 z-10 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 cursor-pointer hover:bg-white/20 transition-all">
                        <Play className="w-6 h-6 fill-white text-white ml-1" />
                    </div>

                    <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-6">
                        Empower Your Team.
                    </h1>

                    <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10 font-light">
                        A beautiful, intuitive way to manage attendance and boost productivity.
                        Designed for the modern workplace.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="h-14 px-10 bg-white text-black hover:bg-white/90 rounded-full text-lg font-medium">
                            Start Free Trial
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-10 border-white text-white hover:bg-white/10 rounded-full text-lg font-medium">
                            Learn More
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
