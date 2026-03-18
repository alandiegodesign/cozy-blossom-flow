// Mock data for the entire application

export interface MockEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  end_date: string | null;
  end_time: string | null;
  location_name: string | null;
  location_address: string | null;
  banner_image: string | null;
  map_image: string | null;
  tags: any;
  policies: any;
  is_visible: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sales_end_time: string | null;
}

export interface MockProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string | null;
  user_type: 'cliente' | 'produtor';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockTicketLocation {
  id: string;
  event_id: string;
  name: string;
  location_type: string;
  description: string | null;
  price: number;
  quantity: number;
  available_quantity: number;
  is_active: boolean;
  is_sold_out: boolean;
  color: string | null;
  sort_order: number;
  group_size: number;
  created_at: string;
  updated_at: string;
}

export interface MockOrder {
  id: string;
  event_id: string;
  user_id: string;
  total_amount: number;
  status: string;
  validated_at: string | null;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockOrderItem {
  id: string;
  order_id: string;
  ticket_location_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  validation_code: string;
  created_at: string;
  updated_at: string;
}

// --- Users ---
export const MOCK_USERS: Record<string, { email: string; password: string; profile: MockProfile }> = {
  'user-cliente-1': {
    email: 'cliente@demo.com',
    password: '123456',
    profile: {
      id: 'prof-1',
      user_id: 'user-cliente-1',
      name: 'João Silva',
      email: 'cliente@demo.com',
      phone: '(11) 99999-0001',
      cpf: '12345678901',
      user_type: 'cliente',
      avatar_url: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  },
  'user-produtor-1': {
    email: 'produtor@demo.com',
    password: '123456',
    profile: {
      id: 'prof-2',
      user_id: 'user-produtor-1',
      name: 'Maria Produtora',
      email: 'produtor@demo.com',
      phone: '(11) 99999-0002',
      cpf: '98765432100',
      user_type: 'produtor',
      avatar_url: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  },
};

// --- Events ---
const today = new Date();
const futureDate = new Date(today);
futureDate.setDate(futureDate.getDate() + 30);
const pastDate = new Date(today);
pastDate.setDate(pastDate.getDate() - 15);

export const MOCK_EVENTS: MockEvent[] = [
  {
    id: 'evt-1',
    title: 'Festival Good Vibes 2026',
    description: 'O maior festival de música e cultura da região. Venha curtir um dia incrível!',
    date: futureDate.toISOString().slice(0, 10),
    time: '16:00',
    end_date: null,
    end_time: '23:00',
    location_name: 'Parque Central',
    location_address: 'Rua das Flores, 123 - Centro',
    banner_image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    map_image: null,
    tags: ['música', 'festival', 'ao ar livre'],
    policies: [{ title: 'Idade mínima', description: '18 anos' }],
    is_visible: true,
    created_by: 'user-produtor-1',
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
    deleted_at: null,
    sales_end_time: null,
  },
  {
    id: 'evt-2',
    title: 'Noite Eletrônica',
    description: 'Uma noite especial com os melhores DJs da cena eletrônica.',
    date: futureDate.toISOString().slice(0, 10),
    time: '22:00',
    end_date: null,
    end_time: '05:00',
    location_name: 'Club Vibe',
    location_address: 'Av. Paulista, 1000',
    banner_image: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800',
    map_image: null,
    tags: ['eletrônica', 'festa', 'DJ'],
    policies: [],
    is_visible: true,
    created_by: 'user-produtor-1',
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-01T00:00:00Z',
    deleted_at: null,
    sales_end_time: null,
  },
  {
    id: 'evt-3',
    title: 'Show Acústico (Rascunho)',
    description: 'Um show intimista com voz e violão.',
    date: futureDate.toISOString().slice(0, 10),
    time: '20:00',
    end_date: null,
    end_time: null,
    location_name: 'Bar do João',
    location_address: null,
    banner_image: null,
    map_image: null,
    tags: [],
    policies: [],
    is_visible: false,
    created_by: 'user-produtor-1',
    created_at: '2025-02-10T00:00:00Z',
    updated_at: '2025-02-10T00:00:00Z',
    deleted_at: null,
    sales_end_time: null,
  },
  {
    id: 'evt-past-1',
    title: 'Reveillon 2025',
    description: 'Festa de ano novo.',
    date: pastDate.toISOString().slice(0, 10),
    time: '21:00',
    end_date: null,
    end_time: '04:00',
    location_name: 'Praia Grande',
    location_address: null,
    banner_image: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800',
    map_image: null,
    tags: ['festa'],
    policies: [],
    is_visible: true,
    created_by: 'user-produtor-1',
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    deleted_at: null,
    sales_end_time: null,
  },
];

// --- Ticket Locations ---
export const MOCK_TICKET_LOCATIONS: MockTicketLocation[] = [
  {
    id: 'loc-1',
    event_id: 'evt-1',
    name: 'Pista',
    location_type: 'pista',
    description: 'Acesso à pista principal',
    price: 80,
    quantity: 500,
    available_quantity: 420,
    is_active: true,
    is_sold_out: false,
    color: '#9D4EDD',
    sort_order: 0,
    group_size: 1,
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
  {
    id: 'loc-2',
    event_id: 'evt-1',
    name: 'Área VIP',
    location_type: 'vip',
    description: 'Área VIP com open bar',
    price: 200,
    quantity: 100,
    available_quantity: 75,
    is_active: true,
    is_sold_out: false,
    color: '#F72585',
    sort_order: 1,
    group_size: 1,
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
  {
    id: 'loc-3',
    event_id: 'evt-1',
    name: 'Camarote Gold',
    location_type: 'camarote_grupo',
    description: 'Camarote para 10 pessoas',
    price: 1500,
    quantity: 10,
    available_quantity: 8,
    is_active: true,
    is_sold_out: false,
    color: '#FF6D00',
    sort_order: 2,
    group_size: 10,
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
  {
    id: 'loc-4',
    event_id: 'evt-2',
    name: 'Pista',
    location_type: 'pista',
    description: 'Acesso geral',
    price: 60,
    quantity: 300,
    available_quantity: 250,
    is_active: true,
    is_sold_out: false,
    color: '#9D4EDD',
    sort_order: 0,
    group_size: 1,
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-01T00:00:00Z',
  },
];

// --- Orders ---
export const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'ord-1',
    event_id: 'evt-1',
    user_id: 'user-cliente-1',
    total_amount: 280,
    status: 'confirmed',
    validated_at: null,
    stripe_session_id: null,
    created_at: '2025-02-15T10:00:00Z',
    updated_at: '2025-02-15T10:00:00Z',
  },
];

export const MOCK_ORDER_ITEMS: MockOrderItem[] = [
  {
    id: 'oi-1',
    order_id: 'ord-1',
    ticket_location_id: 'loc-1',
    quantity: 2,
    unit_price: 80,
    subtotal: 160,
    validation_code: 'ABC12345',
    created_at: '2025-02-15T10:00:00Z',
    updated_at: '2025-02-15T10:00:00Z',
  },
  {
    id: 'oi-2',
    order_id: 'ord-1',
    ticket_location_id: 'loc-2',
    quantity: 1,
    unit_price: 120,
    subtotal: 120,
    validation_code: 'DEF67890',
    created_at: '2025-02-15T10:00:00Z',
    updated_at: '2025-02-15T10:00:00Z',
  },
];

// Admin user IDs
export const ADMIN_USER_IDS = ['user-produtor-1'];

// Helper to generate IDs
let idCounter = 1000;
export function generateId(): string {
  return `mock-${++idCounter}`;
}

export function generateValidationCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
