"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RoleBasedRoute from '@/components/auth/RoleBasedRoute';
import { productService } from '@/services/appwrite';
import { ProductCreateInput } from '@/types/collections/Product';

// Define the form data type
type ProductFormData = {
  name: string;
  description: string;
  material: string;
  category: string;
  dim_width: number;
  dim_height: number;
  dim_depth: number;
  dim_sku: 'm' | 'cm' | 'in' | 'ft';
  weight: number;
  main_image_file?: FileList; // For file upload handling
  model_3d_file?: FileList; // For 3D model upload handling
  variations: {
    name: string;
    price: number;
    color_code: string;
    stock_quantity: number;
    image_file?: FileList; // For variation image uploads
    texture_file?: FileList; // For variation texture uploads
  }[];
};

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<{$id: string, name: string}[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize form with react-hook-form
  const { 
    register, 
    control, 
    handleSubmit, 
    formState: { errors }, 
    setValue, 
    watch 
  } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      material: '',
      category: '',
      dim_width: 0,
      dim_height: 0,
      dim_depth: 0,
      dim_sku: 'm',
      weight: 0,
      variations: [{ name: '', price: 0, color_code: '#000000', stock_quantity: 0 }]
    }
  });
  
  // Use fieldArray to handle dynamic variations
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variations",
  });

  // For slug generation
  const productName = watch('name');
  
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await productService.getProductCategories();
        setCategories(response.documents as {$id: string, name: string}[]);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load product categories');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Generate slug from product name
  const generateSlug = (name: string): string => {
    return name.toLowerCase()
      .replace(/[^\w\s-]/g, '')  // Remove special characters
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-');      // Replace multiple hyphens with single hyphen
  };

  // Handle main image preview
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    
    try {
      // Create loading toast
      const loadingToast = toast.loading('Creating product...');
      
      // Generate slug from name
      const slug = generateSlug(data.name);
      
      // Upload main product image if provided
      let mainImageUrl;
      if (data.main_image_file && data.main_image_file[0]) {
        mainImageUrl = await productService.uploadProductImage(data.main_image_file[0]);
      }
      
      // Upload 3D model if provided
      let modelUrl;
      if (data.model_3d_file && data.model_3d_file[0]) {
        modelUrl = await productService.uploadProductModel(data.model_3d_file[0]);
      }
      
      // Process variations
      const variationNames: string[] = [];
      const variationPrices: number[] = [];
      const variationColorCodes: string[] = [];
      const variationStockQuantities: number[] = [];
      const variationImages: string[] = [];
      const variationTextures: string[] = [];
      
      // Upload variation images and prepare variation data
      await Promise.all(data.variations.map(async (variation, index) => {
        variationNames.push(variation.name);
        variationPrices.push(variation.price);
        variationColorCodes.push(variation.color_code);
        variationStockQuantities.push(variation.stock_quantity);
        
        if (variation.image_file && variation.image_file[0]) {
          const imageUrl = await productService.uploadProductImage(variation.image_file[0]);
          variationImages[index] = imageUrl;
        }
        
        if (variation.texture_file && variation.texture_file[0]) {
          const textureUrl = await productService.uploadProductImage(variation.texture_file[0]);
          variationTextures[index] = textureUrl;
        }
      }));
      
      // Prepare product data
      const productData: ProductCreateInput = {
        name: data.name,
        description: data.description,
        material: data.material,
        category: data.category,
        dim_width: Number(data.dim_width),
        dim_height: Number(data.dim_height),
        dim_depth: Number(data.dim_depth),
        dim_sku: data.dim_sku,
        weight: Number(data.weight),
        slug,
        variation_count: data.variations.length,
        main_image_url: mainImageUrl,
        model_3d_url: modelUrl,
        variation_names: variationNames,
        variation_prices: variationPrices,
        variation_color_codes: variationColorCodes,
        variation_stock_quantity: variationStockQuantities,
        variation_images: variationImages.length > 0 ? variationImages : undefined,
        variation_texture_urls: variationTextures.length > 0 ? variationTextures : undefined,
      };
      
      // Create the product
      await productService.createProduct(productData);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Product created successfully!');
      
      // Redirect to products page
      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper components
  const FormSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const FormField = ({ 
    label, 
    error, 
    children 
  }: { 
    label: string, 
    error?: string, 
    children: React.ReactNode 
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );

  return (
    <RoleBasedRoute allowedRoles={['designer']}>
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Add New Product</h1>
              <p className="text-gray-600 mt-1">Create a new product with variations</p>
            </div>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-2 space-y-6">
                <FormSection title="Basic Information">
                  <FormField 
                    label="Product Name" 
                    error={errors.name?.message}
                  >
                    <input
                      {...register("name", { 
                        required: "Product name is required",
                        maxLength: {
                          value: 200,
                          message: "Product name cannot exceed 200 characters"
                        }
                      })}
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Enter product name"
                    />
                  </FormField>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField 
                      label="Material" 
                      error={errors.material?.message}
                    >
                      <input
                        {...register("material", { 
                          required: "Material is required",
                          maxLength: {
                            value: 80,
                            message: "Material name cannot exceed 80 characters"
                          }
                        })}
                        type="text"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Wood, Metal, etc."
                      />
                    </FormField>
                    
                    <FormField 
                      label="Category" 
                      error={errors.category?.message}
                    >
                      <select
                        {...register("category", { 
                          required: "Category is required" 
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.$id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                  
                  <FormField 
                    label="Description" 
                    error={errors.description?.message}
                  >
                    <textarea
                      {...register("description", { 
                        required: "Description is required",
                        maxLength: {
                          value: 1000,
                          message: "Description cannot exceed 1000 characters"
                        }
                      })}
                      rows={4}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Describe the product..."
                    ></textarea>
                  </FormField>
                </FormSection>

                <FormSection title="Dimensions & Weight">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField 
                      label="Width" 
                      error={errors.dim_width?.message}
                    >
                      <input
                        {...register("dim_width", { 
                          required: "Width is required",
                          min: {
                            value: 0,
                            message: "Width must be positive"
                          }
                        })}
                        type="number"
                        step="0.01"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        placeholder="0.0"
                      />
                    </FormField>
                    
                    <FormField 
                      label="Height" 
                      error={errors.dim_height?.message}
                    >
                      <input
                        {...register("dim_height", { 
                          required: "Height is required",
                          min: {
                            value: 0,
                            message: "Height must be positive"
                          }
                        })}
                        type="number"
                        step="0.01"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        placeholder="0.0"
                      />
                    </FormField>
                    
                    <FormField 
                      label="Depth" 
                      error={errors.dim_depth?.message}
                    >
                      <input
                        {...register("dim_depth", { 
                          required: "Depth is required",
                          min: {
                            value: 0,
                            message: "Depth must be positive"
                          }
                        })}
                        type="number"
                        step="0.01"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        placeholder="0.0"
                      />
                    </FormField>
                    
                    <FormField 
                      label="Unit" 
                      error={errors.dim_sku?.message}
                    >
                      <select
                        {...register("dim_sku")}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="m">Meters (m)</option>
                        <option value="cm">Centimeters (cm)</option>
                        <option value="in">Inches (in)</option>
                        <option value="ft">Feet (ft)</option>
                      </select>
                    </FormField>
                  </div>
                  
                  <FormField 
                    label="Weight (kg)" 
                    error={errors.weight?.message}
                  >
                    <input
                      {...register("weight", { 
                        required: "Weight is required",
                        min: {
                          value: 0,
                          message: "Weight must be positive"
                        }
                      })}
                      type="number"
                      step="0.01"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      placeholder="0.0"
                    />
                  </FormField>
                </FormSection>

                <FormSection title="Product Variations">
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div 
                        key={field.id} 
                        className="p-4 border border-gray-200 rounded-md relative"
                      >
                        <h4 className="font-medium text-gray-700 mb-3">Variation {index + 1}</h4>
                        
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="absolute top-3 right-3 text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField label="Variation Name">
                            <input
                              {...register(`variations.${index}.name` as const)}
                              type="text"
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                              placeholder="e.g., Oak, Walnut, etc."
                            />
                          </FormField>
                          
                          <FormField label="Price">
                            <input
                              {...register(`variations.${index}.price` as const, {
                                valueAsNumber: true,
                                min: 0
                              })}
                              type="number"
                              step="0.01"
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                              placeholder="0.00"
                            />
                          </FormField>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <FormField label="Color Code">
                            <div className="flex items-center">
                              <Controller
                                name={`variations.${index}.color_code` as const}
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type="color"
                                    className="h-10 w-10 rounded border border-gray-300 mr-2"
                                  />
                                )}
                              />
                              <input
                                {...register(`variations.${index}.color_code` as const)}
                                type="text"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                placeholder="#000000"
                              />
                            </div>
                          </FormField>
                          
                          <FormField label="Stock Quantity">
                            <input
                              {...register(`variations.${index}.stock_quantity` as const, {
                                valueAsNumber: true,
                                min: 0
                              })}
                              type="number"
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                              placeholder="0"
                            />
                          </FormField>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <FormField label="Variation Image">
                            <input
                              {...register(`variations.${index}.image_file` as const)}
                              type="file"
                              accept="image/*"
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                            />
                          </FormField>
                          
                          <FormField label="Texture Image">
                            <input
                              {...register(`variations.${index}.texture_file` as const)}
                              type="file"
                              accept="image/*"
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                            />
                          </FormField>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => append({ 
                        name: '', 
                        price: 0, 
                        color_code: '#000000', 
                        stock_quantity: 0 
                      })}
                      className="w-full py-2 px-4 border border-dashed border-amber-300 rounded-md text-amber-700 hover:bg-amber-50 hover:border-amber-400 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Another Variation
                    </button>
                  </div>
                </FormSection>
              </div>

              {/* Right Column - Media & Preview */}
              <div className="lg:col-span-1 space-y-6">
                <FormSection title="Product Media">
                  <FormField 
                    label="Main Product Image" 
                    error={errors.main_image_file?.message}
                  >
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      {mainImagePreview ? (
                        <div className="space-y-1 text-center">
                          <div className="relative h-40 w-40 mx-auto">
                            <Image
                              src={mainImagePreview}
                              alt="Preview"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div className="flex justify-center text-sm text-gray-600">
                            <label
                              htmlFor="main-image-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500"
                            >
                              <span>Change image</span>
                              <input
                                {...register("main_image_file")}
                                id="main-image-upload"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={handleMainImageChange}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="main-image-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500"
                            >
                              <span>Upload an image</span>
                              <input
                                {...register("main_image_file")}
                                id="main-image-upload"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={handleMainImageChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </FormField>
                  
                  <FormField 
                    label="3D Model File" 
                    error={errors.model_3d_file?.message}
                  >
                    <input
                      {...register("model_3d_file")}
                      type="file"
                      accept=".glb,.gltf,.obj"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: GLB, GLTF, OBJ
                    </p>
                  </FormField>
                </FormSection>

                <FormSection title="Preview & Details">
                  <div className="space-y-4">
                    {productName && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Generated Slug:</h4>
                        <div className="mt-1 text-sm font-mono bg-gray-50 p-2 rounded border border-gray-200">
                          {generateSlug(productName)}
                        </div>
                      </div>
                    )}
                  </div>
                </FormSection>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-amber-700 hover:to-amber-800'}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Product...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </RoleBasedRoute>
  );
}