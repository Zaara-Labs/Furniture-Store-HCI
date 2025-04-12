// import Image from "next/image";
import Link from "next/link";

export default function FeaturedCategories() {
  const categories = [
    {
      name: "Living Room",
      image: "/images/living-room.jpg",
      link: "/collections/living-room"
    },
    {
      name: "Bedroom",
      image: "/images/bedroom.jpg",
      link: "/collections/bedroom"
    },
    {
      name: "Dining",
      image: "/images/dining.jpg",
      link: "/collections/dining"
    },
    {
      name: "Office",
      image: "/images/office.jpg",
      link: "/collections/office"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-medium mb-4">Explore Our Collections</h2>
          <p className="max-w-2xl mx-auto text-gray-600">
            Discover furniture pieces crafted for every room in your home, designed with both aesthetics and functionality in mind.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div key={index} className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="aspect-[3/4] relative">
                {/* Replace with actual optimized images */}
                <div className="w-full h-full bg-gray-200"></div>
                {/* This would be replaced with actual images */}
                {/* <Image 
                  src={category.image} 
                  alt={category.name} 
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                /> */}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 w-full">
                  <h3 className="text-xl text-white font-medium mb-2">{category.name}</h3>
                  <Link 
                    href={category.link}
                    className="inline-block text-white font-medium group-hover:underline"
                  >
                    View Collection
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
