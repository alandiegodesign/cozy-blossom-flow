import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Event = Tables<'events'>;
export type EventInsert = TablesInsert<'events'>;
export type EventUpdate = TablesUpdate<'events'>;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function fetchEventsViaEdge(creatorId?: string): Promise<Event[]> {
  const url = new URL(`${SUPABASE_URL}/functions/v1/get-events`);
  if (creatorId) url.searchParams.set('creator_id', creatorId);
  
  const session = (await supabase.auth.getSession()).data.session;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  
  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${session?.access_token || SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
      },
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`Edge function error: ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function getEvents(): Promise<Event[]> {
  return fetchEventsViaEdge();
}

export async function getEventsByCreator(userId: string): Promise<Event[]> {
  return fetchEventsViaEdge(userId);
}

export async function getDeletedEventsByCreator(userId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('created_by', userId)
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getEvent(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createEvent(data: EventInsert): Promise<Event> {
  const { data: event, error } = await supabase
    .from('events')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return event;
}

export async function updateEvent(id: string, data: EventUpdate): Promise<Event> {
  const { data: event, error } = await supabase
    .from('events')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return event;
}

export async function softDeleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').update({ deleted_at: new Date().toISOString() } as any).eq('id', id);
  if (error) throw error;
}

export async function restoreEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').update({ deleted_at: null } as any).eq('id', id);
  if (error) throw error;
}

export async function permanentlyDeleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleEventVisibility(id: string, isVisible: boolean): Promise<void> {
  const { error } = await supabase.from('events').update({ is_visible: isVisible } as any).eq('id', id);
  if (error) throw error;
}
