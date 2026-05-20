import { useCallback, useEffect, useState } from 'react';

import { CATEGORIES } from '@/src/constants/categories';

export function useCategories() {
  const [data, setData] = useState(CATEGORIES);
  const [loading] = useState(false);

  const refresh = useCallback(() => {
    setData(CATEGORIES);
  }, []);

  useEffect(() => {
    setData(CATEGORIES);
  }, []);

  return { data, loading, error: null, refresh };
}
