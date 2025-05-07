"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export default function AboutPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImages = [
    "/images/about/1.jpg",
    "/images/about/2.jpg",
    "/images/about/3.jpg",
    "/images/about/4.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section with Transitioning Images */}
        <section className="relative h-[60vh] bg-gray-900 overflow-hidden">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{
                opacity: currentImageIndex === index ? 1 : 0,
                zIndex: currentImageIndex === index ? 1 : 0,
              }}
            >
              <Image
                src={image}
                alt={`About FABRIQUÉ Furniture ${index + 1}`}
                fill
                className="object-cover opacity-60"
                priority={index === 0}
              />
            </div>
          ))}
          
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="text-center mx-auto px-6">
              <motion.h1
                className="text-4xl md:text-5xl font-serif font-medium text-white mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Our Story
              </motion.h1>
              <motion.p
                className="text-xl text-white max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Crafting elegance for your living spaces since 2010
              </motion.p>
            </div>
          </motion.div>

          {/* Optional: Navigation Dots */}
          <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center">
            <div className="flex space-x-2">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentImageIndex === index ? "bg-white w-4" : "bg-white/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <motion.div
                className="md:w-1/2"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h2 className="text-3xl font-serif font-medium mb-6">
                  Our Mission
                </h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  At FABRIQUÉ, we believe that your home should be a reflection
                  of your unique personality and style. Our mission is to craft
                  furniture that not only enhances your living spaces but also
                  stands the test of time—both in durability and design.
                </p>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  We&apos;re committed to sustainable practices, working with
                  responsibly sourced materials, and partnering with artisans
                  who share our dedication to quality craftsmanship.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Every piece we create is designed with both aesthetics and
                  functionality in mind, ensuring that your furniture is not
                  only beautiful but also practical for everyday living.
                </p>
              </motion.div>
              <motion.div
                className="md:w-1/2 relative h-[400px] rounded-lg overflow-hidden shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Image
                  src="/images/about/mission.jpg"
                  alt="FABRIQUÉ Workshop"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl font-serif font-medium mb-4">
                Our Values
              </h2>
              <p className="max-w-3xl mx-auto text-gray-600">
                These core values guide every decision we make, from the
                selection of materials to our customer service philosophy.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                      />
                    </svg>
                  ),
                  title: "Quality Craftsmanship",
                  description:
                    "We take pride in every piece we create, paying meticulous attention to detail from the initial design to the final production.",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5A2.5 2.5 0 0020 5.5v-1.65"
                      />
                    </svg>
                  ),
                  title: "Sustainability",
                  description:
                    "We&apos;re committed to environmentally friendly practices, using responsibly sourced materials and minimizing waste in our production process.",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  ),
                  title: "Customer Trust",
                  description:
                    "Building long-lasting relationships with our customers through transparency, reliability, and exceptional service is fundamental to our business.",
                },
              ].map((value, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-8 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{
                    y: -10,
                    boxShadow:
                      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div className="bg-amber-800 text-white w-12 h-12 flex items-center justify-center rounded-full mb-6 mx-auto">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-medium text-center mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-center">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Team Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl font-serif font-medium mb-4">
                Meet Our Team
              </h2>
              <p className="max-w-3xl mx-auto text-gray-600">
                The passionate individuals behind FABRIQUÉ who bring creativity,
                expertise, and dedication to every project.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  name: "Olivia Parker",
                  role: "Founder & Lead Designer",
                  image: "/images/testimonial/1.jpg",
                },
                {
                  name: "Ethan Brooks",
                  role: "Master Craftsman",
                  image: "/images/testimonial/2.jpg",
                },
                {
                  name: "Sophia Miller",
                  role: "Interior Design Consultant",
                  image: "/images/testimonial/3.jpg",
                },
                {
                  name: "James Wilson",
                  role: "Sustainability Director",
                  image: "/images/testimonial/4.jpg",
                },
              ].map((member, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  whileHover={{ y: -8 }}
                >
                  <motion.div
                    className="relative w-48 h-48 mx-auto mb-6 overflow-hidden rounded-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                  <h3 className="text-xl font-medium mb-1">{member.name}</h3>
                  <p className="text-amber-800">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Workshop Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <motion.div
                className="md:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h2 className="text-3xl font-serif font-medium mb-6">
                  Our Workshop
                </h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Located in the heart of the city, our workshop is where
                  creativity meets craftsmanship. It&apos;s a space where our
                  team of skilled artisans bring designs to life, transforming
                  raw materials into beautiful, functional pieces.
                </p>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  We welcome visitors to tour our workshop, observe our
                  craftspeople at work, and gain insight into our meticulous
                  creation process. It&apos;s an opportunity to witness
                  firsthand the care and precision that goes into each piece of
                  FABRIQUÉ furniture.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/contact"
                    className="inline-block px-8 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors"
                  >
                    Schedule a Visit
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div
                className="md:w-1/2 relative h-[400px] rounded-lg overflow-hidden shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Image
                  src="/images/about/workshop.jpg"
                  alt="FABRIQUÉ Workshop"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-amber-800 text-white">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl font-serif font-medium mb-6">
                Experience the FABRIQUÉ Difference
              </h2>
              <p className="max-w-2xl mx-auto mb-8 text-amber-50">
                Discover our collection of thoughtfully designed furniture
                pieces crafted to elevate your home.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/shop"
                  className="inline-block px-8 py-3 bg-white text-amber-800 font-medium rounded-md hover:bg-amber-50 transition-colors"
                >
                  Explore Collection
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/room-designer"
                  className="inline-block px-8 py-3 border-2 border-white text-white font-medium rounded-md hover:bg-amber-700 transition-colors"
                >
                  Try Room Designer
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}