import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import snapshotText from './publicDataSnapshot.json?raw';
import { isPublicData, markCached, mergeNewerCache, type PublicData } from './publicData';

const STORAGE_KEY = 'murshidi.public-data.v1';
const snapshot: unknown = JSON.parse(snapshotText);
if (!isPublicData(snapshot)) throw new Error('Invalid bundled public-data snapshot');
const bundledSnapshot: PublicData = snapshot;

function initialData(): PublicData {
  try {
    const cachedText = localStorage.getItem(STORAGE_KEY);
    if (cachedText && cachedText.length < 4_000_000) {
      const cached: unknown = JSON.parse(cachedText);
      if (isPublicData(cached)) return markCached(mergeNewerCache(bundledSnapshot, cached));
    }
  } catch { /* The bundled snapshot also works with storage disabled. */ }
  return markCached(bundledSnapshot);
}

interface PublicDataContextValue {
  data: PublicData;
  loading: boolean;
  refreshing: boolean;
  canRefresh: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const PublicDataContext = createContext<PublicDataContextValue | null>(null);

function publicDataEndpoint(force: boolean): string | null {
  const configuredBase = String(import.meta.env.VITE_PUBLIC_DATA_API_URL ?? '').trim();
  if (configuredBase) {
    try {
      const base = new URL(configuredBase);
      if (base.protocol !== 'https:') return null;
      return new URL(`/api/public-data${force ? '?refresh=1' : ''}`, `${base.origin}/`).toString();
    } catch { return null; }
  }
  return Capacitor.isNativePlatform() ? null : `/api/public-data${force ? '?refresh=1' : ''}`;
}

export function PublicDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PublicData>(initialData);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<Promise<void> | null>(null);
  const mounted = useRef(true);
  const canRefresh = publicDataEndpoint(false) !== null;

  const load = useCallback((force: boolean): Promise<void> => {
    if (inFlight.current) return inFlight.current;
    if (force) setRefreshing(true);
    const endpoint = publicDataEndpoint(force);
    if (!endpoint) {
      setLoading(false);
      setRefreshing(false);
      return Promise.resolve();
    }
    const request = (async () => {
      try {
        const response = await fetch(endpoint, {
          headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(force ? 100_000 : 12_000), cache: 'no-store',
        });
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('PUBLIC_DATA_UNAVAILABLE');
        if (Number(response.headers.get('content-length')) > 4_000_000) throw new Error('PUBLIC_DATA_INVALID');
        const text = await response.text();
        if (text.length > 4_000_000) throw new Error('PUBLIC_DATA_INVALID');
        const incoming: unknown = JSON.parse(text);
        if (!isPublicData(incoming)) throw new Error('PUBLIC_DATA_INVALID');
        if (!mounted.current) return;
        setData(incoming);
        setError(incoming.sources.some(source => source.status === 'stale' || source.status === 'unavailable') ? 'SOME_SOURCES_UNAVAILABLE' : null);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(incoming)); } catch { /* Storage is optional. */ }
      } catch {
        if (!mounted.current) return;
        setError('PUBLIC_DATA_UNAVAILABLE');
        setData(current => ({ ...current, sources: current.sources.map(source => ({
          ...source, status: source.status === 'unavailable' ? 'unavailable' : 'stale',
          error: 'تعذّر التحقق الآن؛ تُعرض آخر بيانات محفوظة بتاريخها الأصلي.',
        })) }));
      } finally {
        inFlight.current = null;
        if (mounted.current) { setLoading(false); setRefreshing(false); }
      }
    })();
    inFlight.current = request;
    return request;
  }, []);

  useEffect(() => {
    mounted.current = true;
    const initialRequest = window.setTimeout(() => { void load(false); }, 0);
    return () => { window.clearTimeout(initialRequest); mounted.current = false; };
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);
  return <PublicDataContext.Provider value={{ data, loading, refreshing, canRefresh, error, refresh }}>{children}</PublicDataContext.Provider>;
}

// Context and hook are deliberately colocated, matching LangContext.
// eslint-disable-next-line react-refresh/only-export-components
export function usePublicData() {
  const context = useContext(PublicDataContext);
  if (!context) throw new Error('usePublicData requires PublicDataProvider');
  return context;
}
