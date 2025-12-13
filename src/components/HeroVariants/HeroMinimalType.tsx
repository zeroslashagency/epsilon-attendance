import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const HeroMinimalType = () => {
    return (
        <div className="relative min-h-[800px] w-full bg-[#f4f4f0] dark:bg-[#1a1a1a] text-black dark:text-white flex flex-col justify-center">
            <div className="container mx-auto px-6 md:px-12">
                <div className="max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h1 className="text-[12vw] leading-[0.85] font-bold tracking-tighter mb-8">
                            SIMPLIFY <br />
                            <span className="text-gray-400 dark:text-gray-600">WORK.</span>
                        </h1>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-12 border-t border-black/10 dark:border-white/10 pt-12">
                        <div className="md:col-span-4">
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 1 }}
                                className="text-lg font-medium"
                            >
                                The definitive platform for modern attendance tracking.
                                Designed for clarity, built for speed.
                            </motion.p>
                        </div>

                        <div className="md:col-span-4 md:col-start-9 flex flex-col gap-4">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                            >
                                <Button className="w-full h-16 text-xl bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-none transition-all">
                                    Get Started
                                </Button>
                                <Button variant="ghost" className="w-full h-16 text-xl hover:bg-transparent hover:underline justify-start px-0">
                                    Read the manifesto
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative large number */}
            <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none select-none">
                <span className="text-[40vw] font-black leading-none">01</span>
            </div>
        </div>
    );
};
