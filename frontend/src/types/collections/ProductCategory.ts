import { Models } from "appwrite";

export interface ProductCategory extends Models.Document {
  name: string;
  description?: string;
  image?: string;
  slug: string;
}