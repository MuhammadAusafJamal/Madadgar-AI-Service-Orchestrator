import { useCallback, useEffect, useState } from 'react';

import { getServices } from '@/src/services/serviceService';

export function useServices({ categoryIds = [], search = '', max = 50 } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const key = JSON.stringify({ categoryIds, search, max });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getServices({ categoryIds, search, max });
      setData(items);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
