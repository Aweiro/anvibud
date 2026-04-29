"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, ArrowRight, Phone } from "lucide-react";
import { ConsultationModal } from "./ConsultationModal";

const slides = [
  {
    id: 1,
    number: "01",
    title: "ПРОФЕСІЙНА",
    highlight: "ЯКІСТЬ",
    desc: "Ми постачаємо матеріали, що стають основою найнадійніших проектів. Від бетону до арматури.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop",
    tag: "INDUSTRIAL STANDARD",
    stats: "Project Support 24/7"
  },
  {
    id: 2,
    number: "02",
    title: "ЕКСКЛЮЗИВНЕ",
    highlight: "ОЗДОБЛЕННЯ",
    desc: "Преміальні рішення для фасадів та інтер'єрів. Створюйте простір, що надихає.",
    image: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?q=80&w=2000&auto=format&fit=crop",
    tag: "AESTHETIC FINISH",
    stats: "200+ Premium Brands"
  },
  {
    id: 3,
    number: "03",
    title: "ІННОВАЦІЙНИЙ",
    highlight: "ПРОСТІР",
    desc: "Ваш ідеальний дім починається тут. Комплексні рішення для будь-якого етапу будівництва.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop",
    tag: "MODERN LIVING",
    stats: "Next Day Delivery"
  }
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrent((c) => (c + 1) % slides.length);
          return 0;
        }
        return prev + 0.5;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [current]);

  const goToSlide = (index: number) => {
    setCurrent(index);
    setProgress(0);
  };

  return (
    <div className="relative w-full h-full min-h-[400px] md:min-h-[400px] overflow-hidden bg-zinc-950 text-white rounded-none lg:rounded-sm">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {/* Background Image Container */}
          <motion.div
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform"
            style={{ 
              backgroundImage: `url(${slides[current].image})`,
              filter: "contrast(1.05) brightness(0.8)",
              willChange: "transform",
              transform: "translateZ(0)"
            }}
          />

          {/* Additional Dark Gradient for Text Readability - Lightened */}
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Content Overlay */}
          <div className="absolute inset-0 z-10 flex items-center pb-24 md:pb-24">
            <div className="mx-auto max-w-[1800px] w-full px-4 md:px-20 grid grid-cols-1 lg:grid-cols-2 items-center">
              <div className="space-y-8 md:space-y-12">
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-4"
                >
                  <span className="text-sm font-black tracking-[0.5em] text-white/40">{slides[current].number}</span>
                  <div className="w-12 h-px bg-white/20" />
                  <span className="text-[10px] font-black tracking-[0.4em] uppercase">{slides[current].tag}</span>
                </motion.div>

                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  <h1 className="text-3xl sm:text-4xl md:text-[7vw] font-black tracking-tighter leading-[0.9] md:leading-[0.8] uppercase italic drop-shadow-xl">
                    {slides[current].title} <br />
                    <span className="text-transparent border-t-2 border-white/20 pt-2 block mt-2" style={{ WebkitTextStroke: "1px white", filter: "drop-shadow(0px 4px 10px rgba(0,0,0,0.5))" }}>
                      {slides[current].highlight}
                    </span>
                  </h1>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="max-w-md space-y-6 md:space-y-8"
                >
                  <p className="text-sm md:text-lg text-white/90 font-light tracking-wide leading-relaxed drop-shadow-md">
                    {slides[current].desc}
                  </p>

                  <div className="flex flex-row gap-2 md:gap-6 items-center">
                    <Link 
                      href="/shop" 
                      className="group relative flex-1 md:flex-none text-center px-4 md:px-10 py-3.5 md:py-5 bg-white text-black font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.3em] overflow-hidden transition-all md:hover:pr-14"
                    >
                      <span className="relative z-10">До Каталогу</span>
                      <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all hidden md:block" size={18} />
                    </Link>
                    <button 
                      onClick={() => setIsConsultationOpen(true)}
                      className="group relative flex-1 md:flex-none px-4 md:px-10 py-3.5 md:py-5 border-2 border-white/40 text-white font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.3em] overflow-hidden transition-all hover:border-white hover:bg-white hover:text-black flex items-center justify-center gap-2 md:gap-3 hover:scale-105 active:scale-95"
                    >
                      <Phone size={12} className="md:w-3.5 md:h-3.5 group-hover:animate-shake" />
                      <span>Консультація</span>
                    </button>
                  </div>
                </motion.div>
              </div>



              {/* Decorative Right Side (Desktop Only) */}
              <div className="hidden lg:flex justify-end items-end h-full pb-20">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="text-right space-y-4"
                >
                  <div className="text-[10px] font-black tracking-[0.6em] text-white/20 uppercase">ANVIBUD PRO SYSTEM</div>
                  <div className="text-2xl font-light italic text-white/80">{slides[current].stats}</div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress & Navigation Controls */}
      <div className="absolute bottom-5 md:bottom-10 left-4 md:left-20 right-4 md:right-20 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-12">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(i)}
              className="group flex flex-col gap-4 text-left"
            >
              <span className={`text-[10px] font-black tracking-widest transition-colors ${current === i ? "text-white" : "text-white/20 group-hover:text-white/50"}`}>
                {slide.number}
              </span>
              <div className="w-16 md:w-32 h-[2px] bg-white/10 relative overflow-hidden">
                {current === i && (
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-white" 
                    style={{ width: `${progress}%` }}
                  />
                )}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-colors ${current === i ? "text-white/60" : "text-white/0"}`}>
                {slide.highlight}
              </span>
            </button>
          ))}
        </div>

        {/* Manual Arrows */}
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => goToSlide((current - 1 + slides.length) % slides.length)}
            className="w-10 h-10 md:w-14 md:h-14 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
          >
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </button>
          <button 
            onClick={() => goToSlide((current + 1) % slides.length)}
            className="w-10 h-10 md:w-14 md:h-14 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
          >
            <ChevronRight size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Vertical Side Text */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 vertical-text hidden xl:block opacity-10">
        <span className="text-[10px] font-black tracking-[1em] uppercase text-white rotate-180">ARCHITECTURAL SOLUTIONS</span>
      </div>

      <ConsultationModal 
        isOpen={isConsultationOpen} 
        onClose={() => setIsConsultationOpen(false)} 
      />
      
      <style jsx>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </div>
  );
}
