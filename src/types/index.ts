export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
}

export interface Service {
  id: string;
  name: string;
  description: string;
  pricePerCloth: {
    shirt: number;
    pant: number;
    dress: number;
    jacket: number;
  };
}

export interface ClothQuantity {
  shirt: number;
  pant: number;
  dress: number;
  jacket: number;
}

export interface LaundryRequest {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  clothes: ClothQuantity;
  totalCost: number;
  status: OrderStatus;
  notes?: string;
  timestamps: {
    placedAt: Date;
    acceptedAt?: Date;
    pickedUpAt?: Date;
    washingAt?: Date;
    ironingAt?: Date;
    packingAt?: Date;
    outForDeliveryAt?: Date;
    deliveredAt?: Date;
  };
}

export type OrderStatus = 
  | 'placed' 
  | 'accepted' 
  | 'picked-up' 
  | 'washing' 
  | 'ironing' 
  | 'packing' 
  | 'out-for-delivery' 
  | 'delivered' 
  | 'rejected';

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'placed',
  'accepted', 
  'picked-up',
  'washing',
  'ironing',
  'packing',
  'out-for-delivery',
  'delivered'
];

export const STATUS_LABELS = {
  'placed': 'Order Placed',
  'accepted': 'Order Accepted',
  'picked-up': 'Picked Up',
  'washing': 'Washing',
  'ironing': 'Ironing',
  'packing': 'Packing',
  'out-for-delivery': 'Out for Delivery',
  'delivered': 'Delivered',
  'rejected': 'Rejected'
};