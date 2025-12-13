import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export const HeroInteractive3D = () => {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <div className="min-h-[800px] w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center perspective-[1000px] overflow-hidden">
            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                <div className="space-y-6 z-10">
                    <h1 className="text-6xl font-bold text-slate-900 dark:text-white">
                        Dimension <br />
                        <span className="text-indigo-600">Shift.</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300">
                        Interact with your data in a whole new way.
                        Attendance tracking that feels tangible.
                    </p>
                    <Button className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xl shadow-indigo-500/30">
                        Explore 3D View
                    </Button>
                </div>

                <div className="flex items-center justify-center perspective-[1000px]">
                    <motion.div
                        ref={ref}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            rotateX,
                            rotateY,
                            transformStyle: "preserve-3d",
                        }}
                        className="relative w-[400px] h-[500px] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                        <div
                            style={{ transform: "translateZ(75px)" }}
                            className="absolute inset-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg flex flex-col items-center justify-center text-white p-6"
                        >
                            <div className="w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-md flex items-center justify-center">
                                <span className="text-3xl font-bold">98%</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Attendance</h3>
                            <p className="text-center text-white/80">Weekly average is looking great!</p>
                        </div>

                        <div
                            style={{ transform: "translateZ(150px)" }}
                            className="absolute -top-6 -right-6 bg-white dark:bg-slate-700 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-600"
                        >
                            <span className="text-2xl">🚀</span>
                        </div>

                        <div
                            style={{ transform: "translateZ(120px)" }}
                            className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-700 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-600"
                        >
                            <span className="text-2xl">✨</span>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
};
