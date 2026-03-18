import { MOCK_ORDERS, MOCK_ORDER_ITEMS, MOCK_USERS, MOCK_TICKET_LOCATIONS, MockOrder, MockOrderItem, generateId, generateValidationCode } from '@/mock/data';
import { decreaseAvailability } from './ticketLocationService';

export type Order = MockOrder;
export type OrderItem = MockOrderItem;

export interface CartItem {
  ticket_location_id: string;
  quantity: number;
  unit_price: number;
}

export interface ProducerSaleRow {
  order_id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  buyer_id: string;
  order_status: string;
  total_amount: number;
  order_created_at: string;
  item_id: string;
  location_name: string;
  location_type: string;
  item_quantity: number;
  item_unit_price: number;
  item_subtotal: number;
}

export interface ProducerTicketRow {
  order_id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  buyer_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_cpf: string;
  order_status: string;
  validated_at: string | null;
  total_amount: number;
  order_created_at: string;
  order_updated_at: string;
  item_id: string;
  location_name: string;
  location_type: string;
  item_quantity: number;
  item_unit_price: number;
  item_subtotal: number;
}

// In-memory stores
let orders = [...MOCK_ORDERS];
let orderItems = [...MOCK_ORDER_ITEMS];

// Import events for lookups
import { MOCK_EVENTS } from '@/mock/data';

export async function getProducerSales(userId: string): Promise<ProducerSaleRow[]> {
  const producerEvents = MOCK_EVENTS.filter(e => e.created_by === userId);
  const rows: ProducerSaleRow[] = [];
  for (const evt of producerEvents) {
    const evtOrders = orders.filter(o => o.event_id === evt.id && o.status === 'confirmed');
    for (const ord of evtOrders) {
      const items = orderItems.filter(oi => oi.order_id === ord.id);
      for (const item of items) {
        const loc = MOCK_TICKET_LOCATIONS.find(l => l.id === item.ticket_location_id);
        rows.push({
          order_id: ord.id,
          event_id: evt.id,
          event_title: evt.title,
          event_date: evt.date,
          buyer_id: ord.user_id,
          order_status: ord.status,
          total_amount: ord.total_amount,
          order_created_at: ord.created_at,
          item_id: item.id,
          location_name: loc?.name || '—',
          location_type: loc?.location_type || 'pista',
          item_quantity: item.quantity,
          item_unit_price: item.unit_price,
          item_subtotal: item.subtotal,
        });
      }
    }
  }
  return rows;
}

export async function getProducerTickets(userId: string): Promise<ProducerTicketRow[]> {
  const producerEvents = MOCK_EVENTS.filter(e => e.created_by === userId);
  const rows: ProducerTicketRow[] = [];
  for (const evt of producerEvents) {
    const evtOrders = orders.filter(o => o.event_id === evt.id);
    for (const ord of evtOrders) {
      const items = orderItems.filter(oi => oi.order_id === ord.id);
      const buyer = Object.values(MOCK_USERS).find(u => u.profile.user_id === ord.user_id);
      for (const item of items) {
        const loc = MOCK_TICKET_LOCATIONS.find(l => l.id === item.ticket_location_id);
        rows.push({
          order_id: ord.id,
          event_id: evt.id,
          event_title: evt.title,
          event_date: evt.date,
          buyer_id: ord.user_id,
          buyer_name: buyer?.profile.name || '—',
          buyer_email: buyer?.email || '—',
          buyer_phone: buyer?.profile.phone || '—',
          buyer_cpf: buyer?.profile.cpf || '—',
          order_status: ord.status,
          validated_at: ord.validated_at,
          total_amount: ord.total_amount,
          order_created_at: ord.created_at,
          order_updated_at: ord.updated_at,
          item_id: item.id,
          location_name: loc?.name || '—',
          location_type: loc?.location_type || 'pista',
          item_quantity: item.quantity,
          item_unit_price: item.unit_price,
          item_subtotal: item.subtotal,
        });
      }
    }
  }
  return rows;
}

