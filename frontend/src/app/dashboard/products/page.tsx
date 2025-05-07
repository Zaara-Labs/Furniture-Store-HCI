"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RoleBasedRoute from '@/components/auth/RoleBasedRoute';
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/services/appwrite';
import { Product } from '@/types/collections/Product';

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push('/auth/login?redirect=/dashboard/products');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await productService.getAllProducts();
        setProducts(response.documents as Product[]);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    router.push('/dashboard/products/new');
  };

  const getModelStatusColor = (hasModel: boolean) => {
    return hasModel ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-red-500';
  };

  return (
    <RoleBasedRoute allowedRoles={['designer']}>
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
              <p className="text-gray-600 mt-1">Manage your furniture products catalog</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-amber-700' : 'text-gray-500'}`}
                  aria-label="Grid View"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-amber-700' : 'text-gray-500'}`}
                  aria-label="List View"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </button>
              </div>
              <button 
                onClick={handleAddProduct}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium rounded-lg shadow-md flex items-center transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Product
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-600 p-5 rounded-md shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-10 text-center">
                  <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-amber-50 mb-6">
                    <svg className="h-12 w-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6">Add your first furniture product to get started with your catalog.</p>
                  <button 
                    onClick={handleAddProduct}
                    className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-medium rounded-lg shadow-sm inline-flex items-center transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create First Product
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div 
                      key={product.$id} 
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
                    >
                      <div className="h-48 w-full relative bg-gray-50">
                        {product.main_image_url || (product.variation_images && product.variation_images.length > 0) ? (
                          <Image
                            src={product.main_image_url || product.variation_images?.[0] || '/placeholder-image.jpg'}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className={`absolute top-3 right-3 h-3 w-3 rounded-full ${getModelStatusColor(!!product.model_3d_url)} shadow-lg ring-2 ring-white`} />
                      </div>
                      
                      <div className="p-5">
                        <div className="mb-3">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
                          <p className="text-sm text-gray-500 truncate">{product.slug}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-5">
                          {product.category && (
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                              {product.category}
                            </span>
                          )}
                          {product.material && (
                            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-medium">
                              {product.material}
                            </span>
                          )}
                          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-medium">
                            {product.variation_count || 1} Variation{(product.variation_count || 1) !== 1 ? 's' : ''}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-md font-medium ${product.model_3d_url ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            3D Model {product.model_3d_url ? 'Available' : 'Missing'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Link 
                            href={`/dashboard/products/edit/${product.$id}`} 
                            className="text-amber-700 hover:text-amber-900 inline-flex items-center group"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span className="border-b border-transparent group-hover:border-current">Edit</span>
                          </Link>
                          <Link 
                            href={`/product/${product.slug}`} 
                            className="text-blue-600 hover:text-blue-800 inline-flex items-center group"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="border-b border-transparent group-hover:border-current">View</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Category & Material
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Variations
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            3D Model
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {products.map((product) => (
                          <tr key={product.$id} className="hover:bg-amber-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {product.main_image_url || (product.variation_images && product.variation_images.length > 0) ? (
                                  <div className="flex-shrink-0 h-12 w-12 relative rounded-md overflow-hidden shadow-sm">
                                    <Image
                                      src={product.main_image_url || product.variation_images?.[0] || '/placeholder-image.jpg'}
                                      alt={product.name}
                                      fill
                                      sizes="48px"
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center shadow-sm">
                                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {product.slug}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col space-y-1">
                                {product.category && (
                                  <span className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium w-fit">
                                    {product.category}
                                  </span>
                                )}
                                {product.material && (
                                  <span className="inline-flex items-center text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-medium w-fit">
                                    {product.material}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md font-medium">
                                {product.variation_count || 1}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${product.model_3d_url ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                  <span className={`inline-block h-2 w-2 rounded-full ${getModelStatusColor(!!product.model_3d_url)}`}></span>
                                  {product.model_3d_url ? 'Available' : 'Missing'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              <div className="flex items-center space-x-3">
                                <Link 
                                  href={`/dashboard/products/edit/${product.$id}`} 
                                  className="text-amber-700 hover:text-amber-900 inline-flex items-center group"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                  Edit
                                </Link>
                                <Link 
                                  href={`/product/${product.slug}`} 
                                  className="text-blue-600 hover:text-blue-800 inline-flex items-center group"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </RoleBasedRoute>
  );
}