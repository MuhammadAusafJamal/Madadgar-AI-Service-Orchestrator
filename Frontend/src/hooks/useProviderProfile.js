import { useCallback, useEffect, useState } from 'react';

import { getProviderById } from '@/src/services/providerService';
import { getReviewsForProvider } from '@/src/services/reviewService';
import { getServicesByProvider } from '@/src/services/serviceService';

export function useProviderProfile(providerId) {
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!providerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [p, s, r] = await Promise.all([
        getProviderById(providerId),
        getServicesByProvider(providerId),
        getReviewsForProvider(providerId),
      ]);
      setProvider(p);
      setServices(s);
      setReviews(r);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    load();
  }, [load]);

  return { provider, services, reviews, loading, error, refresh: load };
}
