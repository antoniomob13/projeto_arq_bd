export type HistoryEntry = {
  id: string;
  timestamp: number; // ms since epoch
  user: string; // quem inseriu
  action: 'insercao' | string;
  entity?: string; // nome/identificador opcional
  category?: 'cliente' | 'sistema' | 'outro';
};

const KEY = 'history.entries.v1';

function read(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as HistoryEntry[];
    if (Array.isArray(arr)) return arr;
    return [];
  } catch {
    return [];
  }
}

function write(entries: HistoryEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export const historyStore = {
  all(): HistoryEntry[] {
    return read().sort((a, b) => b.timestamp - a.timestamp);
  },
  add(entry: Omit<HistoryEntry, 'id' | 'timestamp'> & { timestamp?: number }) {
    const list = read();
    const item: HistoryEntry = {
      id: Math.random().toString(36).slice(2),
      timestamp: entry.timestamp ?? Date.now(),
      user: entry.user,
      action: entry.action,
      entity: entry.entity,
      category: entry.category ?? 'outro',
    };
    list.push(item);
    write(list);
    window.dispatchEvent(new CustomEvent('history-updated'));
    return item;
  },
  clear() {
    write([]);
    window.dispatchEvent(new CustomEvent('history-updated'));
  },
};