export async function validateOrder(orderId: string, producerId: string): Promise<boolean> {
  const idx = orders.findIndex(o => o.id === orderId && !o.validated_at);
  if (idx === -1) return false;
  orders[idx].validated_at = new Date().toISOString();
  return true;
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  return orders.filter(o => o.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  return orderItems.filter(oi => oi.order_id === orderId);
}

export async function findUserByEmailOrCpf(identifier: string): Promise<{ user_id: string; user_name: string; user_email: string } | null> {
  const user = Object.values(MOCK_USERS).find(u => u.email === identifier || u.profile.cpf === identifier);
  if (!user) return null;
  return { user_id: user.profile.user_id, user_name: user.profile.name, user_email: user.email };
}

export async function transferOrder(orderId: string, fromUserId: string, toUserId: string): Promise<boolean> {
  const idx = orders.findIndex(o => o.id === orderId && o.user_id === fromUserId && o.status === 'confirmed' && !o.validated_at);
  if (idx === -1) return false;
  orders[idx].user_id = toUserId;
  orders[idx].updated_at = new Date().toISOString();
  return true;
}

export async function createOrder(eventId: string, userId: string, items: CartItem[]): Promise<Order | null> {
  for (const item of items) {
    const success = await decreaseAvailability(item.ticket_location_id, item.quantity);
    if (!success) return null;
  }

  const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const now = new Date().toISOString();
  const order: Order = {
    id: generateId(),
    event_id: eventId,
    user_id: userId,
    total_amount: totalAmount,
    status: 'confirmed',
    validated_at: null,
    stripe_session_id: null,
    created_at: now,
    updated_at: now,
  };
  orders.push(order);

  for (const item of items) {
    const loc = MOCK_TICKET_LOCATIONS.find(l => l.id === item.ticket_location_id);
    const isGroup = loc && (loc.location_type === 'camarote_grupo' || loc.location_type === 'bistro') && loc.group_size > 1;

    if (isGroup) {
      for (let i = 0; i < loc.group_size * item.quantity; i++) {
        orderItems.push({
          id: generateId(),
          order_id: order.id,
          ticket_location_id: item.ticket_location_id,
          quantity: 1,
          unit_price: i === 0 ? item.unit_price * item.quantity : 0,
          subtotal: i === 0 ? item.quantity * item.unit_price : 0,
          validation_code: generateValidationCode(),
          created_at: now,
          updated_at: now,
        });
      }
    } else {
      orderItems.push({
        id: generateId(),
        order_id: order.id,
        ticket_location_id: item.ticket_location_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price,
        validation_code: generateValidationCode(),
        created_at: now,
        updated_at: now,
      });
    }
  }

  return order;
}

// Mock ticket code lookup
export async function getMyTicketCodes(orderId: string, userId: string) {
  const order = orders.find(o => o.id === orderId && o.user_id === userId);
  if (!order) return [];
  const items = orderItems.filter(oi => oi.order_id === orderId);
  return items.map(item => {
    const loc = MOCK_TICKET_LOCATIONS.find(l => l.id === item.ticket_location_id);
    return {
      item_id: item.id,
      validation_code: item.validation_code,
      location_name: loc?.name || '—',
      quantity: item.quantity,
    };
  });
}

export async function lookupTicketByCode(code: string, producerId: string) {
  const item = orderItems.find(oi => oi.validation_code.toUpperCase() === code.toUpperCase());
  if (!item) return null;
  const order = orders.find(o => o.id === item.order_id);
  if (!order) return null;
  const evt = MOCK_EVENTS.find(e => e.id === order.event_id && e.created_by === producerId);
  if (!evt) return null;
  const loc = MOCK_TICKET_LOCATIONS.find(l => l.id === item.ticket_location_id);
  const buyer = Object.values(MOCK_USERS).find(u => u.profile.user_id === order.user_id);
  return {
    is_valid: order.status === 'confirmed',
    order_id: order.id,
    event_title: evt.title,
    location_name: loc?.name || '—',
    buyer_name: buyer?.profile.name || '—',
    item_quantity: item.quantity,
    is_already_validated: !!order.validated_at,
    validation_code: item.validation_code,
  };
}

export async function adminLookupTicketByCode(code: string) {
  const item = orderItems.find(oi => oi.validation_code.toUpperCase() === code.toUpperCase());
  if (!item) return null;
  const order = orders.find(o => o.id === item.order_id);
  if (!order) return null;
  const evt = MOCK_EVENTS.find(e => e.id === order.event_id);
  if (!evt) return null;
  const loc = MOCK_TICKET_LOCATIONS.find(l => l.id === item.ticket_location_id);
  const buyer = Object.values(MOCK_USERS).find(u => u.profile.user_id === order.user_id);
  const producer = Object.values(MOCK_USERS).find(u => u.profile.user_id === evt.created_by);
  return {
    is_valid: order.status === 'confirmed',
    order_id: order.id,
    event_title: evt.title,
    location_name: loc?.name || '—',
    buyer_name: buyer?.profile.name || '—',
    item_quantity: item.quantity,
    is_already_validated: !!order.validated_at,
    validation_code: item.validation_code,
    producer_name: producer?.profile.name || '—',
  };
}

export async function adminValidateOrder(orderId: string): Promise<boolean> {
  const idx = orders.findIndex(o => o.id === orderId && !o.validated_at);
  if (idx === -1) return false;
  orders[idx].validated_at = new Date().toISOString();
  return true;
}
