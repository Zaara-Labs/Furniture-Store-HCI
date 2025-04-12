import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";
import { Partytown } from '@qwik.dev/partytown/react';

// Load Inter font for regular text
const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "FABRIQUÉ - Elegant Furniture Store",
  description: "Discover beautiful, timeless furniture pieces for your home with exceptional craftsmanship and design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <Partytown
          debug={process.env.NODE_ENV === 'development'}
          forward={[
            'dataLayer.push'
          ]}
          lib="/~partytown/"
          resolveUrl={url => {
            if (url.pathname.includes('/models/')) {
              const proxyUrl = new URL(url);
              return proxyUrl;
            }
            return url;
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster position="top-right" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
