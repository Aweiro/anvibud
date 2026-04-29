"use client";

import { motion } from "framer-motion";

export function NavigationLoader() {
    const bars = Array.from({ length: 8 });

    return (
        <div className="flex flex-col items-center">
            {/* Sequential Rhythm Bars - Unambiguous Loading */}
            <div className="flex gap-2 mb-12">
                {bars.map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-[2px] h-8 bg-black dark:bg-white navigation-loader-bar"
                        initial={{ opacity: 0.1, scaleY: 0.8 }}
                        animate={{
                            opacity: [0.1, 1, 0.1],
                            scaleY: [0.8, 1.2, 0.8]
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            {/* Brand Identity */}
            <motion.div
                className="flex gap-4"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
                {["A", "N", "V", "I", "B", "U", "D"].map((char, i) => (
                    <span
                        key={i}
                        className="text-[14px] font-black tracking-[0.4em] text-black dark:text-white navigation-loader-text"
                    >
                        {char}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}
