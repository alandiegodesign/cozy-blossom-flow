import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { decreaseAvailability } from './ticketLocationService';

export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;

export interface CartItem {
  ticket_location_id: string;
  quantity: number;
  unit_price: number;
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);
  if (error) throw error;
  return data || [];
}

export async function createOrder(
  eventId: string,
  userId: string,
  items: CartItem[]
): Promise<Order | null> {
  // Decrease availability for each item
  for (const item of items) {
    const success = await decreaseAvailability(item.ticket_location_id, item.quantity);
    if (!success) return null;
  }

  const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      event_id: eventId,
      user_id: userId,
      total_amount: totalAmount,
      status: 'confirmed',
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    ticket_location_id: item.ticket_location_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.quantity * item.unit_price,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;

  return order;
}
