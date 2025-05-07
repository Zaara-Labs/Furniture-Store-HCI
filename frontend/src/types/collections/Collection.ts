import { Models } from "appwrite";

export interface Collection extends Models.Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  featured?: boolean;
  products?: string[]; // References to product IDs in this collection
}