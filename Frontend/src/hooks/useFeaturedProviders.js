import { useCallback, useEffect, useState } from 'react';

import { getFeaturedProviders } from '@/src/services/providerService';
import { getServicesByProvider } from '@/src/services/serviceService';

export function useFeaturedProviders(max = 6) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const providers = await getFeaturedProviders(max);
      const enriched = await Promise.all(
        providers.map(async (p) => {
          const services = await getServicesByProvider(p.id);
          return {
            ...p,
            topServiceId: services[0]?.id || null,
            servicesCount: services.length,
          };
        }),
      );
      setData(enriched);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [max]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
