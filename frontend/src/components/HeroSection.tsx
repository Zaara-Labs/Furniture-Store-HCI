import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="relative h-screen">
      {/* Background image - you'll need to add a real image */}
      <div className="absolute inset-0 bg-[url('/images/hero-furniture.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>
      
      <div className="relative h-full flex items-center">
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
                className="px-8 py-3 bg-white text-gray-900 font-medium rounded-md hover:bg-gray-100 transition-colors text-center"
              >
                Shop Now
              </Link>
              <Link 
                href="/collections" 
                className="px-8 py-3 bg-transparent text-white border border-white font-medium rounded-md hover:bg-white hover:bg-opacity-10 transition-colors text-center"
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
