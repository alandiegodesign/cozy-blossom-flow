import { Order, OrderItem } from '@/types/models';
import { getItems, setItems, generateId, now } from './storage';
import { decreaseAvailability } from './ticketLocationService';

const ORDERS_KEY = 'ticketapp_orders';
const ITEMS_KEY = 'ticketapp_order_items';

export function getOrders(): Order[] {
  return getItems<Order>(ORDERS_KEY);
}

export function getOrdersByUser(userId: string): Order[] {
  return getOrders().filter(o => o.user_id === userId);
}

export function getOrder(id: string): Order | undefined {
  return getOrders().find(o => o.id === id);
}

export function getOrderItems(orderId: string): OrderItem[] {
  return getItems<OrderItem>(ITEMS_KEY).filter(i => i.order_id === orderId);
}

export interface CartItem {
  ticket_location_id: string;
  quantity: number;
  unit_price: number;
}

export function createOrder(eventId: string, userId: string, items: CartItem[]): Order | null {
  // Decrease availability
  for (const item of items) {
    if (!decreaseAvailability(item.ticket_location_id, item.quantity)) {
      return null;
    }
  }

  const orderId = generateId();
  const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

  const order: Order = {
    id: orderId,
    event_id: eventId,
    user_id: userId,
    total_amount: totalAmount,
    status: 'confirmed',
    created_at: now(),
    updated_at: now(),
  };

  const orderItems: OrderItem[] = items.map(item => ({
    id: generateId(),
    order_id: orderId,
    ticket_location_id: item.ticket_location_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.quantity * item.unit_price,
    created_at: now(),
    updated_at: now(),
  }));

  const allOrders = getOrders();
  setItems(ORDERS_KEY, [...allOrders, order]);

  const allItems = getItems<OrderItem>(ITEMS_KEY);
  setItems(ITEMS_KEY, [...allItems, ...orderItems]);

  return order;
}

export function updateOrderStatus(id: string, status: Order['status']): void {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx !== -1) {
    orders[idx].status = status;
    orders[idx].updated_at = now();
    setItems(ORDERS_KEY, orders);
  }
}
