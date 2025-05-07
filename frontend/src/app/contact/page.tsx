import React from "react";
import Image from "next/image";
//import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[60vh] bg-gray-900">
          <div className="absolute inset-0">
            <Image 
              src="/images/landing/hero2.jpg" 
              alt="Contact Pneumetra Furniture" 
              fill
              className="object-cover opacity-60"
              priority
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center mx-auto px-6">
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-4">Contact Us</h1>
              <p className="text-xl text-white max-w-2xl">We&apos;d love to hear from you</p>
            </div>
          </div>
        </section>
        
        {/* Contact Form and Info Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Contact Form */}
              <div className="lg:w-2/3">
                <h2 className="text-3xl font-serif font-medium mb-8">Get in Touch</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                        placeholder="Your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                      placeholder="Tell us more about your inquiry..."
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex items-start">
                    <input
                      id="newsletter"
                      type="checkbox"
                      className="h-4 w-4 text-amber-800 focus:ring-amber-800 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="newsletter" className="ml-2 text-sm text-gray-600">
                      I&apos;d like to receive updates about new products, promotions, and design tips
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    className="px-8 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
              
              {/* Contact Information */}
              <div className="lg:w-1/3 bg-gray-100 p-8 rounded-lg self-start">
                <h3 className="text-xl font-medium mb-6">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-amber-800 text-white p-2 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Visit Our Showroom</h4>
                      <p className="text-gray-600">
                        120/8,<br /> Furniture Avenue,<br />
                        Design District,<br />
                        Colombo, SL 10001.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-amber-800 text-white p-2 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Phone</h4>
                      <p className="text-gray-600">(+94) 077-123-4567</p>
                      <p className="text-sm text-gray-500 mt-1">Mon-Fri: 9am - 6pm</p>
                      <p className="text-sm text-gray-500">Sat: 10am - 4pm</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-amber-800 text-white p-2 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Email</h4>
                      <p className="text-gray-600">info@fabrique.com</p>
                      <p className="text-sm text-gray-500 mt-1">We&apos;ll respond within 24 hours</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-xl font-medium mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="bg-amber-800 text-white p-2 rounded-full hover:bg-amber-900 transition-colors">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                    <a href="#" className="bg-amber-800 text-white p-2 rounded-full hover:bg-amber-900 transition-colors">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </a>
                    <a href="#" className="bg-amber-800 text-white p-2 rounded-full hover:bg-amber-900 transition-colors">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a href="#" className="bg-amber-800 text-white p-2 rounded-full hover:bg-amber-900 transition-colors">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Store Locations Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-medium mb-4">Our Locations</h2>
              <p className="max-w-2xl mx-auto text-gray-600">
                Visit our flagship showroom in New York or explore our other locations across the country.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-medium mb-3">Kandy</h3>
                <p className="text-gray-600 mb-4">
                  123, Furniture Avenue,<br />
                  Design District,<br />
                  Kandy, SL 10001.
                </p>
                <div className="h-60 relative rounded-lg overflow-hidden mb-4">
                  <Image 
                    src="/images/contact/1.jpg" 
                    alt="New York Showroom" 
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  <span className="font-medium">Opening Hours:</span><br />
                  Mon-Fri: 9am - 6pm<br />
                  Sat: 10am - 4pm<br />
                  Sun: Closed
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-800 font-medium transition-all duration-300 hover:translate-x-1 inline-flex items-center"
                >
                  Get Directions
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-medium mb-3">Gampaha</h3>
                <p className="text-gray-600 mb-4">
                  456, Modern Lane,<br />
                  Marina District,<br />
                  Gampaha, CA 94123.
                </p>
                <div className="h-60 relative rounded-lg overflow-hidden mb-4">
                  <Image 
                    src="/images/contact/2.jpg" 
                    alt="San Francisco Showroom" 
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  <span className="font-medium">Opening Hours:</span><br />
                  Mon-Fri: 10am - 7pm<br />
                  Sat-Sun: 11am - 5pm<br />
                  Sun: Closed
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-800 font-medium transition-all duration-300 hover:translate-x-1 inline-flex items-center"
                >
                  Get Directions
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-medium mb-3">Colombo</h3>
                <p className="text-gray-600 mb-4">
                  789, Furniture Plaza,<br />
                  River North,<br />
                  Colombo, IL 60654.
                </p>
                <div className="h-60 relative rounded-lg overflow-hidden mb-4">
                  <Image 
                    src="/images/contact/3.jpg" 
                    alt="Chicago Showroom" 
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  <span className="font-medium">Opening Hours:</span><br />
                  Mon-Fri: 9am - 6pm<br />
                  Sat: 10am - 4pm<br />
                  Sun: Closed
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-800 font-medium transition-all duration-300 hover:translate-x-1 inline-flex items-center"
                >
                  Get Directions
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-medium mb-4">Frequently Asked Questions</h2>
              <p className="max-w-2xl mx-auto text-gray-600">
                Find quick answers to common questions about our services and policies.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-3">Do you offer interior design services?</h3>
                <p className="text-gray-600">
                  Yes, we offer comprehensive interior design services. Our team of experienced designers can help you create a cohesive look for your space, from furniture selection to color schemes and accessories. Contact us to schedule a consultation.
                </p>
              </div>
              
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-3">What is your delivery policy?</h3>
                <p className="text-gray-600">
                  We offer delivery within a 50-mile radius of our showrooms. For standard-sized items, delivery typically takes 1-2 weeks. Custom pieces may require 6-8 weeks. Our delivery team will contact you to schedule a convenient delivery window.
                </p>
              </div>
              
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-3">Can I customize furniture pieces?</h3>
                <p className="text-gray-600">
                  Absolutely! We pride ourselves on offering customizable furniture. You can select from a variety of fabrics, finishes, and dimensions for most of our pieces. Visit our showroom to explore the options or contact our design team for assistance.
                </p>
              </div>
              
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-3">What is your return policy?</h3>
                <p className="text-gray-600">
                  We offer a 30-day return policy for stock items in original condition. Custom pieces are non-returnable. Please inspect all furniture upon delivery and notify us immediately of any issues. A 15% restocking fee may apply to returns.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-10">
              <p className="text-gray-600 mb-4">
                Don&apos;t see your question here? Contact our customer service team.
              </p>
              <a
                href="mailto:info@fabrique.com"
                className="inline-block px-8 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors"
              >
                Email Customer Service
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}