"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Query } from "appwrite";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { productService } from "@/services/appwrite";
import { ProductCategory } from "@/types/collections/ProductCategory";
import { Product } from "@/types/collections/Product";
import { motion } from "framer-motion";

// Loading component that will be displayed when the shop content is loading
function ShopLoading() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-serif font-medium mb-8">Shop Our Collection</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Skeleton for filters sidebar */}
        <aside className="lg:w-64">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </aside>
        
        {/* Skeleton for products grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <div className="h-5 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <motion.div 
                key={index} 
                className="bg-white rounded-lg overflow-hidden shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: index * 0.1, // Staggered animation for each card
                  }
                }}
              >
                <div className="aspect-square relative bg-gray-100 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-shimmer" 
                       style={{ 
                         backgroundSize: '200% 100%',
                         animation: 'shimmer 1.5s infinite'
                       }}
                  ></div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded-full w-1/3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gray-200 to-gray-300 animate-shimmer" 
                         style={{ 
                           backgroundSize: '200% 100%',
                           animation: 'shimmer 1.5s infinite'
                         }}
                    ></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded-full w-3/4 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gray-200 to-gray-300 animate-shimmer" 
                         style={{ 
                           backgroundSize: '200% 100%',
                           animation: 'shimmer 1.5s infinite'
                         }}
                    ></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full w-1/4 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gray-200 to-gray-300 animate-shimmer" 
                         style={{ 
                           backgroundSize: '200% 100%',
                           animation: 'shimmer 1.5s infinite'
                         }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Shop content component that uses useSearchParams
function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryFilter = searchParams.get("category") || "";
  const materialFilter = searchParams.get("material") || "";
  const sortOption = searchParams.get("sort") || "name_asc";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productService.getProductCategories();
        setCategories(response.documents as ProductCategory[]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queries = [];

        if (categoryFilter) {
          queries.push(Query.equal("category", categoryFilter));
        }

        if (materialFilter) {
          queries.push(Query.equal("material", materialFilter));
        }

        // Add sorting
        const sortQueries = [];
        if (sortOption === "name_asc") {
          sortQueries.push(Query.orderAsc("name"));
        } else if (sortOption === "name_desc") {
          sortQueries.push(Query.orderDesc("name"));
        } else if (sortOption === "price_asc") {
          sortQueries.push(Query.orderAsc("price"));
        } else if (sortOption === "price_desc") {
          sortQueries.push(Query.orderDesc("price"));
        }

        const response = await productService.getAllProducts(
          queries.length > 0 ? [...queries, ...sortQueries] : sortQueries
        );

        setProducts(response.documents as Product[]);

        // Extract unique materials
        const uniqueMaterials = [...new Set(response.documents.map(p => p.material))];
        setMaterials(uniqueMaterials);
        
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter, materialFilter, sortOption]);

  const applyFilter = (type: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }
    
    router.push(`/shop?${params.toString()}`);
  };
  
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-serif font-medium mb-8">Shop Our Collection</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="lg:w-64">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="font-medium text-lg mb-4">Categories</h2>
            <ul className="space-y-2">
              <li>
                <button
                  className={`text-left w-full ${categoryFilter === "" ? "text-amber-800 font-medium" : "text-gray-700"}`}
                  onClick={() => applyFilter("category", "")}
                >
                  All Categories
                </button>
              </li>
              {categories.map(category => (
                <li key={category.$id}>
                  <button
                    className={`text-left w-full ${categoryFilter === category.$id ? "text-amber-800 font-medium" : "text-gray-700"}`}
                    onClick={() => applyFilter("category", category.$id)}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="font-medium text-lg mb-4">Materials</h2>
            <ul className="space-y-2">
              <li>
                <button
                  className={`text-left w-full ${materialFilter === "" ? "text-amber-800 font-medium" : "text-gray-700"}`}
                  onClick={() => applyFilter("material", "")}
                >
                  All Materials
                </button>
              </li>
              {materials.map(material => (
                <li key={material}>
                  <button
                    className={`text-left w-full ${materialFilter === material ? "text-amber-800 font-medium" : "text-gray-700"}`}
                    onClick={() => applyFilter("material", material)}
                  >
                    {material}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        
        {/* Products grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {isLoading ? 'Loading products...' : `${products.length} products`}
            </p>
            <div className="flex items-center">
              <label htmlFor="sort" className="mr-2 text-gray-700">Sort by:</label>
              <select
                id="sort"
                value={sortOption}
                onChange={(e) => applyFilter("sort", e.target.value)}
                className="border rounded p-2 text-sm"
              >
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <motion.div 
                  key={index} 
                  className="bg-white rounded-lg overflow-hidden shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      duration: 0.5,
                      delay: index * 0.1, // Staggered animation for each card
                    }
                  }}
                >
                  <div className="aspect-square relative bg-gray-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-shimmer" 
                         style={{ 
                           backgroundSize: '200% 100%',
                           animation: 'shimmer 1.5s infinite'
                         }}
                    ></div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded-full w-1/3 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-gray-200 to-gray-300 animate-shimmer" 
                           style={{ 
                             backgroundSize: '200% 100%',
                             animation: 'shimmer 1.5s infinite'
                           }}
                      ></div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded-full w-3/4 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-gray-200 to-gray-300 animate-shimmer" 
                           style={{ 
                             backgroundSize: '200% 100%',
                             animation: 'shimmer 1.5s infinite'
                           }}
                      ></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full w-1/4 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-gray-200 to-gray-300 animate-shimmer" 
                           style={{ 
                             backgroundSize: '200% 100%',
                             animation: 'shimmer 1.5s infinite'
                           }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center p-8 text-red-500">{error}</div>
          ) : products.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-gray-600 mb-4">No products found matching your criteria.</p>
              <button
                onClick={() => {
                  router.push('/shop');
                }}
                className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-900"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <motion.div 
                  key={product.$id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    ease: [0.43, 0.13, 0.23, 0.96] // Custom easing for elegant motion
                  }}
                  whileHover={{ 
                    y: -10, 
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    transition: { duration: 0.3 } 
                  }}
                >
                  <Link href={`/product/${product.slug}`}>
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm transition-all duration-300 h-full">
                      <div className="aspect-square relative overflow-hidden">
                        {product.main_image_url || (product.variation_images && product.variation_images.length > 0) ? (
                          <Image
                            src={(product.main_image_url || product.variation_images?.[0])!}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 ease-out"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{
                              transform: "scale(1.01)"
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <motion.div 
                        className="p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                      >
                        <p className="text-sm text-amber-800 mb-1">
                          {categories.find(c => c.$id === product.category)?.name || 'Unknown Category'}
                        </p>
                        <h3 className="font-medium text-gray-800 mb-2">{product.name}</h3>
                        <p className="text-gray-700">${product.variation_prices ? product.variation_prices[0]?.toFixed(2) : 'N/A'}</p>
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="bg-[#f8f9fa] flex-grow pt-24 pb-16 px-4">
        <Suspense fallback={<ShopLoading />}>
          <ShopContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}