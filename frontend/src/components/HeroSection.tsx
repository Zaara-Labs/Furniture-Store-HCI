"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const heroImages = [
    "/images/landing/hero1.jpg",
    "/images/landing/hero2.jpg",
    "/images/landing/hero3.jpg",
    "/images/landing/hero4.jpg",
    "/images/landing/hero5.jpg",
  ];

  // Auto-transition effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background images with transition */}
      {heroImages.map((img, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image 
            src={img}
            alt={`Hero furniture showcase ${index + 1}`}
            fill
            priority={index === 0}
            className="object-cover z-0"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black opacity-40 z-10"></div>
        </div>
      ))}
      
      {/* Content */}
      <div className="relative h-full flex items-center z-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="w-full md:w-2/3 lg:w-1/2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-medium leading-tight mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Elevate Your Space With Timeless Elegance...
              </motion.h1>
              <motion.p 
                className="text-lg text-white mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                Discover Our Curated Collection Of Furniture That Blends Comfort, Style, And Craftsmanship.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    href="/shop" 
                    className="block px-8 py-3 bg-white text-black border-[2px] border-white font-medium rounded-md hover:bg-black hover:border-black hover:text-white transition-colors text-center"
                  >
                    Shop Now
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    href="/collections" 
                    className="block px-8 py-3 bg-transparent text-white border-[2px] border-white font-medium rounded-md hover:bg-white hover:text-black hover:bg-opacity-10 transition-colors text-center"
                  >
                    View Collections
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center space-x-3">
        {heroImages.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-3 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? "bg-white scale-110" : "bg-white/50 hover:bg-white/80"
            }`}
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Scroll down indicator */}
      <motion.div 
        className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-30 cursor-pointer"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          delay: 1,
          repeat: Infinity,
          repeatType: "reverse",
          repeatDelay: 0.2
        }}
        onClick={() => window.scrollTo({
          top: window.innerHeight,
          behavior: 'smooth'
        })}
      >
        <div className="flex flex-col items-center">
          <span className="text-white text-sm mb-2">Scroll Down</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-white animate-bounce" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
