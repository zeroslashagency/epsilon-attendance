import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

export const HeroModernSaaS = () => {
    return (
        <div className="relative min-h-[800px] w-full overflow-hidden bg-white dark:bg-slate-950 flex items-center justify-center">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-400/20 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/20 blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        New Features Available
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                        Manage Attendance <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            Like a Pro
                        </span>
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
                        Streamline your workforce management with our intelligent tracking system. Real-time insights, seamless reporting, and zero headaches.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105">
                            Get Started Free
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                            <PlayCircle className="mr-2 h-5 w-5" />
                            Watch Demo
                        </Button>
                    </div>

                    <div className="pt-8 flex items-center gap-8 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span>14-day free trial</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span>No credit card required</span>
                        </div>
                    </div>
                </motion.div>

                {/* Right Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="relative hidden lg:block"
                >
                    {/* Main Card */}
                    <div className="relative z-20 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                                    JD
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">John Doe</h3>
                                    <p className="text-sm text-slate-500">Product Designer</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider">
                                Present
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="h-24 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Check In</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">09:00 AM</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                    <ArrowRight className="h-5 w-5 rotate-45" />
                                </div>
                            </div>

                            <div className="h-24 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Check Out</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">--:-- PM</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    <ArrowRight className="h-5 w-5 -rotate-45" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Elements */}
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-12 -right-12 z-10 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="font-semibold text-slate-900 dark:text-white">On Time</span>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 20, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -bottom-8 -left-8 z-30 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700" />
                                ))}
                            </div>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">+42 Active</span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};
