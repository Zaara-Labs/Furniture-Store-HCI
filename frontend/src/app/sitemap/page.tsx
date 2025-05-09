"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Define the sitemap structure
type SitemapNode = {
  title: string;
  path: string;
  description?: string;
  children?: SitemapNode[];
  icon?: React.ReactNode;
  isAuth?: boolean;
  isDesigner?: boolean;
};

const SitemapPage = () => {
  const pathname = usePathname();
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});

  // Toggle expand/collapse state for a node
  const toggleNode = (path: string) => {
    setOpenNodes(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Define site structure
  const siteStructure: SitemapNode[] = [
    {
      title: "Home",
      path: "/",
      description: "Discover beautiful, timeless furniture pieces for your home",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      title: "Shop",
      path: "/shop",
      description: "Browse our complete catalog of furniture",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      children: [
        {
          title: "Product Detail",
          path: "/product/[slug]",
          description: "View detailed information about a specific product"
        }
      ]
    },
    {
      title: "Collections",
      path: "/collections",
      description: "Explore our curated collections",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      children: [
        { title: "Living Room", path: "/collections/living-room", description: "Living room furniture collections" },
        { title: "Dining Room", path: "/collections/dining-room", description: "Dining room furniture collections" },
        { title: "Bedroom", path: "/collections/bedroom", description: "Bedroom furniture collections" },
        { title: "Office", path: "/collections/office", description: "Office furniture collections" }
      ]
    },
    {
      title: "Customization Guide",
      path: "/customization-guide",
      description: "Learn how to customize furniture to your needs",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      title: "Room Designer",
      path: "/room-designer",
      description: "Design your room with our interactive 3D tool",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      )
    },
    {
      title: "About",
      path: "/about",
      description: "Learn about our story, mission, and craftmanship",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Contact",
      path: "/contact",
      description: "Get in touch with our team",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "User Account",
      path: "/account",
      description: "Manage your personal account",
      isAuth: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      children: [
        { title: "My Orders", path: "/account/orders", description: "View your order history" },
        { title: "My Addresses", path: "/account/addresses", description: "Manage your shipping addresses" },
        { title: "My Favorites", path: "/wishlist", description: "View your wishlist" },
        { title: "Shopping Cart", path: "/cart", description: "View your shopping cart" }
      ]
    },
    {
      title: "Designer Dashboard",
      path: "/dashboard",
      description: "Designer exclusive area to manage products and designs",
      isDesigner: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      children: [
        { title: "Products", path: "/dashboard/products", description: "Manage your product catalog" },
        { title: "New Product", path: "/dashboard/products/new", description: "Create a new product" },
        { title: "Design Projects", path: "/dashboard/designs", description: "Manage your design projects" },
        { title: "Customer Requests", path: "/dashboard/requests", description: "View and respond to customer requests" },
        { title: "Settings", path: "/dashboard/settings", description: "Configure your dashboard settings" }
      ]
    },
    {
      title: "Authentication",
      path: "/auth",
      description: "Sign up or log in to your account",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      children: [
        { title: "Login", path: "/auth/login", description: "Sign in to your account" },
        { title: "Sign Up", path: "/auth/signup", description: "Create a new account" }
      ]
    },
    {
      title: "Legal",
      path: "/legal",
      description: "Legal information and policies",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      children: [
        { title: "Privacy Policy", path: "/privacy", description: "Our privacy policy" },
        { title: "Terms of Service", path: "/terms", description: "Our terms of service" }
      ]
    },
    {
      title: "Error Pages",
      path: "/errors",
      description: "System error pages",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      children: [
        { title: "Access Denied", path: "/access-denied", description: "Access denied error page" },
        { title: "Not Found", path: "/404", description: "Page not found error" }
      ]
    }
  ];

  // Render a sitemap node and its children
  const renderNode = (node: SitemapNode, depth = 0, index = 0, isLast = false) => {
    const isActive = pathname === node.path;
    const isOpen = openNodes[node.path] || false;
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.path} className={`relative ${depth > 0 ? 'ml-5 pl-4' : ''}`}>
        {/* Connecting lines */}
        {depth > 0 && (
          <>
            <div className="absolute left-0 top-0 h-full w-px bg-gray-300"></div>
            <div className="absolute left-0 top-4 w-4 h-px bg-gray-300"></div>
          </>
        )}
        
        {/* Node content */}
        <div className={`relative border rounded-lg p-4 mb-4 transition-all duration-300 ${
          isActive ? 'bg-amber-50 border-amber-800' : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className="p-2 rounded-full bg-amber-100 text-amber-800">
                {node.icon || (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
              
              <div>
                {/* Title with link */}
                <div className="flex items-center">
                  <Link href={node.path} className="text-lg font-medium text-gray-800 hover:text-amber-800 transition-colors">
                    {node.title}
                  </Link>
                  
                  {/* Access badges */}
                  {node.isAuth && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      User only
                    </span>
                  )}
                  {node.isDesigner && (
                    <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      Designer only
                    </span>
                  )}
                </div>
                
                {/* Description */}
                {node.description && (
                  <p className="text-sm text-gray-600 mt-1">{node.description}</p>
                )}
                
                {/* Path */}
                <p className="text-xs text-gray-400 mt-1 font-mono">{node.path}</p>
              </div>
            </div>
            
            {/* Expand/collapse button for nodes with children */}
            {hasChildren && (
              <button 
                onClick={() => toggleNode(node.path)}
                className={`p-1 rounded-full hover:bg-gray-200 transition-colors ${isOpen ? 'bg-gray-200' : ''}`}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Children nodes */}
        {hasChildren && isOpen && (
          <div className="ml-4">
            {node.children!.map((child, childIndex) => 
              renderNode(child, depth + 1, childIndex, childIndex === node.children!.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif font-medium text-gray-900 mb-4">
          FABRIQUÉ Sitemap
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A comprehensive map of our website to help you navigate through all available pages and sections
        </p>
      </div>
      
      <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
        <div className="flex justify-end mb-6">
          <button 
            onClick={() => {
              // Expand or collapse all nodes
              const allClosed = Object.values(openNodes).every(v => !v);
              let newOpenNodes: Record<string, boolean> = {};
              
              if (allClosed) {
                // Open all
                siteStructure.forEach(node => {
                  newOpenNodes[node.path] = true;
                  if (node.children) {
                    node.children.forEach(child => {
                      newOpenNodes[child.path] = true;
                    });
                  }
                });
              }
              
              setOpenNodes(newOpenNodes);
            }}
            className="px-4 py-2 bg-amber-50 text-amber-800 rounded-md hover:bg-amber-100 transition-colors text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {Object.values(openNodes).some(v => v) ? "Collapse All" : "Expand All"}
          </button>
        </div>
        
        <div className="space-y-1">
          {siteStructure.map((node, index) => renderNode(node, 0, index, index === siteStructure.length - 1))}
        </div>
      </div>
      
      <div className="mt-16 text-center text-sm text-gray-500">
        <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  );
};

export default SitemapPage;
