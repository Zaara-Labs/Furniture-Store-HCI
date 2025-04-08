import Image from "next/image";
import Link from "next/link";

export default function FeaturedProducts() {
  const products = [
    {
      id: 1,
      name: "Oakwood Armchair",
      price: "599.00",
      image: "/images/product-1.jpg",
      category: "Chairs"
    },
    {
      id: 2,
      name: "Meridian Coffee Table",
      price: "429.00",
      image: "/images/product-2.jpg",
      category: "Tables"
    },
    {
      id: 3,
      name: "Linen Sofa",
      price: "1,299.00",
      image: "/images/product-3.jpg",
      category: "Sofas"
    },
    {
      id: 4,
      name: "Bedside Table",
      price: "249.00",
      image: "/images/product-4.jpg",
      category: "Tables"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-medium mb-4">Bestselling Furniture</h2>
          <p className="max-w-2xl mx-auto text-gray-600">
            Discover our most popular pieces that blend style with exceptional craftsmanship.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="aspect-square relative bg-gray-100">
                  {/* This would be replaced with actual images */}
                  {/* <Image 
                    src={product.image} 
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  /> */}
                </div>
                <div className="p-4">
                  <p className="text-sm text-amber-800 mb-1">{product.category}</p>
                  <h3 className="font-medium text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-gray-700">${product.price}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link 
            href="/shop" 
            className="inline-block px-8 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
