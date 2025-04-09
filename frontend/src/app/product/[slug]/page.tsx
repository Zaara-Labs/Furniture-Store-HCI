"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Client, Databases, Query } from "appwrite";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Initialize Appwrite
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

const databases = new Databases(client);

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;

  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [is3DModelVisible, setIs3DModelVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      setError(null);

      try {
        // Get product by slug
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
          "product",
          [Query.equal("slug", slug)]
        );

        if (response.documents.length === 0) {
          setError("Product not found");
          return;
        }

        const productData = response.documents[0];
        setProduct(productData);
        
        // Get category information
        if (productData.category) {
          const categoryResponse = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
            "category",
            productData.category
          );
          setCategory(categoryResponse);
        }

        // Get related products from same category
        if (productData.category) {
          const relatedResponse = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
            "product",
            [
              Query.equal("category", productData.category),
              Query.notEqual("$id", productData.$id),
              Query.limit(4)
            ]
          );
          setRelatedProducts(relatedResponse.documents);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product information. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock_quantity || 1)) {
      setQuantity(value);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product?.stock_quantity || 1)) {
      setQuantity(quantity + 1);
    }
  };

  const addToCart = () => {
    // This would integrate with your cart system
    // For now just log the action
    console.log(`Added to cart: ${product.name}, quantity: ${quantity}`);
    
    // Here you would typically update a cart context/state
    alert(`${quantity} x ${product.name} added to your cart!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 px-4">
          <div className="container mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/2">
                  <div className="bg-gray-200 aspect-square rounded-lg w-full"></div>
                  <div className="flex gap-2 mt-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-gray-200 w-20 h-20 rounded"></div>
                    ))}
                  </div>
                </div>
                <div className="lg:w-1/2">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>
                  <div className="h-40 bg-gray-200 rounded mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-3xl font-medium mb-4">
              {error || "Product not found"}
            </h1>
            <p className="mb-8 text-gray-600">
              We couldn't find the product you're looking for.
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-amber-800 text-white rounded-md hover:bg-amber-900 transition-colors"
            >
              Return to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Combine main image with additional images for the gallery
  const allImages = [
    product.main_image_url,
    ...(product.additional_image_urls || [])
  ].filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto">
          {/* Breadcrumbs */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-amber-800">
                  Home
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li>
                <Link href="/shop" className="text-gray-500 hover:text-amber-800">
                  Shop
                </Link>
              </li>
              {category && (
                <>
                  <li className="text-gray-500">/</li>
                  <li>
                    <Link 
                      href={`/shop?category=${category.$id}`} 
                      className="text-gray-500 hover:text-amber-800"
                    >
                      {category.name}
                    </Link>
                  </li>
                </>
              )}
              <li className="text-gray-500">/</li>
              <li className="text-gray-800 font-medium">{product.name}</li>
            </ol>
          </nav>
          
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Product Images */}
            <div className="lg:w-1/2">
              <div className="aspect-square relative mb-4 bg-gray-50 rounded-lg overflow-hidden">
                {is3DModelVisible && product.model_3d_url ? (
                  <div className="w-full h-full">
                    <iframe 
                      src={product.model_3d_url} 
                      className="w-full h-full"
                      title={`3D Model of ${product.name}`}
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : allImages.length > 0 ? (
                  <Image 
                    src={allImages[selectedImage]} 
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index);
                      setIs3DModelVisible(false);
                    }}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden 
                      ${!is3DModelVisible && selectedImage === index ? 'ring-2 ring-amber-800' : 'ring-1 ring-gray-200'}`}
                  >
                    <Image 
                      src={image} 
                      alt={`Product view ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
                {product.model_3d_url && (
                  <button
                    onClick={() => setIs3DModelVisible(true)}
                    className={`flex items-center justify-center w-20 h-20 flex-shrink-0 rounded-md 
                      ${is3DModelVisible ? 'ring-2 ring-amber-800 bg-amber-50' : 'ring-1 ring-gray-200 bg-gray-50'}`}
                  >
                    <span className="text-2xl">3D</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Product Details */}
            <div className="lg:w-1/2">
              <p className="text-amber-800 mb-2">
                {category?.name || 'Furniture'}
              </p>
              <h1 className="text-3xl font-serif font-medium mb-4">
                {product.name}
              </h1>
              <p className="text-2xl text-gray-900 mb-6">
                ${product.price.toFixed(2)}
              </p>
              
              <div className="prose prose-amber mb-8">
                <p className="text-gray-700">{product.description}</p>
              </div>
              
              <div className="mb-8">
                <h2 className="font-medium mb-2">Product Details</h2>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-500">Material</span>
                    <span>{product.material}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Dimensions</span>
                    <span>{product.dim_width}W × {product.dim_depth}D × {product.dim_height}H cm</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Weight</span>
                    <span>{product.dim_weight} kg</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">In Stock</span>
                    <span>{product.stock_quantity > 0 ? 'Yes' : 'No'}</span>
                  </li>
                </ul>
              </div>
              
              {product.stock_quantity > 0 ? (
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <span className="mr-4 font-medium">Quantity</span>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button 
                        onClick={decrementQuantity} 
                        className="px-3 py-2 text-amber-800 hover:bg-gray-100"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        min="1" 
                        max={product.stock_quantity} 
                        value={quantity} 
                        onChange={handleQuantityChange}
                        className="w-12 text-center border-0 focus:outline-none"
                      />
                      <button 
                        onClick={incrementQuantity} 
                        className="px-3 py-2 text-amber-800 hover:bg-gray-100"
                        disabled={quantity >= product.stock_quantity}
                      >
                        +
                      </button>
                    </div>
                    <span className="ml-4 text-sm text-gray-500">
                      {product.stock_quantity} available
                    </span>
                  </div>
                  <button 
                    onClick={addToCart}
                    className="w-full py-3 px-6 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              ) : (
                <div className="mb-8">
                  <p className="py-3 px-6 bg-gray-100 text-gray-500 rounded-md text-center font-medium">
                    Out of Stock
                  </p>
                </div>
              )}
              
              {/* Additional action buttons */}
              <div className="flex flex-wrap gap-4">
                <button className="text-gray-700 flex items-center gap-2 hover:text-amber-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-heart" viewBox="0 0 16 16">
                    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                  </svg>
                  Add to Wishlist
                </button>
                <button className="text-gray-700 flex items-center gap-2 hover:text-amber-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-share" viewBox="0 0 16 16">
                    <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </div>
          
          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-serif font-medium mb-8">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct.$id} href={`/product/${relatedProduct.slug}`}>
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-square relative">
                        {relatedProduct.main_image_url ? (
                          <Image 
                            src={relatedProduct.main_image_url} 
                            alt={relatedProduct.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-800 mb-2">{relatedProduct.name}</h3>
                        <p className="text-gray-700">${relatedProduct.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}