import { Event } from '@/types/models';
import { getItems, setItems, generateId, now } from './storage';

const KEY = 'ticketapp_events';

function ensureDefaults(): void {
  const events = getItems<Event>(KEY);
  if (events.length === 0) {
    const mock: Event[] = [
      {
        id: 'event-1',
        title: 'Festival Neon Nights',
        description: 'A maior festa eletrônica do ano com DJs internacionais, shows ao vivo e experiências imersivas de luz e som.',
        date: '2026-04-15',
        time: '22:00',
        banner_image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop',
        map_image: '',
        created_by: 'user-1',
        created_at: now(),
        updated_at: now(),
      },
      {
        id: 'event-2',
        title: 'Rock in Arena',
        description: 'Festival de rock com as melhores bandas nacionais e internacionais. 3 palcos, food trucks e área de camping.',
        date: '2026-05-20',
        time: '16:00',
        banner_image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop',
        map_image: '',
        created_by: 'user-1',
        created_at: now(),
        updated_at: now(),
      },
      {
        id: 'event-3',
        title: 'Sunset Lounge',
        description: 'Experiência premium ao ar livre com DJ sets, coquetéis artesanais e vista panorâmica do pôr do sol.',
        date: '2026-06-10',
        time: '17:00',
        banner_image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=400&fit=crop',
        map_image: '',
        created_by: 'user-1',
        created_at: now(),
        updated_at: now(),
      },
    ];
    setItems(KEY, mock);
  }
}

export function getEvents(): Event[] {
  ensureDefaults();
  return getItems<Event>(KEY);
}

export function getEvent(id: string): Event | undefined {
  return getEvents().find(e => e.id === id);
}

export function createEvent(data: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Event {
  const events = getEvents();
  const event: Event = { ...data, id: generateId(), created_at: now(), updated_at: now() };
  setItems(KEY, [...events, event]);
  return event;
}

export function updateEvent(id: string, data: Partial<Event>): Event | undefined {
  const events = getEvents();
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return undefined;
  events[idx] = { ...events[idx], ...data, updated_at: now() };
  setItems(KEY, events);
  return events[idx];
}

export function deleteEvent(id: string): void {
  setItems(KEY, getEvents().filter(e => e.id !== id));
}
