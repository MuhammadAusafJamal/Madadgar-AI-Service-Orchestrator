import { useCallback, useEffect, useState } from 'react';

import { getProviderById } from '@/src/services/providerService';
import { getReviewsForService } from '@/src/services/reviewService';
import { getServiceById } from '@/src/services/serviceService';

export function useServiceDetail(serviceId) {
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!serviceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const svc = await getServiceById(serviceId);
      setService(svc);
      if (svc?.providerId) {
        const [prov, revs] = await Promise.all([
          getProviderById(svc.providerId),
          getReviewsForService(serviceId),
        ]);
        setProvider(prov);
        setReviews(revs);
      } else {
        setProvider(null);
        setReviews([]);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    load();
  }, [load]);

  return { service, provider, reviews, loading, error, refresh: load };
}
