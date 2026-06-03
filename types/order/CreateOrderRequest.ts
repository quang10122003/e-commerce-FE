export interface OrderRequest {
  paymentMethod: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
}

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
}