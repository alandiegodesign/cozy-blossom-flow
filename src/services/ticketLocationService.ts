import { MOCK_TICKET_LOCATIONS, MockTicketLocation, generateId } from '@/mock/data';

export type TicketLocation = MockTicketLocation;
export type TicketLocationInsert = Partial<MockTicketLocation> & { event_id: string; name: string; location_type: string };
export type TicketLocationUpdate = Partial<MockTicketLocation>;

export type LocationType = 'pista' | 'vip' | 'camarote' | 'camarote_grupo' | 'bistro' | 'sofa';

const LOCATION_COLORS: Record<string, string> = {
  pista: '#9D4EDD',
  vip: '#F72585',
  camarote: '#FF6D00',
  camarote_grupo: '#7209B7',
  bistro: '#00B4D8',
  sofa: '#E85D04',
};

export function getLocationColor(type: string): string {
  return LOCATION_COLORS[type] || '#9D4EDD';
}

// In-memory store
let locations = [...MOCK_TICKET_LOCATIONS];

export async function getLocationsByEvent(eventId: string): Promise<TicketLocation[]> {
  return locations
    .filter(l => l.event_id === eventId)
    .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at));
}

export async function updateLocationSortOrders(updates: { id: string; sort_order: number }[]): Promise<void> {
  for (const u of updates) {
    const idx = locations.findIndex(l => l.id === u.id);
    if (idx !== -1) locations[idx].sort_order = u.sort_order;
  }
}

export async function getLocation(id: string): Promise<TicketLocation | null> {
  return locations.find(l => l.id === id) || null;
}

export async function createLocation(data: TicketLocationInsert): Promise<TicketLocation> {
  const now = new Date().toISOString();
  const loc: TicketLocation = {
    id: generateId(),
    event_id: data.event_id,
    name: data.name,
    location_type: data.location_type,
    description: data.description || null,
    price: data.price || 0,
    quantity: data.quantity || 0,
    available_quantity: data.available_quantity ?? data.quantity ?? 0,
    is_active: data.is_active ?? true,
    is_sold_out: data.is_sold_out ?? false,
    color: data.color || LOCATION_COLORS[data.location_type] || '#9D4EDD',
    sort_order: data.sort_order || 0,
    group_size: data.group_size || 1,
    created_at: now,
    updated_at: now,
  };
  locations.push(loc);
  return loc;
}

export async function updateLocation(id: string, data: TicketLocationUpdate): Promise<void> {
  const idx = locations.findIndex(l => l.id === id);
  if (idx !== -1) locations[idx] = { ...locations[idx], ...data, updated_at: new Date().toISOString() };
}

export async function deleteLocation(id: string): Promise<void> {
  locations = locations.filter(l => l.id !== id);
}

export async function decreaseAvailability(id: string, qty: number): Promise<boolean> {
  const idx = locations.findIndex(l => l.id === id);
  if (idx === -1 || locations[idx].available_quantity < qty) return false;
  locations[idx].available_quantity -= qty;
  return true;
}

export async function toggleLocationActive(id: string, isActive: boolean): Promise<void> {
  const idx = locations.findIndex(l => l.id === id);
  if (idx !== -1) locations[idx].is_active = isActive;
}

export async function toggleLocationSoldOut(id: string, isSoldOut: boolean): Promise<void> {
  const idx = locations.findIndex(l => l.id === id);
  if (idx !== -1) locations[idx].is_sold_out = isSoldOut;
}
