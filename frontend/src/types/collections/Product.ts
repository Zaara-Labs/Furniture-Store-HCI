import { Models } from "appwrite";

export interface Product extends Models.Document {
  $id: string;
  name: string;
  description: string;
  price: number[];
  category: string;
  imageUrls: string[];
  mainImage: string;
  dim_width: number;
  dim_height: number;
  dim_depth: number;
  width: number;
  material?: string[];
  colors?: string[];
  inStock: boolean;
  stockCount?: number;
  brand?: string;
  featured?: boolean;
  discount?: number;
  ratings?: number;
}

export type ProductCreateInput = Omit<Product, '$id' | 'createdAt' | 'updatedAt'>;
export type ProductUpdateInput = Partial<ProductCreateInput>;