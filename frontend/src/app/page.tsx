import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedCategories from "@/components/FeaturedCategories";
import FeaturedProducts from "@/components/FeaturedProducts";
import TestimonialSection from "@/components/TestimonialSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        <FeaturedCategories />
        <FeaturedProducts />
        
        {/* Newsletter Section */}
        <section className="py-20 bg-amber-800 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-serif font-medium mb-4">Join Our Newsletter</h2>
            <p className="max-w-2xl mx-auto mb-8">
              Subscribe to receive updates on new arrivals, special offers, and design inspiration.
            </p>
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-4 py-3 rounded-md text-gray-800 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-amber-800 font-medium rounded-md hover:bg-slate-100 hover:text-black transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
        
        <TestimonialSection />
        
        {/* Design Service Banner */}
        <section className="py-20 bg-gray-100">
          <div className="container mx-auto px-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 bg-gray-200 min-h-[300px]">
                  {/* This would be replaced with an actual image */}
                  {/* <Image 
                    src="/images/interior-design.jpg" 
                    alt="Interior Design Service" 
                    fill
                    className="object-cover"
                  /> */}
                </div>
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <h2 className="text-3xl font-serif font-medium mb-4">Interior Design Service</h2>
                  <p className="text-gray-600 mb-6">
                    Our expert designers can help transform your space. Book a consultation to get started on your dream interior.
                  </p>
                  <a 
                    href="/design-services" 
                    className="inline-block self-start px-8 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
