export interface Product {
  id?: number;
  categoryId: number;
  title: string;
  image: string; // Base64 encoded image
  price: number;
  count: number;
}
