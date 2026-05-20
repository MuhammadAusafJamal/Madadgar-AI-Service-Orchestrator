import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '@/src/context/AuthContext';
import {
  getFavouritesForUser,
  setFavourite,
  unsetFavourite,
} from '@/src/services/favouriteService';

// Single source of truth for the signed-in user's favourites. Every screen
// (service cards, the Favourites tab) reads/writes through this context, so a
// favourite toggled anywhere updates everywhere instantly — no per-screen
// re-fetch and no stale lists.
const FavouritesContext = createContext({
  favourites: [],
  favouriteIds: new Set(),
  loading: true,
  isFavourite: () => false,
  toggle: async () => {},
  refresh: async () => {},
});

const favDocId = (uid, itemId) => `${uid}_${itemId}`;

export function FavouritesProvider({ children }) {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user?.uid) {
      setFavourites([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const items = await getFavouritesForUser(user.uid);
      setFavourites(items);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Load once, and reload whenever the signed-in user changes.
  useEffect(() => {
    refresh();
  }, [refresh]);

  const favouriteIds = useMemo(
    () => new Set(favourites.map((f) => f.itemId)),
    [favourites],
  );

  const isFavourite = useCallback(
    (itemId) => favouriteIds.has(itemId),
    [favouriteIds],
  );

  // Flip the favourite optimistically so the UI reacts instantly, then
  // persist. If the write fails we re-sync from Firestore so the UI never
  // shows a favourite that wasn't actually saved.
  const toggle = useCallback(
    async (itemId, itemData = {}) => {
      if (!user?.uid || !itemId) return;
      const currentlyFav = favourites.some((f) => f.itemId === itemId);

      if (currentlyFav) {
        setFavourites((prev) => prev.filter((f) => f.itemId !== itemId));
      } else {
        setFavourites((prev) => [
          { id: favDocId(user.uid, itemId), itemId, itemData, createdAt: null },
          ...prev,
        ]);
      }

      try {
        if (currentlyFav) {
          await unsetFavourite(user.uid, itemId);
        } else {
          await setFavourite(user.uid, itemId, itemData);
        }
      } catch (err) {
        refresh();
      }
    },
    [user?.uid, favourites, refresh],
  );

  const value = useMemo(
    () => ({ favourites, favouriteIds, loading, isFavourite, toggle, refresh }),
    [favourites, favouriteIds, loading, isFavourite, toggle, refresh],
  );

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
}

export const useFavourites = () => useContext(FavouritesContext);
