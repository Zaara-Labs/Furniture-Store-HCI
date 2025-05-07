import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[60vh] bg-gray-900">
          <div className="absolute inset-0">
            <Image 
              src="/images/landing/hero5.jpg" 
              alt="Privacy Policy - FABRIQUÉ" 
              fill
              className="object-cover opacity-60"
              priority
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center mx-auto px-6">
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-4">Privacy Policy</h1>
              <p className="text-xl text-white max-w-2xl">How we protect and respect your personal information</p>
            </div>
          </div>
        </section>
        
        {/* Privacy Policy Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg prose-amber mx-auto">
                <p className="text-gray-600 mb-8">
                  Last Updated: May 7, 2025
                </p>
                
                <h2 className="text-2xl font-serif font-medium mb-4">Introduction</h2>
                <p className="mb-6">
                  FABRIQUÉ (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy and ensuring the security of your personal information. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, 
                  or make purchases from our store.
                </p>
                <p className="mb-6">
                  By accessing or using our website, you agree to the terms of this Privacy Policy. If you do not agree with the practices described in this policy, 
                  please do not use our website or services.
                </p>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Information We Collect</h2>
                <p className="mb-4">We may collect the following types of information:</p>
                
                <h3 className="text-xl font-medium mb-3 mt-6">Personal Information</h3>
                <ul className="list-disc pl-6 mb-6">
                  <li>Name, email address, phone number, and billing/shipping address when you create an account or place an order</li>
                  <li>Payment information when you make a purchase (note: we do not store complete credit card details)</li>
                  <li>Account login credentials</li>
                  <li>Information provided when contacting our customer service</li>
                  <li>Preferences and furniture customization choices</li>
                </ul>
                
                <h3 className="text-xl font-medium mb-3 mt-6">Automatically Collected Information</h3>
                <ul className="list-disc pl-6 mb-6">
                  <li>Device information (browser type, operating system, IP address)</li>
                  <li>Usage data (pages visited, time spent, interactions with features)</li>
                  <li>Location information (with your consent)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">How We Use Your Information</h2>
                <p className="mb-4">We use your information for the following purposes:</p>
                
                <ul className="list-disc pl-6 mb-6">
                  <li>Process and fulfill your orders, including delivery and returns</li>
                  <li>Manage your account and provide customer support</li>
                  <li>Personalize your shopping experience</li>
                  <li>Send order confirmations, shipping updates, and receipts</li>
                  <li>Communicate about promotions, new products, or events (if you&apos;ve opted in)</li>
                  <li>Improve our website, products, and services</li>
                  <li>Detect and prevent fraud or unauthorized access</li>
                  <li>Comply with legal obligations</li>
                </ul>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Sharing Your Information</h2>
                <p className="mb-4">We may share your information with:</p>
                
                <ul className="list-disc pl-6 mb-6">
                  <li>Service providers who help us operate our business (payment processors, shipping companies, technology providers)</li>
                  <li>Professional advisors (attorneys, accountants, insurers)</li>
                  <li>Government authorities when required by law or to protect our rights</li>
                  <li>Business partners with your consent</li>
                </ul>
                
                <p className="mb-6">
                  We do not sell your personal information to third parties.
                </p>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Cookies and Tracking Technologies</h2>
                <p className="mb-6">
                  We use cookies, web beacons, and similar technologies to enhance your experience on our website, 
                  analyze traffic patterns, and gather demographic information. You can control cookies through your browser settings, 
                  but disabling them may affect your browsing experience.
                </p>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Your Privacy Rights</h2>
                <p className="mb-4">Depending on your location, you may have the following rights:</p>
                
                <ul className="list-disc pl-6 mb-6">
                  <li>Access and review your personal information</li>
                  <li>Correct inaccuracies in your personal information</li>
                  <li>Delete your personal information</li>
                  <li>Restrict or object to the processing of your information</li>
                  <li>Data portability (receive your information in a structured, commonly used format)</li>
                  <li>Withdraw consent (where processing is based on consent)</li>
                </ul>
                
                <p className="mb-6">
                  To exercise these rights, please contact us using the information in the &quot;Contact Us&quot; section below.
                </p>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Data Security</h2>
                <p className="mb-6">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, 
                  accidental loss, destruction, or damage. However, no method of transmission over the Internet or electronic storage is 100% secure, 
                  so we cannot guarantee absolute security.
                </p>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Data Retention</h2>
                <p className="mb-6">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, 
                  unless a longer retention period is required or permitted by law.
                </p>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Children&apos;s Privacy</h2>
                <p className="mb-6">
                  Our website is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. 
                  If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                </p>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Changes to This Privacy Policy</h2>
                <p className="mb-6">
                  We may update this Privacy Policy from time to time. The updated version will be indicated by an updated &quot;Last Updated&quot; date 
                  and will be effective as soon as it is accessible. We encourage you to review this Privacy Policy regularly to stay informed about our information practices.
                </p>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Contact Us</h2>
                <p className="mb-6">
                  If you have questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
                </p>
                
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-8">
                  <p className="mb-2"><strong>FABRIQUÉ Customer Support</strong></p>
                  <p className="mb-2">Email: privacy@fabrique.com</p>
                  <p className="mb-2">Phone: (+94) 077-123-4567</p>
                  <p>Address: 120/8, Furniture Avenue, Design District, Colombo, SL 10001</p>
                </div>
              </div>
              
              {/* Call-to-action section */}
              <div className="mt-16 bg-amber-100 p-8 rounded-lg border border-amber-100">
                <div className="text-center">
                  <h3 className="text-xl font-medium mb-4">Have more questions about your privacy?</h3>
                  <p className="mb-6 text-gray-600">
                    We&apos;re committed to transparency and are happy to address any concerns you may have about your personal information.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link 
                      href="/contact" 
                      className="px-6 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors"
                    >
                      Contact Our Team
                    </Link>
                    <Link 
                      href="/shop" 
                      className="px-6 py-3 border border-amber-800 text-amber-800 font-medium rounded-md hover:bg-amber-100 transition-colors"
                    >
                      Continue Shopping
                    </Link>
                  </div>
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