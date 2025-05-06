import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[60vh] bg-gray-900">
          <div className="absolute inset-0">
            <Image 
              src="/images/landing/hero3.jpg" 
              alt="About Pneumetra Furniture" 
              fill
              className="object-cover opacity-60"
              priority
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center mx-auto px-6">
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-4">Our Story</h1>
              <p className="text-xl text-white max-w-2xl">Crafting elegance for your living spaces since 2010</p>
            </div>
          </div>
        </section>
        
        {/* Our Mission Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-serif font-medium mb-6">Our Mission</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  At Pneumetra, we believe that your home should be a reflection of your unique personality and style. Our mission is to craft furniture that not only enhances your living spaces but also stands the test of time—both in durability and design.
                </p>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  We're committed to sustainable practices, working with responsibly sourced materials, and partnering with artisans who share our dedication to quality craftsmanship.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Every piece we create is designed with both aesthetics and functionality in mind, ensuring that your furniture is not only beautiful but also practical for everyday living.
                </p>
              </div>
              <div className="md:w-1/2 relative h-[400px] rounded-lg overflow-hidden shadow-xl">
                <Image 
                  src="/images/landing/interior.jpg" 
                  alt="Pneumetra Workshop" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Values Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-medium mb-4">Our Values</h2>
              <p className="max-w-3xl mx-auto text-gray-600">
                These core values guide every decision we make, from the selection of materials to our customer service philosophy.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="bg-amber-800 text-white w-12 h-12 flex items-center justify-center rounded-full mb-6 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-center mb-4">Quality Craftsmanship</h3>
                <p className="text-gray-600 text-center">
                  We take pride in every piece we create, paying meticulous attention to detail from the initial design to the final production.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="bg-amber-800 text-white w-12 h-12 flex items-center justify-center rounded-full mb-6 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5A2.5 2.5 0 0020 5.5v-1.65" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-center mb-4">Sustainability</h3>
                <p className="text-gray-600 text-center">
                  We're committed to environmentally friendly practices, using responsibly sourced materials and minimizing waste in our production process.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="bg-amber-800 text-white w-12 h-12 flex items-center justify-center rounded-full mb-6 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-center mb-4">Customer Trust</h3>
                <p className="text-gray-600 text-center">
                  Building long-lasting relationships with our customers through transparency, reliability, and exceptional service is fundamental to our business.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Team Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-medium mb-4">Meet Our Team</h2>
              <p className="max-w-3xl mx-auto text-gray-600">
                The passionate individuals behind Pneumetra who bring creativity, expertise, and dedication to every project.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {name: "Olivia Parker", role: "Founder & Lead Designer", image: "/images/testimonial/1.jpg"},
                {name: "Ethan Brooks", role: "Master Craftsman", image: "/images/testimonial/2.jpg"},
                {name: "Sophia Miller", role: "Interior Design Consultant", image: "/images/testimonial/3.jpg"},
                {name: "James Wilson", role: "Sustainability Director", image: "/images/testimonial/4.jpg"}
              ].map((member, index) => (
                <div key={index} className="text-center">
                  <div className="relative w-48 h-48 mx-auto mb-6 overflow-hidden rounded-full">
                    <Image 
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-medium mb-1">{member.name}</h3>
                  <p className="text-amber-800">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Our Workshop Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-serif font-medium mb-6">Our Workshop</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Located in the heart of the city, our workshop is where creativity meets craftsmanship. It's a space where our team of skilled artisans bring designs to life, transforming raw materials into beautiful, functional pieces.
                </p>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  We welcome visitors to tour our workshop, observe our craftspeople at work, and gain insight into our meticulous creation process. It's an opportunity to witness firsthand the care and precision that goes into each piece of Pneumetra furniture.
                </p>
                <Link href="/contact" className="inline-block px-8 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors">
                  Schedule a Visit
                </Link>
              </div>
              <div className="md:w-1/2 relative h-[400px] rounded-lg overflow-hidden shadow-xl">
                <Image 
                  src="/images/landing_collection/living.jpg" 
                  alt="Pneumetra Workshop" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-amber-800 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-serif font-medium mb-6">Experience the Pneumetra Difference</h2>
            <p className="max-w-2xl mx-auto mb-8 text-amber-50">
              Discover our collection of thoughtfully designed furniture pieces crafted to elevate your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop" className="px-8 py-3 bg-white text-amber-800 font-medium rounded-md hover:bg-amber-50 transition-colors">
                Explore Collection
              </Link>
              <Link href="/room-designer" className="px-8 py-3 border-2 border-white text-white font-medium rounded-md hover:bg-amber-700 transition-colors">
                Try Room Designer
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}