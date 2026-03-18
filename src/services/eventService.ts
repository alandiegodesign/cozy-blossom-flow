import { MOCK_EVENTS, MockEvent, generateId } from '@/mock/data';

export type Event = MockEvent;
export type EventInsert = Partial<MockEvent> & { title: string; date: string; created_by: string };
export type EventUpdate = Partial<MockEvent>;

// In-memory store
let events = [...MOCK_EVENTS];

export async function getEvents(): Promise<Event[]> {
  const today = new Date().toISOString().slice(0, 10);
  return events
    .filter(e => !e.deleted_at && e.is_visible && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getEventsByCreator(userId: string): Promise<Event[]> {
  return events
    .filter(e => e.created_by === userId && !e.deleted_at)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getDeletedEventsByCreator(userId: string): Promise<Event[]> {
  return events
    .filter(e => e.created_by === userId && e.deleted_at)
    .sort((a, b) => (b.deleted_at || '').localeCompare(a.deleted_at || ''));
}

export async function getEvent(id: string): Promise<Event | null> {
  return events.find(e => e.id === id) || null;
}

export async function createEvent(data: EventInsert): Promise<Event> {
  const now = new Date().toISOString();
  const event: Event = {
    id: generateId(),
    title: data.title,
    description: data.description || '',
    date: data.date,
    time: data.time || '00:00',
    end_date: data.end_date || null,
    end_time: data.end_time || null,
    location_name: data.location_name || null,
    location_address: data.location_address || null,
    banner_image: data.banner_image || null,
    map_image: data.map_image || null,
    tags: data.tags || [],
    policies: data.policies || [],
    is_visible: data.is_visible ?? true,
    created_by: data.created_by,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    sales_end_time: data.sales_end_time || null,
  };
  events.push(event);
  return event;
}

export async function updateEvent(id: string, data: EventUpdate): Promise<Event> {
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) throw new Error('Event not found');
  events[idx] = { ...events[idx], ...data, updated_at: new Date().toISOString() };
  return events[idx];
}

export async function softDeleteEvent(id: string): Promise<void> {
  const idx = events.findIndex(e => e.id === id);
  if (idx !== -1) events[idx].deleted_at = new Date().toISOString();
}

export async function restoreEvent(id: string): Promise<void> {
  const idx = events.findIndex(e => e.id === id);
  if (idx !== -1) events[idx].deleted_at = null;
}

export async function permanentlyDeleteEvent(id: string): Promise<void> {
  events = events.filter(e => e.id !== id);
}

export async function toggleEventVisibility(id: string, isVisible: boolean): Promise<void> {
  const idx = events.findIndex(e => e.id === id);
  if (idx !== -1) events[idx].is_visible = isVisible;
}
