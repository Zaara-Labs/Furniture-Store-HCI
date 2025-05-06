import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <div className="relative h-screen">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <Image 
          src="/images/landing/hero2.jpg"
          alt="Hero furniture showcase"
          fill
          priority
          className="object-cover z-0"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black opacity-30 z-10"></div>
      </div>
      
      {/* Content */}
      <div className="relative h-full flex items-center z-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="w-full md:w-2/3 lg:w-1/2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-medium leading-tight mb-6">
              Elevate Your Space With Timeless Elegance
            </h1>
            <p className="text-xl text-white mb-8">
              Discover our curated collection of furniture that blends comfort, style, and craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/shop" 
                className="px-8 py-3 bg-white text-black font-medium rounded-md hover:bg-black hover:text-white transition-colors text-center"
              >
                Shop Now
              </Link>
              <Link 
                href="/collections" 
                className="px-8 py-3 bg-transparent text-white border-[2px] border-white font-medium rounded-md hover:bg-white hover:text-black hover:bg-opacity-10 transition-colors text-center"
              >
                View Collections
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
