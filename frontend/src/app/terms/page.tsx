import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[60vh] bg-gray-900">
          <div className="absolute inset-0">
            <Image 
              src="/images/landing/hero4.jpg" 
              alt="Terms of Service - FABRIQUÉ" 
              fill
              className="object-cover opacity-60"
              priority
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center mx-auto px-6">
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-4">Terms of Service</h1>
              <p className="text-xl text-white max-w-2xl">Please read these terms and conditions carefully</p>
            </div>
          </div>
        </section>
        
        {/* Terms Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg prose-amber mx-auto">
                <p className="text-gray-600 mb-8">
                  Last Updated: May 7, 2025
                </p>
                
                <h2 className="text-2xl font-serif font-medium mb-4">Agreement to Terms</h2>
                <p className="mb-6 text-justify">
                  These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&quot;) and 
                  FABRIQUÉ (&quot;we,&quot; &quot;us&quot; or &quot;our&quot;), concerning your access to and use of the FABRIQUÉ website as well as any other media form, media channel, 
                  mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the &quot;Site&quot;).
                </p>
                <p className="mb-6 text-justify">
                  You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with 
                  all of these Terms of Service, then you are expressly prohibited from using the Site and you must discontinue use immediately.
                </p>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Intellectual Property Rights</h2>
                <p className="mb-6 text-justify">
                  Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, 
                  audio, video, text, photographs, and graphics on the Site (collectively, the &quot;Content&quot;) and the trademarks, service marks, and logos contained 
                  therein (the &quot;Marks&quot;) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other 
                  intellectual property rights and unfair competition laws.
                </p>
                <p className="mb-6 text-justify">
                  The Content and the Marks are provided on the Site &quot;AS IS&quot; for your information and personal use only. Except as expressly provided in these 
                  Terms of Service, no part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly 
                  displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, 
                  without our express prior written permission.
                </p>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">User Representations</h2>
                <p className="mb-4">By using the Site, you represent and warrant that:</p>
                
                <ul className="list-disc pl-6 mb-6">
                  <li>All registration information you submit will be true, accurate, current, and complete;</li>
                  <li>You will maintain the accuracy of such information and promptly update such registration information as necessary;</li>
                  <li>You have the legal capacity and you agree to comply with these Terms of Service;</li>
                  <li>You are not a minor in the jurisdiction in which you reside;</li>
                  <li>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise;</li>
                  <li>You will not use the Site for any illegal or unauthorized purpose;</li>
                  <li>Your use of the Site will not violate any applicable law or regulation.</li>
                </ul>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Products</h2>
                <p className="mb-6 text-justify">
                  We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the 
                  Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, 
                  current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of the products.
                </p>
                <p className="mb-6 text-justify">
                  All products are subject to availability, and we cannot guarantee that items will be in stock. We reserve the right to discontinue any products 
                  at any time for any reason. Prices for all products are subject to change.
                </p>

                {/* Highlighted Shipping & Returns Section */}
                <div className="my-12 p-8 bg-amber-50 border-l-4 border-amber-800 rounded-r-lg">
                  <h2 className="text-2xl font-serif font-medium mb-4 text-amber-800">Shipping & Returns</h2>
                  
                  <h3 className="text-xl font-medium mb-3 mt-6">Shipping Policy</h3>
                  <p className="mb-4 text-justify">
                    FABRIQUÉ offers shipping services to destinations within our designated service areas. Shipping costs and delivery timeframes are as follows:
                  </p>
                  <ul className="list-disc pl-6 mb-6">
                    <li>Standard shipping (within 50 miles): 1-2 weeks for in-stock items</li>
                    <li>Custom orders: 6-8 weeks for production plus delivery time</li>
                    <li>International shipping: Available to select countries with custom quotes</li>
                    <li>White glove delivery service: Available at an additional cost</li>
                    <li>Assembly services: Available for most furniture items</li>
                  </ul>
                  <p className="mb-6 text-justify">
                    Our delivery team will contact you to schedule a delivery window that works with your schedule. For large items,
                    please ensure there is adequate access to your home and the intended room.
                  </p>
                  
                  <h3 className="text-xl font-medium mb-3 mt-6">Return Policy</h3>
                  <p className="mb-4 text-justify">
                    We stand behind the quality of our products. Our return policy includes the following provisions:
                  </p>
                  <ul className="list-disc pl-6 mb-6">
                    <li>30-day return period for stock items in original condition</li>
                    <li>Items must be unused, in original packaging, and with all tags and protective coverings intact</li>
                    <li>Custom pieces, clearance items, and floor models are non-returnable</li>
                    <li>A 15% restocking fee applies to all returns (except in cases of our error)</li>
                    <li>Return shipping costs are the responsibility of the customer unless the return is due to our error</li>
                    <li>All returns must be pre-authorized by contacting our customer service department</li>
                  </ul>
                  <p className="mb-4 text-justify">
                    To initiate a return, please contact our customer service team at returns@fabrique.com or feel free to call us on (+94) 077-123-4567.
                  </p>
                  
                  <div className="mt-4">
                    <Link 
                      href="/contact" 
                      className="text-amber-800 font-medium hover:text-amber-900 inline-flex items-center"
                    >
                      Contact us for more shipping & returns details
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Purchases and Payment</h2>
                <p className="mb-6 text-justify">
                  You agree to provide current, complete, and accurate purchase and account information for all purchases made on the Site. You further agree to 
                  promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can 
                  complete your transactions and contact you as needed.
                </p>
                <p className="mb-6">
                  We accept the following forms of payment:
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Visa</li>
                  <li>Mastercard</li>
                  <li>American Express</li>
                  <li>Discover</li>
                  <li>PayPal</li>
                  <li>Bank transfers</li>
                </ul>
                <p className="mb-6 text-justify">
                  Sales tax will be added to the price of purchases as deemed required by us. We may change prices at any time. All payments shall be in the 
                  currency listed on the Site.
                </p>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Order Cancellation</h2>
                <p className="mb-6 text-justify">
                  You can cancel your order for a full refund before it ships. Once an order has shipped, our standard return policy applies. Custom orders may 
                  be subject to a cancellation fee if production has already begun.
                </p>
                <p className="mb-6 text-justify">
                  Please note that certain items, such as custom furniture pieces made to your specifications, may have specific cancellation policies that will 
                  be communicated at the time of purchase.
                </p>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Warranty</h2>
                <p className="mb-6 text-justify">
                  FABRIQUÉ provides the following warranties on our products:
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Solid Wood Furniture: 5-year limited warranty against manufacturing defects</li>
                  <li>Upholstery Frames: 3-year limited warranty</li>
                  <li>Fabric and Leather: 1-year limited warranty against manufacturing defects</li>
                  <li>Mechanisms (recliners, sleeper sofas): 2-year limited warranty</li>
                </ul>
                <p className="mb-6 text-justify">
                  Warranties do not cover damage due to misuse, improper care, accidents, or normal wear and tear. Detailed warranty information is provided 
                  with each product upon delivery.
                </p>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Prohibited Activities</h2>
                <p className="mb-4 text-justify">
                  You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us. contact marketing department at marketing@fabrique.com
                </p>
                
                <p className="mb-4 text-justify">As a user of the Site, you agree not to:</p>
                
                <ul className="list-disc pl-6 mb-6">
                  <li>Systematically retrieve data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                  <li>Make any unauthorized use of the Site, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretenses.</li>
                  <li>Use the Site to advertise or offer to sell goods and services.</li>
                  <li>Circumvent, disable, or otherwise interfere with security-related features of the Site.</li>
                  <li>Engage in unauthorized framing of or linking to the Site.</li>
                  <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
                </ul>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Governing Law</h2>
                <p className="mb-6 text-justify">
                  These Terms of Service and your use of the Site are governed by and construed in accordance with the laws applicable in Sri Lanka, without 
                  regard to its conflict of law principles.
                </p>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Dispute Resolution</h2>
                <p className="mb-6 text-justify">
                  To expedite resolution and control the cost of any dispute, controversy, or claim related to these Terms of Service (each a &quot;Dispute&quot; and 
                  collectively, the &quot;Disputes&quot;) brought by either you or us (individually, a &quot;Party&quot; and collectively, the &quot;Parties&quot;), the Parties agree to first
                  attempt to negotiate any Dispute informally for at least thirty (30) days before initiating arbitration. Such informal negotiations commence 
                  upon written notice from one Party to the other Party.
                </p>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Corrections</h2>
                <p className="mb-6 text-justify">
                  There may be information on the Site that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, 
                  availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update 
                  the information on the Site at any time, without prior notice.
                </p>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Term and Termination</h2>
                <p className="mb-6 text-justify">
                  These Terms of Service shall remain in full force and effect while you use the Site. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF 
                  SERVICE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SITE (INCLUDING 
                  BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, 
                  WARRANTY, OR COVENANT CONTAINED IN THESE TERMS OF SERVICE OR OF ANY APPLICABLE LAW OR REGULATION.
                </p>

                <h2 className="text-2xl font-serif font-medium mb-4 mt-10">Contact Us</h2>
                <p className="mb-6 text-justify">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-8">
                  <p className="mb-2"><strong>FABRIQUÉ Customer Support</strong></p>
                  <p className="mb-2">Email: legal@fabrique.com</p>
                  <p className="mb-2">Phone: (+94) 077-123-4567</p>
                  <p>Address: 120/8, Furniture Avenue, Design District, Colombo, SL 10001</p>
                </div>
              </div>
              
              {/* Call-to-action section */}
              <div className="mt-16 bg-amber-100 p-8 rounded-lg border border-amber-100">
                <div className="text-center">
                  <h3 className="text-xl font-medium mb-4">Have questions about our terms?</h3>
                  <p className="mb-6 text-gray-600">
                    Our customer service team is here to help clarify any part of our Terms of Service.
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