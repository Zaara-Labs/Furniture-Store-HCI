"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function FeaturedCategories() {
  const categories = [
    {
      name: "Living Room",
      image: "/images/landing_collection/living.jpg",
      link: "/collections/living-room"
    },
    {
      name: "Bedroom",
      image: "/images/landing_collection/bed.jpg",
      link: "/collections/bedroom"
    },
    {
      name: "Dining",
      image: "/images/landing_collection/dining.jpg",
      link: "/collections/dining"
    },
    {
      name: "Office",
      image: "/images/landing_collection/office.jpg",
      link: "/collections/office"
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-serif font-medium mb-4">Explore Our Collections</h2>
          <p className="max-w-2xl mx-auto text-gray-600">
            Discover furniture pieces crafted for every room in your home, designed with both aesthetics and functionality in mind.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {categories.map((category, index) => (
            <motion.div 
              key={index} 
              className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
              variants={cardVariants}
            >
              <div className="aspect-[3/4] relative">
                <Image 
                  src={category.image} 
                  alt={category.name} 
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 w-full">
                  <h3 className="text-xl text-white font-medium mb-2">{category.name}</h3>
                  <Link 
                    href={category.link}
                    className="inline-block text-white font-medium transition-all duration-300 hover:text-amber-300 hover:translate-x-1"
                  >
                    View Collection
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
