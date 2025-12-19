export type OrderStatus = 'PENDING' | 'FINALIZED';

export interface OrderItem {
  id?: number;
  productId: number;
  productTitle: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  companyId: number;
  clientName: string;
  clientCompany?: string;
  clientAddress: string;
  clientCity: string;
  clientPostalCode: string;
  clientPhone: string;
  clientEmail?: string;
  notes?: string;
  status: OrderStatus;
  createdAt: string;
  finalizedAt?: string;
  totalItems: number;
  totalAmount: number;
  invoiceNumber?: string;
  items: OrderItem[];
}

export interface CreateOrderDTO {
  clientName: string;
  clientCompany?: string;
  clientAddress: string;
  clientCity: string;
  clientPostalCode: string;
  clientPhone: string;
  clientEmail?: string;
  notes?: string;
  items: { productId: number; quantity: number }[];
}

export interface CartItem {
  productId: number;
  productTitle: string;
  productImage?: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number; // Available stock
}
