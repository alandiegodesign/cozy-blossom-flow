import { TicketLocation } from '@/types/models';
import { getItems, setItems, generateId, now } from './storage';

const KEY = 'ticketapp_locations';

const LOCATION_COLORS: Record<string, string> = {
  pista: '#9D4EDD',
  vip: '#F72585',
  camarote: '#FF6D00',
  bistro: '#00B4D8',
};

function ensureDefaults(): void {
  const locs = getItems<TicketLocation>(KEY);
  if (locs.length === 0) {
    const mock: TicketLocation[] = [
      { id: 'loc-1', event_id: 'event-1', location_type: 'pista', name: 'Pista Geral', description: 'Acesso à pista principal', price: 80, quantity: 500, available_quantity: 500, color: LOCATION_COLORS.pista, created_at: now(), updated_at: now() },
      { id: 'loc-2', event_id: 'event-1', location_type: 'vip', name: 'Área VIP', description: 'Acesso VIP com open bar', price: 200, quantity: 100, available_quantity: 100, color: LOCATION_COLORS.vip, created_at: now(), updated_at: now() },
      { id: 'loc-3', event_id: 'event-1', location_type: 'camarote', name: 'Camarote Premium', description: 'Camarote exclusivo com vista privilegiada', price: 500, quantity: 30, available_quantity: 30, color: LOCATION_COLORS.camarote, created_at: now(), updated_at: now() },
      { id: 'loc-4', event_id: 'event-1', location_type: 'bistro', name: 'Bistrô Lounge', description: 'Área gastronômica com serviço exclusivo', price: 350, quantity: 50, available_quantity: 50, color: LOCATION_COLORS.bistro, created_at: now(), updated_at: now() },
      { id: 'loc-5', event_id: 'event-2', location_type: 'pista', name: 'Pista', description: 'Pista geral', price: 120, quantity: 1000, available_quantity: 1000, color: LOCATION_COLORS.pista, created_at: now(), updated_at: now() },
      { id: 'loc-6', event_id: 'event-2', location_type: 'vip', name: 'VIP', description: 'Área VIP', price: 300, quantity: 200, available_quantity: 200, color: LOCATION_COLORS.vip, created_at: now(), updated_at: now() },
      { id: 'loc-7', event_id: 'event-3', location_type: 'vip', name: 'Lounge VIP', description: 'Área lounge premium', price: 250, quantity: 80, available_quantity: 80, color: LOCATION_COLORS.vip, created_at: now(), updated_at: now() },
      { id: 'loc-8', event_id: 'event-3', location_type: 'bistro', name: 'Bistrô Sunset', description: 'Jantar com vista do pôr do sol', price: 400, quantity: 40, available_quantity: 40, color: LOCATION_COLORS.bistro, created_at: now(), updated_at: now() },
    ];
    setItems(KEY, mock);
  }
}

export function getLocationsByEvent(eventId: string): TicketLocation[] {
  ensureDefaults();
  return getItems<TicketLocation>(KEY).filter(l => l.event_id === eventId);
}

export function getLocation(id: string): TicketLocation | undefined {
  ensureDefaults();
  return getItems<TicketLocation>(KEY).find(l => l.id === id);
}

export function createLocation(data: Omit<TicketLocation, 'id' | 'created_at' | 'updated_at'>): TicketLocation {
  ensureDefaults();
  const all = getItems<TicketLocation>(KEY);
  const loc: TicketLocation = { ...data, id: generateId(), created_at: now(), updated_at: now() };
  setItems(KEY, [...all, loc]);
  return loc;
}

export function updateLocation(id: string, data: Partial<TicketLocation>): void {
  ensureDefaults();
  const all = getItems<TicketLocation>(KEY);
  const idx = all.findIndex(l => l.id === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...data, updated_at: now() };
    setItems(KEY, all);
  }
}

export function deleteLocation(id: string): void {
  ensureDefaults();
  setItems(KEY, getItems<TicketLocation>(KEY).filter(l => l.id !== id));
}

export function decreaseAvailability(id: string, qty: number): boolean {
  ensureDefaults();
  const all = getItems<TicketLocation>(KEY);
  const idx = all.findIndex(l => l.id === id);
  if (idx === -1 || all[idx].available_quantity < qty) return false;
  all[idx].available_quantity -= qty;
  all[idx].updated_at = now();
  setItems(KEY, all);
  return true;
}

export function getLocationColor(type: string): string {
  return LOCATION_COLORS[type] || '#9D4EDD';
}
