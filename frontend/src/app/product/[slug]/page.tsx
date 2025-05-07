"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Query } from "appwrite";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import { productService, databases } from "@/services/appwrite";
import { configService } from "@/services/configService";
import dynamic from "next/dynamic";
import { Product } from "@/types/collections/Product";
import { ProductCategory } from "@/types/collections/ProductCategory";
import AddToCartButton from "@/components/cart/AddToCartButton";
import CartNotification from "@/app/cart/CartNotification";  // Add import for CartNotification
import WishlistButton from "@/components/wishlist/WishlistButton";

// Extend Window interface to include our custom property
declare global {
  interface Window {
    productVariationTextures?: string[];
  }
}

// Dynamically load the ThreeJSModelViewer component with no SSR
const ThreeJSModelViewer = dynamic(
  () => import("@/components/ThreeJSModelViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-amber-800 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500">Loading 3D Model...</p>
        </div>
      </div>
    ),
  }
);

export default function ProductPage() {
  const params = useParams();
  const { slug } = params;
  const router = useRouter();
  const cartContext = useCart();  // Store the entire cart context
  const { addToCart } = cartContext;  // Then destructure what you need

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [is3DModelVisible, setIs3DModelVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  // New state for product variations
  const [selectedVariation, setSelectedVariation] = useState(0);

  // Add new state for navigation to cart after adding
  const [navigateToCart, setNavigateToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      setIsLoading(true);
      setError(null);

      try {
        // Get product by slug
        const productData: Product | null = await productService.getProductBySlug(
          (slug as string).toLowerCase()
        );

        if (!productData) {
          setError("Product not found");
          return;
        }

        setProduct(productData);
        // Reset state when product changes
        setQuantity(1);
        setSelectedVariation(0);

        // Get category information
        if (productData.category) {
          try {
            const categoryResponse: ProductCategory = await databases.getDocument(
              configService.getDatabaseId(),
              configService.getCollectionId("product_category"),
              productData.category
            );
            setCategory(categoryResponse);
          } catch (categoryError) {
            console.error("Error fetching category:", categoryError);
          }
        }

        // Get related products from same category
        if (productData.category) {
          try {
            const relatedResponse = await databases.listDocuments(
              configService.getDatabaseId(),
              configService.getCollectionId("product"),
              [
                Query.equal("category", productData.category),
                Query.notEqual("$id", productData.$id),
                Query.limit(4),
              ]
            );
            setRelatedProducts(relatedResponse.documents as Product[]);
          } catch (relatedError) {
            console.error("Error fetching related products:", relatedError);
          }
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

  useEffect(() => {
    // Make texture URLs available for the ThreeJSModelViewer component
    if (product?.variation_texture_urls) {
      // Create a global property to pass data to the ThreeJSModelViewer
      window.productVariationTextures = product.variation_texture_urls;
      
      return () => {
        // Cleanup when component unmounts
        delete window.productVariationTextures;
      };
    }
  }, [product]);

  // Update selected image when variation changes to show the corresponding variation image
  useEffect(() => {
    if (product?.variation_images && product.variation_images[selectedVariation]) {
      // Find the index of the variation image in the allImages array
      const allImages = [
        product.main_image_url,
        ...(product.additional_image_urls || []),
        ...(product.variation_images || []),
      ].filter(Boolean);
      
      const variationImageIndex = allImages.indexOf(product.variation_images[selectedVariation]);
      if (variationImageIndex !== -1) {
        setSelectedImage(variationImageIndex);
      }
    }
  }, [selectedVariation, product]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Debugging log to check product stock quantity
  useEffect(() => {
    if (product) {
      console.log("Product stock quantity:", product.stock_quantity);
    }
  }, [product]);

  // Handle direct "Buy Now" functionality
  const handleBuyNow = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      // Get the correct price based on selected variation
      const price = product.variation_prices 
        ? product.variation_prices[selectedVariation]
        : (Array.isArray(product.price) ? product.price[selectedVariation] : product.price);
      
      // Add to cart
      await addToCart({
        productId: product.$id,
        name: product.name,
        price: price,
        quantity: quantity,
        image: product.main_image_url || ""
      });
      
      // Navigate to cart page
      router.push('/cart');
    } catch (error) {
      console.error("Error during Buy Now:", error);
      toast.error("Failed to process. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle successful add to cart with optional navigation
  const handleAddToCartSuccess = () => {
    if (navigateToCart) {
      router.push('/cart');
      setNavigateToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="bg-[#f8f9fa] flex-grow pt-24 pb-16 px-4">
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
        <main className="bg-[#f8f9fa] flex-grow pt-24 pb-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-3xl font-medium mb-4">
              {error || "Product not found"}
            </h1>
            <p className="mb-8 text-gray-600">
              We couldn&apos;t find the product you&apos;re looking for.
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

  // Combine main image with additional images and variation images for the gallery
  const allImages = [
    product.main_image_url,
    ...(product.additional_image_urls || []),
    ...(product.variation_images || []),
  ].filter(Boolean);

  // Get the correct price based on selected variation
  const currentPrice = product.variation_prices ? 
    product.variation_prices[selectedVariation] : 
    (Array.isArray(product.price) ? product.price[selectedVariation] : product.price);

  // Create a product object with the selected variation
  const productWithVariation = {
    ...product,
    price: currentPrice
  };

  // Set a default stock quantity if it's not defined
  // This ensures products without explicit stock_quantity can still be added to cart
  const stockQuantity = product.stock_quantity !== undefined ? product.stock_quantity : 10;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="bg-[#f8f9fa] flex-grow pt-24 pb-16 px-4">
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
                <Link
                  href="/shop"
                  className="text-gray-500 hover:text-amber-800"
                >
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
                {allImages.length > 0 ? (
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
                      ${
                        !is3DModelVisible && selectedImage === index
                          ? "ring-2 ring-amber-800"
                          : "ring-1 ring-gray-200"
                      }`}
                  >
                    <Image
                      src={image}
                      alt={`Product view ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:w-1/2">
              <p className="text-amber-800 mb-2">
                {category?.name || "Furniture"}
              </p>
              <h1 className="text-3xl font-serif font-medium mb-4">
                {product.name}
              </h1>
              <p className="text-2xl text-gray-900 mb-6">
                ${currentPrice?.toFixed(2) || "N/A"}
              </p>

              <div className="prose prose-amber mb-8">
                <p className="text-gray-700">{product.description}</p>
              </div>

              {/* Product Variations with Color */}
              {product.variation_names && product.variation_names.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-medium mb-3">Available Options</h2>
                  <div className="flex flex-wrap gap-3">
                    {product.variation_names.map((name, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedVariation(index);
                          // Show the corresponding variation image if available
                          if (product.variation_images && product.variation_images[index]) {
                            const variationImageIndex = allImages.indexOf(product.variation_images[index]);
                            if (variationImageIndex !== -1) {
                              setSelectedImage(variationImageIndex);
                            }
                          }
                        }}
                        className={`flex items-center py-2 px-4 rounded-md border ${
                          selectedVariation === index
                            ? "border-amber-800 bg-amber-50"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {product.variation_color_codes && product.variation_color_codes[index] && (
                          <span
                            className="w-4 h-4 rounded-full mr-2 flex-shrink-0"
                            style={{ backgroundColor: `#${product.variation_color_codes[index]}` }}
                          ></span>
                        )}
                        <span>{name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Always show the quantity selector and Add to Cart button, 
                  unless we explicitly know the product is out of stock */}
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
                      max={stockQuantity}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-12 text-center border-0 focus:outline-none"
                    />
                    <button
                      onClick={incrementQuantity}
                      className="px-3 py-2 text-amber-800 hover:bg-gray-100"
                      disabled={quantity >= stockQuantity}
                    >
                      +
                    </button>
                  </div>
                  <span className="ml-4 text-sm text-gray-500">
                    {stockQuantity} available
                  </span>
                </div>
                
                {/* Add to Cart and Buy Now buttons */}
                {stockQuantity > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AddToCartButton 
                      product={{
                        ...product,
                        price: currentPrice
                      }}
                      quantity={quantity}
                      className="w-full py-3 px-6"
                      size="lg"
                      onSuccess={handleAddToCartSuccess}
                    />
                    <button
                      onClick={handleBuyNow}
                      disabled={addingToCart}
                      className="w-full py-3 px-6 bg-amber-700 text-white font-medium rounded-md hover:bg-amber-800 transition-colors disabled:opacity-70 flex items-center justify-center"
                    >
                      {addingToCart ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        "Buy Now"
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="py-3 px-6 bg-gray-100 text-gray-500 rounded-md text-center font-medium">
                    Out of Stock
                  </p>
                )}
                
                {/* Optional: View Cart Button that appears briefly after adding to cart */}
                {cartContext.cartCount > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Link 
                      href="/cart"
                      className="text-amber-800 hover:underline flex items-center text-sm"
                    >
                      View Cart ({cartContext.cartCount} items)
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>

              {/* Try in Room Designer Button */}
              {product.model_3d_url && (
                <div className="mb-8">
                  <Link 
                    href={`/room-designer?productId=${product.$id}`}
                    className="w-full py-3 px-6 bg-white text-amber-800 border border-amber-800 font-medium rounded-md hover:bg-amber-50 transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Try in Room Designer
                  </Link>
                </div>
              )}

              {/* Additional action buttons */}
              <div className="flex flex-wrap gap-4">
                <WishlistButton 
                  product={{
                    ...product,
                    // Ensure we're passing the current price to the WishlistButton
                    price: currentPrice
                  }}
                  variant="icon-only"
                  className="text-gray-700 flex items-center gap-2 hover:text-amber-800"
                  showText={true} 
                />
                <button className="text-gray-700 flex items-center gap-2 hover:text-amber-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-share"
                    viewBox="0 0 16 16"
                  >
                    <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* 3D Model Viewer Section */}
          {product.model_3d_url && (
            <div className="mt-16 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-serif font-medium mb-6">
                View Product in 3D
              </h2>
              <p className="text-gray-700 mb-6">
                Rotate, zoom, and explore this product in 3D to get a better
                understanding of its design and proportions. Use your mouse to
                rotate the model and the scroll wheel to zoom.
              </p>
              <div className="aspect-[16/9] w-full bg-gray-50 rounded-lg overflow-hidden">
                <ThreeJSModelViewer 
                  modelPath={product.model_3d_url}
                  textureUrls={product.variation_texture_urls}
                  textureNames={product.variation_names}
                  colorCodes={product.variation_color_codes}
                />
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Note: The 3D model is a representation and may slightly differ
                from the actual product.
              </p>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-serif font-medium mb-8">
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <div key={relatedProduct.$id} className="relative group">
                    <Link
                      href={`/product/${relatedProduct.slug}`}
                      className="block"
                    >
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
                          <h3 className="font-medium text-gray-800 mb-2 truncate">
                            {relatedProduct.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-700">
                              ${relatedProduct.price[0].toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Add wishlist button to the related products as well */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <WishlistButton
                        product={relatedProduct}
                        variant="icon-only"
                        size="sm"
                        showText={false}
                      />
                    </div>
                    
                    {/* Quick add to cart button - Make sure it's always visible on hover */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <AddToCartButton
                        product={relatedProduct}
                        variant="default"
                        size="sm" 
                        showText={false}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Add the CartNotification component */}
      <CartNotification />

      <Footer />
    </div>
  );
}
