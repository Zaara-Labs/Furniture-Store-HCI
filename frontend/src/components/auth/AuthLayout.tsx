import React from 'react';
import Link from 'next/link';
import Navbar from '../Navbar';
import Footer from '../Footer';

export default function AuthLayout({ 
  children, 
  heading, 
  subheading, 
  linkText, 
  linkHref 
}: { 
  children: React.ReactNode; 
  heading: string;
  subheading: string;
  linkText: string;
  linkHref: string;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-20 px-4 mt-16 bg-[#f8f9fa]">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-serif font-medium text-center text-gray-800 mb-2">{heading}</h2>
            <p className="text-center text-gray-600 mb-8">{subheading}</p>
            
            {children}
            
            <div className="text-center mt-6">
              <Link 
                href={linkHref}
                className="text-amber-800 hover:text-amber-900 font-medium"
              >
                {linkText}
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
