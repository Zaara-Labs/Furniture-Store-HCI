"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-medium leading-tight mb-6 transition-transform duration-500 ease-out transform translate-y-0">
              Elevate Your Space With Timeless Elegance...
            </h1>
            <p className="text-lg text-white mb-8 transition-transform duration-500 ease-out delay-100 transform translate-y-0">
              Discover Our Curated Collection Of Furniture That Blends Comfort, Style, And Craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 transition-transform duration-500 ease-out delay-200 transform translate-y-0">
              <Link 
                href="/shop" 
                className="px-8 py-3 bg-white text-black border-[2px] border-white font-medium rounded-md hover:bg-black hover:border-black hover:text-white transition-colors text-center"
              >
                Shop Now
              </Link>
              <Link 
                href="/collections" 
                className="px-8 py-3 bg-transparent text-white border-[2px] border-white font-medium rounded-md hover:bg-white hover:text-black hover:bg-opacity-10 transition-colors text-center"
              >
                View Collections
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center space-x-3">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-3 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? "bg-white scale-110" : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
