import { useCallback, useEffect, useState } from 'react';

import {
  acceptBooking,
  declineBooking,
  getJobsForProvider,
  getPendingRequestsForProvider,
  getTodayJobsForProvider,
  getWeekEarningsForProvider,
} from '@/src/services/bookingService';

export function useProviderDashboard(providerId) {
  const [pending, setPending] = useState([]);
  const [today, setToday] = useState([]);
  const [weekEarnings, setWeekEarnings] = useState(0);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!providerId) {
      setPending([]);
      setToday([]);
      setWeekEarnings(0);
      setAllJobs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [p, t, w, all] = await Promise.all([
        getPendingRequestsForProvider(providerId),
        getTodayJobsForProvider(providerId),
        getWeekEarningsForProvider(providerId),
        getJobsForProvider(providerId),
      ]);
      setPending(p);
      setToday(t);
      setWeekEarnings(w);
      setAllJobs(all);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    load();
  }, [load]);

  const accept = useCallback(
    async (bookingId) => {
      setPending((prev) => prev.filter((b) => b.id !== bookingId));
      try {
        await acceptBooking(bookingId);
        await load();
      } catch (e) {
        setError(e);
        load();
      }
    },
    [load],
  );

  const decline = useCallback(
    async (bookingId) => {
      setPending((prev) => prev.filter((b) => b.id !== bookingId));
      try {
        await declineBooking(bookingId);
        await load();
      } catch (e) {
        setError(e);
        load();
      }
    },
    [load],
  );

  return {
    pending,
    today,
    weekEarnings,
    allJobs,
    loading,
    error,
    refresh: load,
    accept,
    decline,
  };
}
