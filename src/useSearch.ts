import Fuse from "fuse.js";
import { useState, useEffect, useRef, useCallback } from "react";
import { authorize, GetPlaylists } from "./spotify/api";

export const useSearch = () => {
  const [isLoading, setIsLoading] = useState(true);
  const originalItems = useRef<SpotifyApi.PlaylistObjectSimplified[]>([]);
  const [items, setItems] = useState<SpotifyApi.PlaylistObjectSimplified[]>([]);

  useEffect(() => {
    (async () => {
      await authorize();
      const playlists = await GetPlaylists();
      originalItems.current = playlists;
      setItems(playlists);
      setIsLoading(false);
    })();
  }, []);

  const search = useCallback(
    (searchTerm: string) => {
      if (!searchTerm) {
        setItems(originalItems.current);
        return;
      }
      if (items) {
        const fuse = new Fuse(items, { keys: ["name"], includeScore: true });
        const reducedItems = fuse.search(searchTerm);
        setItems(reducedItems.map((x) => x.item));
      }
    },
    [items, setItems, originalItems.current]
  );

  return {
    search,
    items,
    isLoading
  };
};
