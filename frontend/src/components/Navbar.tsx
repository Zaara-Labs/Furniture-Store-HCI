"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

// Define navigation item type
type NavItem = {
  name: string;
  href: string;
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, loading, isDesigner } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();

  // Navigation items for regular customers
  const customerNavItems: NavItem[] = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Collections", href: "/collections" },
    { name: "User Guide", href: "/customization-guide"},
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" }
  ];

  // Navigation items for designers
  const designerNavItems: NavItem[] = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Products", href: "/dashboard/products" },
    { name: "Design Projects", href: "/dashboard/designs" },
    { name: "Customer Requests", href: "/dashboard/requests" }
  ];

  // Select navigation items based on user role
  const navItems = isDesigner() ? designerNavItems : customerNavItems;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-white py-4 px-6 shadow-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-serif font-medium text-amber-800">
            FABRIQUÉ
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-gray-700 hover:text-amber-800 relative group transition-colors ${
                isActive(item.href) ? "text-amber-800 font-medium" : ""
              }`}
            >
              {item.name}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-amber-800 transition-all duration-300 ${
                isActive(item.href) ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <button className="text-gray-700 hover:text-amber-800 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          
          {/* Authentication buttons */}
          {!loading && (
            user ? (
              <div className="relative group">
                <button className="flex items-center text-gray-700 hover:text-amber-800 transition-colors focus:outline-none">
                  <span className="mr-1">{user.name?.split(' ')[0] || 'Account'}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Account
                  </Link>
                  {/* Only show Orders link for customers */}
                  {!isDesigner() && (
                    <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Orders
                    </Link>
                  )}
                  {!isDesigner() && (
                    <Link href="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Wishlist
                    </Link>
                  )}
                  {isDesigner() && (
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-amber-800 font-medium hover:bg-gray-100">
                      Designer Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-amber-800 transition-colors"
              >
                Sign in
              </Link>
            )
          )}
          
          {/* Only show shopping cart for customers */}
          {/* Cart Icon with Badge */}
          {(!user || !isDesigner()) && (
            <>
            <Link href="/wishlist" className="text-gray-700 hover:text-amber-800 transition-colors relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>
            <Link href="/cart" className="text-gray-700 hover:text-amber-800 transition-colors relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {!isDesigner() && cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
          </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden py-4 bg-white absolute left-0 right-0 shadow-md">
          <div className="flex flex-col space-y-3 px-6">
            {/* Render role-specific navigation items for mobile */}
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-gray-700 hover:text-amber-800 relative group transition-colors py-1 ${
                  isActive(item.href) ? "text-amber-800 font-medium" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-amber-800 transition-all duration-300 ${
                  isActive(item.href) ? "w-full" : "w-0 group-hover:w-full"
                }`}></span>
              </Link>
            ))}
            
            {/* Auth links for mobile */}
            {!loading && (
              !user ? (
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-amber-800 relative group transition-colors py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-800 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/account"
                    className="text-gray-700 hover:text-amber-800 relative group transition-colors py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Account
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-800 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                  
                  {isDesigner() && (
                    <Link
                      href="/dashboard"
                      className="text-amber-800 font-medium hover:text-amber-900 relative group transition-colors py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Designer Dashboard
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-800 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-gray-700 hover:text-amber-800 relative group transition-colors py-1"
                  >
                    Sign out
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-800 group-hover:w-full transition-all duration-300"></span>
                  </button>
                </>
              )
            )}
            
            <div className="flex space-x-4 pt-2">
              <button className="text-gray-700 hover:text-amber-800 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              {(!user || !isDesigner()) && (
                <>
                  <Link href="/wishlist" className="text-gray-700 hover:text-amber-800 transition-colors relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {wishlistCount > 99 ? '99+' : wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/cart" className="text-gray-700 hover:text-amber-800 transition-colors relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                          {cartCount > 99 ? '99+' : cartCount}
                        </span>
                      )}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}