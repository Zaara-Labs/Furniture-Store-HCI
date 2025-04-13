import { Models } from "appwrite";

export interface Product extends Models.Document {
  $id: string;
  name: string;
  description: string;
  material: string;
  category: string;
  dim_width: number;
  dim_height: number;
  dim_depth: number;
  weight?: number;
  slug?: string;
  main_image_url?: string;
  variation_count?: number;
  variation_names?: string[];
  variation_images?: string[];
  variation_prices?: number[];
  variation_color_codes?: string[];
  variation_texture_urls?: string[];
  variation_stock_quantity?: number;
  model_3d_url?: string;
}

export type ProductCreateInput = Omit<Product, '$id' | 'createdAt' | 'updatedAt'>;
export type ProductUpdateInput = Partial<ProductCreateInput>;