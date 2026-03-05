export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  banner_image: string;
  map_image: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type LocationType = 'pista' | 'vip' | 'camarote' | 'bistro';

export interface TicketLocation {
  id: string;
  event_id: string;
  location_type: LocationType;
  name: string;
  description: string;
  price: number;
  quantity: number;
  available_quantity: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Order {
  id: string;
  event_id: string;
  user_id: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  ticket_location_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
}
