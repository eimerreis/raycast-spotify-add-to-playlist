import Fuse from "fuse.js";
import { useState, useCallback } from "react";
import { GetPlaylists } from "./spotify/get-playlists";
import { useCachedPromise } from "@raycast/utils";

export const useSearch = () => {
  const { isLoading, data: playlists } = useCachedPromise(GetPlaylists, []);
  const [items, setItems] = useState<SpotifyApi.PlaylistObjectSimplified[]>([]);

  const search = useCallback(
    (searchTerm: string) => {
      if (!searchTerm) {
        setItems(playlists || []);
        return;
      }
      if (playlists) {
        const fuse = new Fuse(items, { keys: ["name"], includeScore: true });
        const reducedItems = fuse.search(searchTerm);
        setItems(reducedItems.map((x) => x.item));
      }
    },
    [items, setItems, playlists]
  );

  return {
    search,
    items,
    isLoading,
  };
};
