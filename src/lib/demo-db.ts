export type Client = {
  id: string;
  name: string;
  /** E.164, e.g. +919876543210 — each client can be any reachable mobile (yours, teammate, client). */
  phone: string;
  status: "In Progress" | "Pending Review" | "Paused";
  last_update_sent_at: Date | null;
  pending_checklist: string[];
  pending_summary: string;
  warning_level: number;
};

/** Client shape returned by GET /api/clients and used in the communications UI. */
export type ClientWire = {
  id: string;
  name: string;
  phone: string;
  status: Client["status"];
  warning_level: number;
  last_update_sent_at: string | null;
  pending_checklist: string[];
};

export function clientToWire(c: Client): ClientWire {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    status: c.status,
    warning_level: c.warning_level,
    last_update_sent_at: c.last_update_sent_at?.toISOString() ?? null,
    pending_checklist: c.pending_checklist,
  };
}

/**
 * In dev, Next.js hot-reloads API routes and resets module scope — a plain `const clients = []`
 * would empty the list while the browser still holds old client IDs → "Client not found".
 * Attaching the store to globalThis keeps one list per Node process across HMR.
 */
const globalForDb = globalThis as typeof globalThis & {
  __freelancerOnboardingDemo?: { clients: Client[]; counter: number };
};

function getStore(): { clients: Client[]; counter: number } {
  if (!globalForDb.__freelancerOnboardingDemo) {
    globalForDb.__freelancerOnboardingDemo = { clients: [], counter: 1 };
  }
  return globalForDb.__freelancerOnboardingDemo;
}

export function getClients(): Client[] {
  return getStore().clients;
}

export function getClient(id: string): Client | undefined {
  return getStore().clients.find((c) => c.id === id);
}

export function addClient(name: string, phone: string): Client {
  const store = getStore();
  const client: Client = {
    id: `client-${String(store.counter++).padStart(3, "0")}`,
    name,
    phone,
    status: "In Progress",
    last_update_sent_at: null,
    pending_checklist: [],
    pending_summary: "",
    warning_level: 0,
  };
  store.clients.push(client);
  return client;
}

export function deleteClient(id: string): boolean {
  const { clients } = getStore();
  const index = clients.findIndex((c) => c.id === id);
  if (index === -1) return false;
  clients.splice(index, 1);
  return true;
}

export function updateClient(id: string, patch: Partial<Client>): Client {
  const client = getClient(id);
  if (!client) throw new Error(`Client ${id} not found`);
  Object.assign(client, patch);
  return client;
}
